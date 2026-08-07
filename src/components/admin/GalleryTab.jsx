import React, { useState, useRef } from 'react';
import { useGallery } from '../../hooks/useGallery'; // Adjust import path
import {
    Trash2,
    Plus,
    Loader2,
    Image as ImageIcon,
    Edit,
    X,
    AlertTriangle,
    Calendar,
    Upload
} from 'lucide-react';
import toast from 'react-hot-toast'; // Assuming you are using this based on FacultyTab

// Sub-component to handle individual card state (Read more/Show less)
const AdminGalleryCard = ({ image, onEdit, onDelete, formatDate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_LENGTH = 100;
    const caption = image.caption || '';
    const isLongText = caption.length > MAX_LENGTH;

    const displayText = (!isExpanded && isLongText)
        ? caption.slice(0, MAX_LENGTH).trim() + '...'
        : caption;

    return (
        <div className="group flex flex-col bg-white rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
            {/* Image Container */}
            <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                <img
                    src={image.image_url}
                    alt={caption}
                    className="w-full h-full object-cover"
                />
                {/* Action Overlay */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-sm backdrop-blur-sm">
                    <button
                        onClick={() => onEdit(image)}
                        className="p-1.5 text-teal-700 hover:bg-teal-100 rounded transition-colors"
                        title="Edit Post"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(image)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete Post"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-3 flex flex-col flex-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {formatDate(image.date || image.created_at)}
                    </span>
                </div>

                <p className="text-xs text-slate-800 font-medium break-words">
                    {displayText}
                </p>

                {isLongText && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-teal-600 hover:text-teal-800 font-semibold text-[10px] mt-1.5 self-start focus:outline-none transition-colors"
                    >
                        {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>
        </div>
    );
};

export function GalleryTab() {
    const { images, loading, uploading, addImage, removeImage, updateImage } = useGallery();

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editingImage, setEditingImage] = useState(null);

    // Form State
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        caption: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // --- HANDLERS ---

    const handleOpenModal = (image = null) => {
        if (image) {
            setEditingImage(image);
            setFormData({
                caption: image.caption || '',
                date: image.date || (image.created_at ? image.created_at.split('T')[0] : '')
            });
        } else {
            setEditingImage(null);
            setFormData({
                caption: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
        setFile(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading(editingImage ? 'Updating post...' : 'Creating post...');

        try {
            if (editingImage) {
                // Update existing post
                const result = await updateImage(
                    editingImage.id,
                    editingImage.storage_path,
                    file, // Might be null if they only changed text
                    formData.caption,
                    formData.date
                );
                if (result.success) toast.success('Post updated successfully!', { id: loadingToast });
                else throw new Error(result.error);
            } else {
                // Add new post
                if (!file) throw new Error("Please select an image.");
                const result = await addImage(file, formData.caption, formData.date);
                if (result.success) toast.success('Post created successfully!', { id: loadingToast });
                else throw new Error(result.error);
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
        const loadingToast = toast.loading('Deleting post...');
        try {
            await removeImage(deleteTarget.id, deleteTarget.storage_path);
            toast.success('Post deleted successfully!', { id: loadingToast });
            setDeleteTarget(null);
        } catch (error) {
            toast.error(`Error: ${error.message}`, { id: loadingToast });
        }
    };

    // Format date for display (e.g., "Aug 15, 2026")
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="p-6 space-y-6">

            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="font-bold text-lg text-slate-900">Gallery Management</h2>
                    <p className="text-xs text-slate-500">Manage campus photos and event galleries.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Post</span>
                    </button>
                </div>
            </div>

            {/* Gallery Grid Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
                        <Loader2 className="w-6 h-6 animate-spin mb-3 text-teal-600" />
                        <p>Loading gallery records...</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                        <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm font-medium">No posts found.</p>
                        <p className="text-slate-400 text-xs mt-1">Click "Add New Post" to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image) => (
                            <AdminGalleryCard
                                key={image.id}
                                image={image}
                                onEdit={handleOpenModal}
                                onDelete={setDeleteTarget}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- ADD / EDIT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-sm">
                                {editingImage ? 'Edit Post Details' : 'Create New Post'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">

                            {/* Image Upload */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    {editingImage ? 'Replace Image (Optional)' : 'Select Image'}
                                </label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="gallery-image-upload"
                                        ref={fileInputRef}
                                        onChange={(e) => setFile(e.target.files[0])}
                                        required={!editingImage} // Required only if adding new
                                    />
                                    <label htmlFor="gallery-image-upload" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="w-6 h-6 text-teal-600 mb-2" />
                                        <span className="font-semibold text-slate-700">
                                            {file ? file.name : editingImage ? 'Click to replace existing image' : 'Click to browse image'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Event Date */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Event Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                    className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600"
                                />
                            </div>

                            {/* Caption */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Caption (short one)</label>
                                <textarea
                                    value={formData.caption}
                                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                    required
                                    rows="3"
                                    placeholder="Enter a description for this post..."
                                    className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-teal-600 resize-none"
                                />
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting || uploading}
                                    className="px-4 py-2.5 text-xs font-bold bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || uploading || (!file && !editingImage)}
                                    className="px-4 py-2.5 text-xs font-bold text-white bg-teal-700 rounded-lg hover:bg-teal-800 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]"
                                >
                                    {isSubmitting || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-slate-900 text-base">Delete Post?</h3>
                            <p className="text-xs text-slate-500">
                                Are you sure you want to delete this image? The photo and caption will be permanently removed.
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

        </div>
    );
}