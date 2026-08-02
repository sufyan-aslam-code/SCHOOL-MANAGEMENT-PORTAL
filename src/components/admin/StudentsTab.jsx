import React, { useState } from 'react';
import {
    Users,
    Search,
    Loader2,
    AlertCircle,
    FileText,
    Trash2,
    X,
    Upload,
    Plus,
    Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { useStudents, useClasses, useSessions } from '../../hooks/useSchoolData';
import { supabase } from '../../lib/supabase';

export const StudentsTab = () => {
    // --- State Management ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSession, setSelectedSession] = useState('');

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

    // Bulk Options Scopes
    const [deleteScope, setDeleteScope] = useState({ type: 'all', value: '' });

    // Loading State for Submissions
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Entity States for Edit/Delete
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [studentToDelete, setStudentToDelete] = useState(null);

    // Form States (Unified for Add & Edit)
    const [formData, setFormData] = useState({
        roll_no: '',
        first_name: '',
        last_name: '',
        class_id: '',
        session_name: '',
        gender: ''
    });
    const [csvFile, setCsvFile] = useState(null);

    // --- Data Fetching ---
    const { students, isLoading: loadingStudents, mutate: refetchStudents } = useStudents() || {};
    const { classes } = useClasses() || {};
    const { sessions, mutate: refetchSessions } = useSessions() || {};

    // --- Helper: Find or Create Session Dynamically ---
    const getOrCreateSessionId = async (sessionInput) => {
        if (!sessionInput) return null;

        const sessionStr = String(sessionInput).trim();

        let { data: existingSession } = await supabase
            .from('sessions')
            .select('id')
            .ilike('name', sessionStr)
            .maybeSingle();

        if (existingSession) {
            return existingSession.id;
        }

        const { data: newSession, error: insertError } = await supabase
            .from('sessions')
            .insert([{ name: sessionStr, is_active: false }])
            .select('id')
            .single();

        if (insertError) throw insertError;
        if (refetchSessions) refetchSessions();
        return newSession.id;
    };

    // --- Helper: Cleanup Session if Empty ---
    const checkAndDeleteOrphanedSession = async (sessionId) => {
        if (!sessionId) return;

        const { count, error } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', sessionId);

        if (!error && count === 0) {
            await supabase.from('sessions').delete().eq('id', sessionId);
            if (refetchSessions) refetchSessions();
        }
    };

    // --- Modal Handlers ---
    const openAddModal = () => {
        setEditingStudentId(null);
        setFormData({ roll_no: '', first_name: '', last_name: '', class_id: '', session_name: '', gender: '' });
        setIsFormModalOpen(true);
    };

    const openEditModal = (student) => {
        setEditingStudentId(student.id);
        setFormData({
            roll_no: student.roll_no,
            first_name: student.name,
            last_name: student.father_name || '',
            class_id: student.class_id,
            session_name: student.session_name || '',
            gender: student.gender || ''
        });
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (student) => {
        setStudentToDelete(student);
        setIsDeleteModalOpen(true);
    };

    // --- Submit Handlers ---
    const handleSaveStudent = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading(editingStudentId ? 'Updating student...' : 'Saving student...');

        try {
            let oldSessionId = null;
            if (editingStudentId) {
                const oldStudent = (students || []).find(s => s.id === editingStudentId);
                oldSessionId = oldStudent?.session_id;
            }

            const resolvedSessionId = await getOrCreateSessionId(formData.session_name);

            const studentPayload = {
                roll_no: parseInt(formData.roll_no, 10),
                name: formData.first_name,
                father_name: formData.last_name,
                class_id: formData.class_id,
                session_id: resolvedSessionId,
                gender: formData.gender
            };

            if (editingStudentId) {
                const { error } = await supabase
                    .from('students')
                    .update(studentPayload)
                    .eq('id', editingStudentId);

                if (error) throw error;

                if (oldSessionId && oldSessionId !== resolvedSessionId) {
                    await checkAndDeleteOrphanedSession(oldSessionId);
                }

                toast.success('Student updated successfully!', { id: loadingToast });
            } else {
                const { error } = await supabase
                    .from('students')
                    .insert([studentPayload]);

                if (error) throw error;
                toast.success('Student added successfully!', { id: loadingToast });
            }

            if (refetchStudents) refetchStudents();
            if (refetchSessions) refetchSessions();
            setIsFormModalOpen(false);
        } catch (error) {
            if (error.code === '23505') {
                toast.error('This Roll Number already exists in this Class and Session.', { id: loadingToast });
            } else {
                toast.error(`Failed to save: ${error.message}`, { id: loadingToast });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;

        const loadingToast = toast.loading('Deleting student...');
        setIsSubmitting(true);
        const targetSessionId = studentToDelete.session_id;

        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', studentToDelete.id);

            if (error) throw error;

            await checkAndDeleteOrphanedSession(targetSessionId);

            toast.success('Student deleted successfully!', { id: loadingToast });
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);

            if (refetchStudents) refetchStudents();
        } catch (error) {
            toast.error(`Error deleting student: ${error.message}`, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDeleteAll = async () => {
        setIsSubmitting(true);
        const loadingToast = toast.loading('Deleting students and cleaning sessions...');

        try {
            let query = supabase.from('students').delete();

            if (deleteScope.type === 'class' && deleteScope.value) {
                query = query.eq('class_id', deleteScope.value);
            } else if (deleteScope.type === 'session' && deleteScope.value) {
                query = query.eq('session_id', deleteScope.value);
            } else {
                query = query.neq('id', '00000000-0000-0000-0000-000000000000');
            }

            const { error } = await query;
            if (error) throw error;

            const { data: allSessions } = await supabase.from('sessions').select('id');
            if (allSessions) {
                for (const s of allSessions) {
                    await checkAndDeleteOrphanedSession(s.id);
                }
            }

            toast.success('Deletion completed successfully!', { id: loadingToast });
            setIsDeleteAllModalOpen(false);
            if (refetchStudents) refetchStudents();
            if (refetchSessions) refetchSessions();
        } catch (error) {
            toast.error(`Failed to delete: ${error.message}`, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            toast.error("Please select a CSV file first.");
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Processing CSV and managing sessions...');

        const { data: dbClasses } = await supabase.from('classes').select('id, name');

        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const parsedData = results.data;

                    if (parsedData.length === 0) {
                        throw new Error("The CSV file appears to be empty.");
                    }

                    const formattedData = [];

                    for (let index = 0; index < parsedData.length; index++) {
                        const row = parsedData[index];
                        if (!row.roll_no || !row.name || !row.class_id || !row.session_id) {
                            throw new Error(`Row ${index + 1} is missing required fields.`);
                        }

                        const csvClassName = String(row.class_id).trim().toLowerCase();
                        const matchedClass = dbClasses?.find(
                            c => String(c.name).trim().toLowerCase() === csvClassName
                        );
                        if (!matchedClass) {
                            throw new Error(`Row ${index + 1}: Class "${row.class_id}" does not match any database record.`);
                        }

                        const sessionUuid = await getOrCreateSessionId(row.session_id);

                        formattedData.push({
                            roll_no: parseInt(row.roll_no, 10),
                            name: row.name,
                            father_name: row.father_name || null,
                            gender: row.gender || null,
                            class_id: matchedClass.id,
                            session_id: sessionUuid,
                            result_file_url: row.result_file_url || null
                        });
                    }

                    toast.loading(`Inserting ${formattedData.length} students...`, { id: loadingToast });

                    const { error } = await supabase
                        .from('students')
                        .insert(formattedData);

                    if (error) throw error;

                    toast.success(`Successfully imported ${formattedData.length} students!`, { id: loadingToast });
                    setCsvFile(null);
                    setIsImportModalOpen(false);

                    if (refetchStudents) refetchStudents();
                    if (refetchSessions) refetchSessions();

                } catch (error) {
                    if (error.code === '23505') {
                        toast.error('Import failed: Duplicate Roll Number found for a Class and Session.', { id: loadingToast, duration: 6000 });
                    } else {
                        toast.error(`${error.message}`, { id: loadingToast, duration: 6000 });
                    }
                } finally {
                    setIsSubmitting(false);
                }
            },
            error: (error) => {
                toast.error(`Error reading file: ${error.message}`, { id: loadingToast });
                setIsSubmitting(false);
            }
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCsvFile(e.target.files[0]);
        }
    };

    // --- Data Processing & Sorting ---
    const filteredStudents = (students || []).filter(student => {
        const matchesSearch =
            `${student.name || ''} ${student.father_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.roll_no?.toString().includes(searchQuery);

        const matchesClass = selectedClass === '' || student.class_id == selectedClass;
        const matchesSession = selectedSession === '' || student.session_id == selectedSession;

        return matchesSearch && matchesClass && matchesSession;
    }).sort((a, b) => {
        const classA = a.class_name || '';
        const classB = b.class_name || '';
        if (classA !== classB) {
            return classA.localeCompare(classB, undefined, { numeric: true });
        }

        const sessionA = a.session_name || '';
        const sessionB = b.session_name || '';
        if (sessionA !== sessionB) {
            return sessionA.localeCompare(sessionB, undefined, { numeric: true });
        }

        return (a.roll_no || 0) - (b.roll_no || 0);
    });

    return (
        <div className="p-6 space-y-6">
            {/* Directory Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="font-bold text-lg text-slate-900">Student Directory Management</h2>
                        <p className="text-xs text-slate-500">Manage student profiles, rolls, and institutional records.</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setIsDeleteAllModalOpen(true)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete All Records</span>
                        </button>

                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition-colors"
                        >
                            <Upload className="w-4 h-4 text-emerald-400" />
                            <span>Import CSV</span>
                        </button>

                        <button
                            onClick={openAddModal}
                            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Student</span>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="p-4 bg-white rounded-lg border border-slate-200 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or roll no..."
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

                {/* Table Section */}
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                                <th className="p-3 border-r border-slate-200">S.No</th>
                                <th className="p-3 border-r border-slate-200">Roll No</th>
                                <th className="p-3 border-r border-slate-200">First Name</th>
                                <th className="p-3 border-r border-slate-200">Last Name</th>
                                <th className="p-3 border-r border-slate-200">Class</th>
                                <th className="p-3 border-r border-slate-200">Session</th>
                                <th className="p-3 border-r border-slate-200">Gender</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loadingStudents ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500 text-sm">
                                        Loading students...
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500 text-sm">
                                        No students found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student, index) => (
                                    <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                        <td className="p-3 border-r border-slate-200 text-slate-500 font-medium">{index + 1}</td>
                                        <td className="p-3 border-r border-slate-200 text-slate-900">{student.roll_no}</td>
                                        <td className="p-3 border-r border-slate-200 text-slate-900 font-medium">{student.name}</td>
                                        <td className="p-3 border-r border-slate-200 text-slate-600">{student.father_name || '-'}</td>
                                        <td className="p-3 border-r border-slate-200 text-slate-600">{student.class_name || '-'}</td>
                                        <td className="p-3 border-r border-slate-200 text-slate-600">{student.session_name || '-'}</td>
                                        <td className="p-3 border-r border-slate-200 text-slate-600">{student.gender || '-'}</td>
                                        <td className="p-3 text-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(student)}
                                                className="p-1.5 text-teal-700 hover:bg-teal-100 rounded transition-colors"
                                                title="Edit Student Info"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(student)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                title="Delete Student"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Add/Edit Student Modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-sm">
                                {editingStudentId ? 'Edit Student Details' : 'Add New Student'}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveStudent} className="p-5 space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">First Name</label>
                                    <input required type="text" className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600"
                                        value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                                    <input required type="text" className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600"
                                        value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                                <input required type="number" min="1" className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600"
                                    value={formData.roll_no} onChange={e => setFormData({ ...formData, roll_no: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Class</label>
                                    <select required className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600 bg-white"
                                        value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })}>
                                        <option value="">Select Class</option>
                                        {(classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Session Name (e.g. 1st Semester 2026-27)</label>
                                    <input required type="text" placeholder="e.g. 1st Semester 2026-27" className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600"
                                        value={formData.session_name} onChange={e => setFormData({ ...formData, session_name: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                                <select required className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600 bg-white"
                                    value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsFormModalOpen(false)} disabled={isSubmitting}
                                    className="px-4 py-2.5 text-xs font-bold bg-slate-100 rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting}
                                    className="px-4 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg disabled:opacity-50">
                                    {isSubmitting ? 'Saving...' : (editingStudentId ? 'Update Record' : 'Save Record')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 text-base">Delete Student</h3>
                            <p className="text-xs text-slate-500">
                                Are you sure you want to delete <span className="font-semibold text-slate-700">{studentToDelete?.name} {studentToDelete?.father_name}</span> (Roll: {studentToDelete?.roll_no})? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => { setIsDeleteModalOpen(false); setStudentToDelete(null); }}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteStudent}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete All / By Class / By Session Modal */}
            {isDeleteAllModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-base">Bulk Delete Students</h3>
                            <p className="text-xs text-slate-500">
                                Select scope to delete students. Orphaned sessions will be automatically cleaned up.
                            </p>

                            <div className="space-y-2 text-left">
                                <label className="block text-[11px] font-bold text-slate-700">Delete Scope Type</label>
                                <select
                                    className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white font-medium"
                                    value={deleteScope.type}
                                    onChange={(e) => setDeleteScope({ type: e.target.value, value: '' })}
                                >
                                    <option value="all">All Students (Entire School)</option>
                                    <option value="class">By Specific Class</option>
                                    <option value="session">By Specific Session</option>
                                </select>

                                {deleteScope.type === 'class' && (
                                    <select
                                        className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white font-medium mt-2"
                                        value={deleteScope.value}
                                        onChange={(e) => setDeleteScope({ ...deleteScope, value: e.target.value })}
                                    >
                                        <option value="">Select Class</option>
                                        {(classes || []).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                )}

                                {deleteScope.type === 'session' && (
                                    <select
                                        className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white font-medium mt-2"
                                        value={deleteScope.value}
                                        onChange={(e) => setDeleteScope({ ...deleteScope, value: e.target.value })}
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
                                onClick={() => setIsDeleteAllModalOpen(false)}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDeleteAll}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Deleting...' : 'Proceed Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import CSV Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                Import Students from CSV
                            </h3>
                            <button onClick={() => { setIsImportModalOpen(false); setCsvFile(null); }} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCsvUpload} className="p-5 space-y-4 text-xs">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
                                <input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={handleFileChange} />
                                <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                                    {csvFile ? (
                                        <>
                                            <FileText className="w-8 h-8 text-teal-600 mb-2" />
                                            <span className="font-semibold text-slate-700">{csvFile.name}</span>
                                            <span className="text-[10px] text-teal-600 mt-0.5">Click to change file</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                            <span className="font-semibold text-teal-600 mb-1">Click to browse CSV file</span>
                                            <span className="text-[10px] text-slate-400">or drag and drop your CSV file here</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button type="button" onClick={() => { setIsImportModalOpen(false); setCsvFile(null); }} disabled={isSubmitting}
                                    className="px-4 py-2.5 text-xs font-bold bg-slate-100 rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" disabled={!csvFile || isSubmitting}
                                    className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50">
                                    {isSubmitting ? 'Uploading...' : 'Upload CSV'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsTab;