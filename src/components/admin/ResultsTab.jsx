import React, { useState, useRef } from 'react';
import {
    FileText,
    Upload,
    Search,
    Trash2,
    FileCheck,
    FileX,
    RefreshCw,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudents, useClasses, useSessions } from '../../hooks/useSchoolData';
import { supabase } from '../../lib/supabase';

export const ResultsTab = () => {
    // --- State Management ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal & Scope States for Bulk Actions
    const [isClearResultsModalOpen, setIsClearResultsModalOpen] = useState(false);
    const [clearResultScope, setClearResultScope] = useState({ type: 'all', value: '' });

    // --- Data Fetching ---
    const { students, isLoading: loadingStudents, mutate: refetchStudents } = useStudents() || {};
    const { classes } = useClasses() || {};
    const { sessions } = useSessions() || {};

    // --- Single Result File Actions (Upload/Replace) ---
    const handleResultUpload = async (student, file) => {
        if (!file) return;
        const loadingToast = toast.loading(`Uploading result for ${student.name}...`);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `result_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('students')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('students')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('students')
                .update({ result_file_url: publicUrlData.publicUrl })
                .eq('id', student.id);

            if (updateError) throw updateError;

            toast.success('Result file uploaded successfully!', { id: loadingToast });
            if (refetchStudents) refetchStudents();
        } catch (error) {
            toast.error(`Failed to upload: ${error.message}`, { id: loadingToast });
        }
    };

    // --- Remove Single Result File ---
    const handleRemoveResult = async (student) => {
        const loadingToast = toast.loading('Removing result file...');
        try {
            const { error } = await supabase
                .from('students')
                .update({ result_file_url: null })
                .eq('id', student.id);

            if (error) throw error;

            toast.success('Result file removed successfully!', { id: loadingToast });
            if (refetchStudents) refetchStudents();
        } catch (error) {
            toast.error(`Failed to remove result: ${error.message}`, { id: loadingToast });
        }
    };

    // --- Bulk Clear Results ---
    const handleConfirmClearResults = async () => {
        setIsSubmitting(true);
        const loadingToast = toast.loading('Clearing result files...');

        try {
            let query = supabase.from('students').update({ result_file_url: null });

            if (clearResultScope.type === 'class' && clearResultScope.value) {
                query = query.eq('class_id', clearResultScope.value);
            } else if (clearResultScope.type === 'session' && clearResultScope.value) {
                query = query.eq('session_id', clearResultScope.value);
            } else {
                query = query.neq('id', '00000000-0000-0000-0000-000000000000');
            }

            const { error } = await query;
            if (error) throw error;

            toast.success('Result files cleared successfully!', { id: loadingToast });
            setIsClearResultsModalOpen(false);
            if (refetchStudents) refetchStudents();
        } catch (error) {
            toast.error(`Failed to clear results: ${error.message}`, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Filter Students ---
    const filteredStudents = (students || []).filter(student => {
        const matchesSearch =
            `${student.name || ''} ${student.father_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.roll_no?.toString().includes(searchQuery);

        const matchesClass = selectedClass === '' || student.class_id == selectedClass;
        const matchesSession = selectedSession === '' || student.session_id == selectedSession;

        return matchesSearch && matchesClass && matchesSession;
    }).sort((a, b) => (a.roll_no || 0) - (b.roll_no || 0));

    return (
        <div className="p-6 space-y-6">
            {/* Header & Bulk Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="font-bold text-lg text-slate-900">Result Management Dashboard</h2>
                    <p className="text-xs text-slate-500">Upload, manage, and clear student examination result cards (PDF/Image).</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsClearResultsModalOpen(true)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                        <FileX className="w-4 h-4" />
                        <span>Clear All Results</span>
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search student by name or roll no..."
                        className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:border-teal-600 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    className="w-full md:w-48 px-4 py-2 text-xs border border-gray-300 rounded-lg focus:border-teal-600 outline-none bg-white"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    <option value="">All Classes</option>
                    {(classes || []).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select
                    className="w-full md:w-48 px-4 py-2 text-xs border border-gray-300 rounded-lg focus:border-teal-600 outline-none bg-white"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                >
                    <option value="">All Sessions</option>
                    {(sessions || []).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                            <th className="p-3 border-r border-slate-200">S.No</th>
                            <th className="p-3 border-r border-slate-200">Roll No</th>
                            <th className="p-3 border-r border-slate-200">Student Name</th>
                            <th className="p-3 border-r border-slate-200">Father Name</th>
                            <th className="p-3 border-r border-slate-200">Class</th>
                            <th className="p-3 border-r border-slate-200">Session</th>
                            <th className="p-3 text-center">Result Status & File Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loadingStudents ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">
                                    Loading student results...
                                </td>
                            </tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">
                                    No students found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student, index) => (
                                <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 border-r border-slate-200 text-slate-500 font-medium">{index + 1}</td>
                                    <td className="p-3 border-r border-slate-200 text-slate-900 font-medium">{student.roll_no}</td>
                                    <td className="p-3 border-r border-slate-200 text-slate-900 font-bold">{student.name}</td>
                                    <td className="p-3 border-r border-slate-200 text-slate-600">{student.father_name || '-'}</td>
                                    <td className="p-3 border-r border-slate-200 text-slate-600">{student.class_name || '-'}</td>
                                    <td className="p-3 border-r border-slate-200 text-slate-600">{student.session_name || '-'}</td>

                                    <td className="p-3 text-center">
                                        {student.result_file_url ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <a
                                                    href={student.result_file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-teal-700 font-bold hover:underline"
                                                >
                                                    <FileCheck className="w-4 h-4" /> View Result
                                                </a>

                                                <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors" title="Replace Result File">
                                                    <RefreshCw className="w-3 h-3 text-teal-600" />
                                                    <span>Replace</span>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleResultUpload(student, e.target.files[0])}
                                                    />
                                                </label>

                                                <button
                                                    onClick={() => handleRemoveResult(student)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[11px] font-semibold transition-colors"
                                                    title="Delete Result File"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition-colors">
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>Upload Result File</span>
                                                <input
                                                    type="file"
                                                    accept=".pdf,image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleResultUpload(student, e.target.files[0])}
                                                />
                                            </label>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Clear Results Scope Modal */}
            {isClearResultsModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                            <FileX className="w-6 h-6" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-base">Clear Result Files</h3>
                            <p className="text-xs text-slate-500">
                                Choose scope to clear result card uploads. Student profiles will remain intact.
                            </p>

                            <div className="space-y-2 text-left">
                                <label className="block text-[11px] font-bold text-slate-700">Clear Scope Type</label>
                                <select
                                    className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white font-medium"
                                    value={clearResultScope.type}
                                    onChange={(e) => setClearResultScope({ type: e.target.value, value: '' })}
                                >
                                    <option value="all">All Students (Entire School)</option>
                                    <option value="class">By Specific Class</option>
                                    <option value="session">By Specific Session</option>
                                </select>

                                {clearResultScope.type === 'class' && (
                                    <select
                                        className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white font-medium mt-2"
                                        value={clearResultScope.value}
                                        onChange={(e) => setClearResultScope({ ...clearResultScope, value: e.target.value })}
                                    >
                                        <option value="">Select Class</option>
                                        {(classes || []).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                )}

                                {clearResultScope.type === 'session' && (
                                    <select
                                        className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white font-medium mt-2"
                                        value={clearResultScope.value}
                                        onChange={(e) => setClearResultScope({ ...clearResultScope, value: e.target.value })}
                                    >
                                        <option value="">Select Session</option>
                                        {(sessions || []).map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setIsClearResultsModalOpen(false)}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClearResults}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Clearing...' : 'Clear Results'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsTab;