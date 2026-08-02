import React, { useState } from 'react';
import { Plus, Trash2, Edit, Briefcase, X, Upload, FileSpreadsheet, AlertTriangle, Search, FileCheck, RefreshCw, FileX } from 'lucide-react';
import { useFaculty } from '../../hooks/useFaculty';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

export const FacultyTab = () => {
    const { faculty = [], isLoading, addFaculty, updateFaculty, deleteFaculty } = useFaculty();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDesignation, setSelectedDesignation] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [csvFile, setCsvFile] = useState(null);

    // Bulk Delete Scope State (all or specific designation)
    const [deleteScope, setDeleteScope] = useState({ type: 'all', value: '' });

    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        qualification: '',
        subject_specialization: '',
        experience_years: 0
    });

    // Helper function to automatically compute display_order based on designation
    const calculateDisplayOrder = (designation = '') => {
        const desig = designation.toLowerCase().trim();
        if (desig.includes('headmaster') || desig.includes('hm') || desig.includes('principal')) return 1;
        if (desig.includes('sst')) return 2;
        if (desig.includes('ct')) return 3;
        if (desig.includes('pet')) return 4;
        if (desig.includes('qari') || desig.includes('theology') || desig.includes('tt')) return 5;
        if (desig.includes('arabic') || desig.includes('at') || desig.includes('drawing') || desig.includes('dm')) return 6;
        return 7;
    };

    const handleOpenModal = (member = null) => {
        if (member) {
            setEditingFaculty(member);
            setFormData({
                name: member.name || '',
                designation: member.designation || '',
                qualification: member.qualification || '',
                subject_specialization: member.subject_specialization || '',
                experience_years: member.experience_years || 0
            });
        } else {
            setEditingFaculty(null);
            setFormData({
                name: '',
                designation: '',
                qualification: '',
                subject_specialization: '',
                experience_years: 0
            });
        }
        setIsModalOpen(true);
    };

    // --- Inline Single Photo Actions (Add, Replace, Remove) ---
    const handlePhotoUpload = async (member, file) => {
        if (!file) return;
        const loadingToast = toast.loading('Uploading profile photo...');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `faculty_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('faculty')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('faculty')
                .getPublicUrl(fileName);

            await updateFaculty({
                id: member.id,
                data: { photo_url: publicUrlData.publicUrl }
            });

            toast.success('Profile photo updated successfully!', { id: loadingToast });
        } catch (error) {
            console.error("Failed to upload photo:", error);
            toast.error(`Error: ${error.message}`, { id: loadingToast });
        }
    };

    const handleRemovePhoto = async (member) => {
        const loadingToast = toast.loading('Removing profile photo...');
        try {
            await updateFaculty({
                id: member.id,
                data: { photo_url: null }
            });
            toast.success('Profile photo removed successfully!', { id: loadingToast });
        } catch (error) {
            console.error("Failed to remove photo:", error);
            toast.error(`Error: ${error.message}`, { id: loadingToast });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading('Saving faculty record...');

        try {
            const payload = {
                name: formData.name,
                designation: formData.designation,
                qualification: formData.qualification,
                subject_specialization: formData.subject_specialization,
                experience_years: parseInt(formData.experience_years, 10) || 0,
                display_order: calculateDisplayOrder(formData.designation)
            };

            if (editingFaculty) {
                await updateFaculty({ id: editingFaculty.id, data: payload });
                toast.success('Faculty updated successfully!', { id: loadingToast });
            } else {
                await addFaculty(payload);
                toast.success('Faculty added successfully!', { id: loadingToast });
            }

            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save faculty record:", error);
            toast.error(`Error: ${error.message}`, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        const loadingToast = toast.loading('Deleting staff member...');
        try {
            await deleteFaculty(deleteTarget.id);
            toast.success('Faculty member deleted successfully!', { id: loadingToast });
            setDeleteTarget(null);
        } catch (error) {
            console.error("Failed to delete faculty:", error);
            toast.error(`Error: ${error.message}`, { id: loadingToast });
        }
    };

    const handleDeleteAllByScope = async () => {
        const loadingToast = toast.loading('Deleting faculty records...');
        setIsSubmitting(true);
        try {
            let query = supabase.from('faculty').delete();

            if (deleteScope.type === 'designation' && deleteScope.value) {
                query = query.eq('designation', deleteScope.value);
            } else {
                query = query.neq('id', '00000000-0000-0000-0000-000000000000');
            }

            const { error } = await query;
            if (error) throw error;

            toast.success('Faculty records deleted successfully!', { id: loadingToast });
            setIsDeleteAllModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Failed to delete faculty:", error);
            toast.error(`Error: ${error.message}`, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCsvUpload = (e) => {
        e.preventDefault();
        if (!csvFile) {
            toast.error('Please select a CSV file first.');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Importing faculty records from CSV...');

        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rows = results.data;
                    let count = 0;

                    for (const row of rows) {
                        if (!row.name || !row.designation) continue;

                        const designation = row.designation.trim();
                        const payload = {
                            name: row.name.trim(),
                            designation: designation,
                            qualification: (row.qualification || '').trim(),
                            subject_specialization: (row.subject_specialization || row.specialization || '').trim(),
                            experience_years: parseInt(row.experience_years || row.experience, 10) || 0,
                            photo_url: null,
                            display_order: calculateDisplayOrder(designation)
                        };

                        await addFaculty(payload);
                        count++;
                    }

                    toast.success(`Successfully imported ${count} faculty members!`, { id: loadingToast });
                    setIsCsvModalOpen(false);
                    setCsvFile(null);
                } catch (error) {
                    console.error("CSV Import Error:", error);
                    toast.error(`Import failed: ${error.message}`, { id: loadingToast });
                } finally {
                    setIsSubmitting(false);
                }
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                toast.error(`Failed to parse CSV: ${error.message}`, { id: loadingToast });
                setIsSubmitting(false);
            }
        });
    };

    // Extract unique designations for the filter dropdown & bulk delete scope
    const uniqueDesignations = [...new Set((faculty || []).map(m => m.designation).filter(Boolean))];

    // Filter faculty based on search query and designation filter, then sort by display_order
    const filteredFaculty = (faculty || []).filter((member) => {
        const matchesSearch =
            `${member.name || ''} ${member.qualification || ''} ${member.subject_specialization || ''}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesDesignation = selectedDesignation === '' || member.designation === selectedDesignation;

        return matchesSearch && matchesDesignation;
    }).sort((a, b) => {
        const orderA = a.display_order ?? 0;
        const orderB = b.display_order ?? 0;

        if (orderA !== orderB) {
            return orderA - orderB;
        }
        return (a.name || '').localeCompare(b.name || '');
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="font-bold text-lg text-slate-900">Faculty Management</h2>
                    <p className="text-xs text-slate-500">Manage teaching and administrative staff profiles.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setIsDeleteAllModalOpen(true)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete All Staff</span>
                    </button>
                    <button
                        onClick={() => setIsCsvModalOpen(true)}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>Import CSV</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Staff Member</span>
                    </button>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, qualification, or specialization..."
                        className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:border-teal-600 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    className="w-full md:w-56 px-4 py-2 text-xs border border-gray-300 rounded-lg focus:border-teal-600 outline-none bg-white"
                    value={selectedDesignation}
                    onChange={(e) => setSelectedDesignation(e.target.value)}
                >
                    <option value="">All Designations</option>
                    {uniqueDesignations.map((desig, idx) => (
                        <option key={idx} value={desig}>{desig}</option>
                    ))}
                </select>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500 text-sm">Loading faculty records...</div>
                ) : (
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                                <th className="p-3 border-r border-slate-200">Staff Member</th>
                                <th className="p-3 border-r border-slate-200">Designation</th>
                                <th className="p-3 border-r border-slate-200">Qualification</th>
                                <th className="p-3 border-r border-slate-200">Specialization</th>
                                <th className="p-3 border-r border-slate-200">Experience</th>
                                <th className="p-3 border-r border-slate-200">Profile Photo</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFaculty.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500">No faculty records found.</td>
                                </tr>
                            ) : (
                                filteredFaculty.map((member) => (
                                    <tr key={member.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                        <td className="p-3 border-r border-slate-200 font-bold text-slate-900">{member.name}</td>
                                        <td className="p-3 border-r border-slate-200">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200 flex items-center gap-1 w-max">
                                                <Briefcase className="w-3 h-3" /> {member.designation}
                                            </span>
                                        </td>
                                        <td className="p-3 border-r border-slate-200 font-medium">{member.qualification}</td>
                                        <td className="p-3 border-r border-slate-200">{member.subject_specialization}</td>
                                        <td className="p-3 border-r border-slate-200">{member.experience_years} Years</td>

                                        {/* Profile Photo Management Column */}
                                        <td className="p-3 border-r border-slate-200">
                                            {member.photo_url ? (
                                                <div className="flex items-center gap-2">
                                                    <img src={member.photo_url} alt={member.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />

                                                    <label className="cursor-pointer p-1 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded" title="Replace Photo">
                                                        <RefreshCw className="w-3.5 h-3.5" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handlePhotoUpload(member, e.target.files[0])}
                                                        />
                                                    </label>

                                                    <button
                                                        onClick={() => handleRemovePhoto(member)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete Photo"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors">
                                                    <Upload className="w-3 h-3 text-teal-600" />
                                                    <span>Add Photo</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handlePhotoUpload(member, e.target.files[0])}
                                                    />
                                                </label>
                                            )}
                                        </td>

                                        <td className="p-3 text-center space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(member)}
                                                className="p-1.5 text-teal-700 hover:bg-teal-100 rounded transition-colors"
                                                title="Edit Staff Details"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(member)}
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                title="Delete Staff Member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal (Photo Upload Removed) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-sm">
                                {editingFaculty ? 'Edit Staff Details' : 'Add New Staff'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Designation</label>
                                    <input required type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Qualification</label>
                                    <input required type="text" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Subject Specialization</label>
                                    <input required type="text" value={formData.subject_specialization} onChange={(e) => setFormData({ ...formData, subject_specialization: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                                    <input type="number" min="0" value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })} className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2.5 text-xs font-bold bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 text-xs font-bold text-white bg-teal-700 rounded-lg disabled:opacity-50">
                                    {isSubmitting ? 'Saving...' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 text-base">Delete Staff Member?</h3>
                            <p className="text-xs text-slate-500">
                                Are you sure you want to delete <span className="font-semibold text-slate-700">{deleteTarget.name}</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="flex-1 py-2.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Scope Modal */}
            {isDeleteAllModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-base">Bulk Delete Faculty</h3>
                            <p className="text-xs text-slate-500">
                                Select scope to delete faculty members. This action cannot be undone.
                            </p>

                            <div className="space-y-2 text-left">
                                <label className="block text-[11px] font-bold text-slate-700">Delete Scope Type</label>
                                <select
                                    className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white font-medium"
                                    value={deleteScope.type}
                                    onChange={(e) => setDeleteScope({ type: e.target.value, value: '' })}
                                >
                                    <option value="all">All Faculty Members (Entire Institution)</option>
                                    <option value="designation">By Specific Designation</option>
                                </select>

                                {deleteScope.type === 'designation' && (
                                    <select
                                        className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white font-medium mt-2"
                                        value={deleteScope.value}
                                        onChange={(e) => setDeleteScope({ ...deleteScope, value: e.target.value })}
                                    >
                                        <option value="">Select Designation</option>
                                        {uniqueDesignations.map((desig, idx) => (
                                            <option key={idx} value={desig}>{desig}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsDeleteAllModalOpen(false)}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAllByScope}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Deleting...' : 'Proceed Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSV Import Modal */}
            {isCsvModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                Import Faculty from CSV
                            </h3>
                            <button onClick={() => { setIsCsvModalOpen(false); setCsvFile(null); }} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCsvUpload} className="p-5 space-y-4 text-xs">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 space-y-1">
                                <p className="font-bold">CSV Column Requirements:</p>
                                <p className="text-[11px] text-slate-500">
                                    Your CSV file must include headers matching: <code className="text-teal-700 font-semibold">name, designation, qualification, subject_specialization, experience_years</code>
                                </p>
                                <p className="text-[10px] text-slate-400 italic mt-1">Note: Photos can be uploaded manually after importing.</p>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Select CSV File</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        id="faculty-csv-upload"
                                        onChange={(e) => setCsvFile(e.target.files[0])}
                                    />
                                    <label htmlFor="faculty-csv-upload" className="cursor-pointer flex flex-col items-center">
                                        <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-2" />
                                        <span className="font-semibold text-slate-700">{csvFile ? csvFile.name : 'Click to browse CSV file'}</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">Supports standard comma-separated files (.csv)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => { setIsCsvModalOpen(false); setCsvFile(null); }}
                                    disabled={isSubmitting}
                                    className="px-4 py-2.5 text-xs font-bold bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !csvFile}
                                    className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Importing...' : 'Upload & Import'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyTab;