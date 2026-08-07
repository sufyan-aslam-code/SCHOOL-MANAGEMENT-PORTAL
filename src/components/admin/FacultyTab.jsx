import React, { useState } from 'react';
import {
    Briefcase,
    Search,
    Loader2,
    AlertTriangle,
    FileSpreadsheet,
    Trash2,
    X,
    Upload,
    Plus,
    Edit,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { useFaculty } from '../../hooks/useFaculty';
import { supabase } from '../../lib/supabase';

// --- Helper: Convert CSV Date (DD/MM/YYYY) to DB Date (YYYY-MM-DD) ---
const formatCSVDateForDB = (dateStr) => {
    if (!dateStr) return null;
    const trimmed = String(dateStr).trim();
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    const parts = trimmed.split(/[\/\-]/);
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) year = `20${year}`;
        return `${year}-${month}-${day}`;
    }
    return null; 
};

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

    const [deleteScope, setDeleteScope] = useState({ type: 'all', value: '' });

    // Updated Form State
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        qualification: '',
        subject_specialization: '',
        appointment_date: '',
        charge_date: '',
        address: ''
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

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
                appointment_date: member.appointment_date || '',
                charge_date: member.charge_date || '',
                address: member.address || ''
            });
        } else {
            setEditingFaculty(null);
            setFormData({
                name: '',
                designation: '',
                qualification: '',
                subject_specialization: '',
                appointment_date: '',
                charge_date: '',
                address: ''
            });
        }
        setIsModalOpen(true);
    };

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
                appointment_date: formData.appointment_date || null,
                charge_date: formData.charge_date || null,
                address: formData.address,
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
                            appointment_date: formatCSVDateForDB(row.appointment_date),
                            charge_date: formatCSVDateForDB(row.charge_date),
                            address: (row.address || '').trim(),
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

    const uniqueDesignations = [...new Set((faculty || []).map(m => m.designation).filter(Boolean))];

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
        <div className="p-4 sm:p-6 space-y-6">
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
                        <span className="hidden sm:inline">Delete All Staff</span>
                    </button>
                    <button
                        onClick={() => setIsCsvModalOpen(true)}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span className="hidden sm:inline">Import CSV</span>
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
            <div className="p-4 bg-white rounded-lg border border-slate-200 flex flex-col md:flex-row gap-4 shadow-sm">
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
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm custom-scrollbar relative">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500 text-sm">Loading faculty records...</div>
                ) : (
                    <table className="w-full text-left border-collapse text-xs min-w-max">
                        <thead>
                            <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                                <th className="p-3 border-r border-slate-200 whitespace-nowrap">Staff Member</th>
                                <th className="p-3 border-r border-slate-200 whitespace-nowrap">Designation</th>
                                <th className="p-3 border-r border-slate-200 whitespace-nowrap">Qualification</th>
                                <th className="p-3 border-r border-slate-200 whitespace-nowrap">Specialization</th>
                                <th className="p-3 border-r border-slate-200 whitespace-nowrap">Appt. Date</th>
                                <th className="p-3 border-r border-slate-200 whitespace-nowrap">Charge Date</th>
                                <th className="p-3 border-r border-slate-200 whitespace-nowrap">Address</th>
                                <th className="p-3 border-r border-slate-200 whitespace-nowrap">Profile Photo</th>
                                <th className="p-3 text-center whitespace-nowrap sticky right-0 bg-slate-50 border-l border-slate-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredFaculty.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-slate-500 text-sm">No faculty records found.</td>
                                </tr>
                            ) : (
                                filteredFaculty.map((member) => (
                                    <tr key={member.id} className="group border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                        <td className="p-3 border-r border-slate-200 font-bold text-slate-900 whitespace-nowrap">{member.name}</td>
                                        <td className="p-3 border-r border-slate-200 whitespace-nowrap">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200 flex items-center gap-1 w-max">
                                                <Briefcase className="w-3 h-3" /> {member.designation}
                                            </span>
                                        </td>
                                        <td className="p-3 border-r border-slate-200 font-medium whitespace-nowrap">{member.qualification}</td>
                                        <td className="p-3 border-r border-slate-200 whitespace-nowrap">{member.subject_specialization}</td>
                                        <td className="p-3 border-r border-slate-200 whitespace-nowrap">{formatDate(member.appointment_date)}</td>
                                        <td className="p-3 border-r border-slate-200 whitespace-nowrap">{formatDate(member.charge_date)}</td>
                                        <td className="p-3 border-r border-slate-200 max-w-[150px] truncate" title={member.address}>{member.address || '-'}</td>

                                        {/* Profile Photo Management Column */}
                                        <td className="p-3 border-r border-slate-200 whitespace-nowrap">
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

                                        <td className="p-3 text-center space-x-2 whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 border-l border-slate-200 transition-colors shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">
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

            {/* --- Modals --- */}

            {/* Add/Edit Faculty Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm mt-12 sm:mt-16">
                    <div className="relative flex flex-col w-full max-w-xl h-[80vh] max-h-[80vh] bg-white shadow-2xl rounded-xl overflow-hidden my-auto">
                        
                        {/* Sticky Header */}
                        <div className="relative px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0 text-center z-10">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                                {editingFaculty ? 'Edit Staff Details' : 'Add New Staff'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Form Fields Body */}
                        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                            <form id="facultyForm" onSubmit={handleSubmit} className="space-y-3 text-xs">
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Full Name</label>
                                        <input required type="text" className="w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:border-teal-600"
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Designation</label>
                                        <input required type="text" className="w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:border-teal-600"
                                            value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Qualification</label>
                                        <input required type="text" className="w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:border-teal-600"
                                            value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Subject Specialization</label>
                                        <input required type="text" className="w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:border-teal-600"
                                            value={formData.subject_specialization} onChange={e => setFormData({ ...formData, subject_specialization: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Appointment Date</label>
                                        <input type="date" className="w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white"
                                            value={formData.appointment_date} onChange={e => setFormData({ ...formData, appointment_date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-0.5">Charge Date</label>
                                        <input type="date" className="w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white"
                                            value={formData.charge_date} onChange={e => setFormData({ ...formData, charge_date: e.target.value })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-0.5">Address</label>
                                    <textarea rows="3" className="w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none focus:border-teal-600 resize-none"
                                        value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Enter permanent or current address..." />
                                </div>
                            </form>
                        </div>

                        {/* Sticky Footer */}
                        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0 z-10">
                            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}
                                className="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button form="facultyForm" type="submit" disabled={isSubmitting}
                                className="px-3.5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg disabled:opacity-50 transition-colors">
                                {isSubmitting ? 'Saving...' : (editingFaculty ? 'Update Record' : 'Save Record')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm mt-12 sm:mt-16">
                    <div className="flex flex-col w-full max-w-sm bg-white shadow-2xl rounded-xl overflow-hidden my-auto">
                        <div className="p-6 text-center space-y-4 shrink-0">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="px-6 pb-2 space-y-1 text-center">
                            <h3 className="font-bold text-slate-900 text-base">Delete Staff Member?</h3>
                            <p className="text-xs text-slate-500">
                                Are you sure you want to delete <span className="font-semibold text-slate-700">{deleteTarget.name}</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-2 p-6 pt-4 shrink-0">
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
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm mt-12 sm:mt-16">
                    <div className="flex flex-col w-full max-w-sm max-h-[80vh] bg-white shadow-2xl rounded-xl overflow-hidden my-auto">
                        <div className="p-6 pb-4 text-center shrink-0">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="px-6 space-y-3 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                            <div className="text-center">
                                <h3 className="font-bold text-slate-900 text-base">Bulk Delete Faculty</h3>
                                <p className="text-xs text-slate-500">
                                    Select scope to delete faculty members. This action cannot be undone.
                                </p>
                            </div>

                            <div className="space-y-2 text-left mt-4">
                                <label className="block text-[11px] font-bold text-slate-700">Delete Scope Type</label>
                                <select
                                    className="w-full p-2.5 border rounded-lg text-xs outline-none focus:border-teal-600 bg-white font-medium"
                                    value={deleteScope.type}
                                    onChange={(e) => setDeleteScope({ type: e.target.value, value: '' })}
                                >
                                    <option value="all">All Faculty Members</option>
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

                        <div className="flex gap-2 p-6 pt-4 shrink-0">
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
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm mt-12 sm:mt-16">
                    <div className="flex flex-col w-full max-w-md max-h-[80vh] bg-white shadow-2xl rounded-xl overflow-hidden my-auto">
                        <div className="relative px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0 text-center z-10">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center justify-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                Import Faculty from CSV
                            </h3>
                            <button 
                                onClick={() => { setIsCsvModalOpen(false); setCsvFile(null); }} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                            <form id="csvForm" onSubmit={handleCsvUpload} className="space-y-4 text-xs">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 space-y-1">
                                    <p className="font-bold">CSV Column Requirements:</p>
                                    <p className="text-[11px] text-slate-500">
                                        Headers must match: <code className="text-teal-700 font-semibold">name, designation, qualification, subject_specialization, appointment_date, charge_date, address</code>
                                    </p>
                                    <p className="text-[10px] text-slate-400 italic mt-1">Note: Photos can be uploaded manually after importing.</p>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Select CSV File</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
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
                            </form>
                        </div>

                        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0 z-10">
                            <button
                                type="button"
                                onClick={() => { setIsCsvModalOpen(false); setCsvFile(null); }}
                                disabled={isSubmitting}
                                className="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="csvForm"
                                type="submit"
                                disabled={isSubmitting || !csvFile}
                                className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting ? 'Importing...' : 'Upload & Import'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyTab;