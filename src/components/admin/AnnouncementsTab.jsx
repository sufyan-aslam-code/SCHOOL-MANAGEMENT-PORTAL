import React, { useState } from 'react';
import {
    Plus, Edit, Trash2, AlertTriangle, X, Check, XCircle, Upload, Image as ImageIcon, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { supabase } from '../../lib/supabase';

export const AnnouncementsTab = () => {
    const { announcements, isLoading, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editingNotice, setEditingNotice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image_url: '',
        publish_date: new Date().toISOString().split('T')[0],
        is_important: false,
        is_active: true
    });

    const handleOpenModal = (notice = null) => {
        if (notice) {
            setEditingNotice(notice);
            setFormData({
                title: notice.title || '',
                content: notice.content || '',
                image_url: notice.image_url || '',
                publish_date: notice.publish_date || new Date().toISOString().split('T')[0],
                is_important: notice.is_important || false,
                is_active: notice.is_active ?? true
            });
        } else {
            setEditingNotice(null);
            setFormData({
                title: '',
                content: '',
                image_url: '',
                publish_date: new Date().toISOString().split('T')[0],
                is_important: false,
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const loadingToast = toast.loading('Uploading image...');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `notice_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('announcements')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('announcements')
                .getPublicUrl(fileName);

            setFormData({ ...formData, image_url: publicUrlData.publicUrl });
            toast.success('Image uploaded successfully!', { id: loadingToast });
        } catch (error) {
            console.error("Upload Error:", error);
            toast.error(`Upload failed: ${error.message}`, { id: loadingToast });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading('Saving announcement...');

        try {
            if (editingNotice) {
                await updateAnnouncement({ id: editingNotice.id, data: formData });
                toast.success('Announcement updated!', { id: loadingToast });
            } else {
                await addAnnouncement(formData);
                toast.success('Announcement published!', { id: loadingToast });
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(`Error: ${error.message}`, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        const loadingToast = toast.loading('Deleting announcement...');
        try {
            await deleteAnnouncement(deleteTarget.id);
            toast.success('Announcement deleted!', { id: loadingToast });
            setDeleteTarget(null);
        } catch (error) {
            toast.error(`Error: ${error.message}`, { id: loadingToast });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="font-bold text-lg text-slate-900">Notice Board Management</h2>
                    <p className="text-xs text-slate-500">Publish news, events, and important alerts with optional flyers.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition-colors shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Post Announcement</span>
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500 text-sm">Loading announcements...</div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">No announcements posted yet.</div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse text-xs min-w-max">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                                        <th className="p-3 border-r border-slate-200">Date</th>
                                        <th className="p-3 border-r border-slate-200 w-1/3">Title</th>
                                        <th className="p-3 border-r border-slate-200">Image</th>
                                        <th className="p-3 border-r border-slate-200">Status</th>
                                        <th className="p-3 border-r border-slate-200">Priority</th>
                                        <th className="p-3 text-center sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] border-l border-slate-200">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {announcements.map((notice) => (
                                        <tr key={notice.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-3 border-r border-slate-200 text-slate-600 font-medium whitespace-nowrap">{formatDate(notice.publish_date)}</td>
                                            <td className="p-3 border-r border-slate-200 font-bold text-slate-900 truncate max-w-[300px]">{notice.title}</td>
                                            <td className="p-3 border-r border-slate-200 text-slate-500">
                                                {notice.image_url ? <ImageIcon className="w-4 h-4 text-teal-600" /> : '-'}
                                            </td>
                                            <td className="p-3 border-r border-slate-200">
                                                {notice.is_active ? (
                                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 w-max"><Check className="w-3 h-3"/> Active</span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> Hidden</span>
                                                )}
                                            </td>
                                            <td className="p-3 border-r border-slate-200">
                                                {notice.is_important ? (
                                                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold w-max inline-block">High Priority</span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold w-max inline-block">Standard</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center space-x-2 sticky right-0 bg-white z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] border-l border-slate-200">
                                                <button onClick={() => handleOpenModal(notice)} className="p-1.5 text-teal-700 hover:bg-teal-100 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => setDeleteTarget(notice)} className="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Stacked View */}
                        <div className="md:hidden grid grid-cols-1 divide-y divide-slate-100">
                            {announcements.map((notice) => (
                                <div key={notice.id} className={`p-4 space-y-3 ${notice.is_important ? 'bg-red-50/30' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-500">{formatDate(notice.publish_date)}</span>
                                                {notice.is_important && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">Urgent</span>}
                                                {!notice.is_active && <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">Hidden</span>}
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{notice.title}</h3>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                        <button onClick={() => handleOpenModal(notice)} className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg"><Edit className="w-3.5 h-3.5" /> Edit</button>
                                        <button onClick={() => setDeleteTarget(notice)} className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm mt-12 sm:mt-16">
                    <div className="relative flex flex-col w-full max-w-xl h-[85vh] max-h-[85vh] bg-white shadow-2xl rounded-xl overflow-hidden my-auto">
                        <div className="relative px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0 text-center z-10">
                            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                                {editingNotice ? 'Edit Announcement' : 'New Announcement'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                            <form id="noticeForm" onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Announcement Title</label>
                                    <input required type="text" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-teal-600"
                                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Summer Vacation Commences" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Detailed Content</label>
                                    <textarea required rows="5" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-teal-600 resize-none"
                                        value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Write the full announcement details here..." />
                                </div>
                                
                                {/* Image Upload Section */}
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Attach Image / Flyer (Optional)</label>
                                    {formData.image_url ? (
                                        <div className="relative border rounded-lg p-2 bg-slate-50">
                                            <img src={formData.image_url} alt="Attached" className="max-h-32 object-contain rounded w-full" />
                                            <button 
                                                type="button" 
                                                onClick={() => setFormData({ ...formData, image_url: '' })}
                                                className="absolute top-3 right-3 bg-white text-red-600 p-1 rounded-full shadow hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
                                            <input type="file" accept="image/*" id="announcement-image" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                            <label htmlFor="announcement-image" className="cursor-pointer flex flex-col items-center">
                                                {isUploading ? (
                                                    <Loader2 className="w-6 h-6 text-teal-600 animate-spin mb-2" />
                                                ) : (
                                                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                                )}
                                                <span className="font-semibold text-teal-600">{isUploading ? 'Uploading...' : 'Click to upload image'}</span>
                                                <span className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Publish Date</label>
                                    <input required type="date" className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-teal-600 bg-white"
                                        value={formData.publish_date} onChange={e => setFormData({ ...formData, publish_date: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                            checked={formData.is_important} onChange={e => setFormData({ ...formData, is_important: e.target.checked })} />
                                        <span className="font-bold text-red-600 text-sm">Mark as High Priority (Urgent)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                            checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                        <span className="font-bold text-slate-700 text-sm">Visible to Public</span>
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0 z-10">
                            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting || isUploading} className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                            <button form="noticeForm" type="submit" disabled={isSubmitting || isUploading} className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : (editingNotice ? 'Update Announcement' : 'Publish Announcement')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm mt-12 sm:mt-16">
                    <div className="flex flex-col w-full max-w-sm bg-white shadow-2xl rounded-xl overflow-hidden my-auto">
                        <div className="p-6 text-center space-y-4 shrink-0">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="px-6 pb-2 space-y-1 text-center">
                            <h3 className="font-bold text-slate-900 text-base">Delete Announcement?</h3>
                            <p className="text-xs text-slate-500">This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-2 p-6 pt-4 shrink-0">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Cancel</button>
                            <button onClick={handleConfirmDelete} className="flex-1 py-2.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsTab;