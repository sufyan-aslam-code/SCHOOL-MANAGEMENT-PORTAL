import React, { useState, useEffect } from 'react';
import {
    Save, Building, Phone, Mail, User, CheckCircle,
    Loader2, MapPin, Calendar, Image as ImageIcon,
    MessageSquare, Clock, X
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const SettingsTab = () => {
    const { settings, isLoading, updateSettings } = useSettings();

    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingHero, setIsUploadingHero] = useState(false);
    const [isUploadingPrincipal, setIsUploadingPrincipal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        school_name: '',
        emis_code: '',
        district: '',
        province: '',
        established: '',
        phone: '',
        email: '',
        principal_name: '',
        principal_message: '',
        principal_image_url: '',
        hero_heading: '',
        location_address: '',
        hero_image_url: '',
        summer_timings: '',
        winter_timings: '',
        friday_hours: '',
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                school_name: settings.school_name || '',
                emis_code: settings.emis_code || '',
                district: settings.district || '',
                province: settings.province || '',
                established: settings.established || '',
                phone: settings.phone || '',
                email: settings.email || '',
                principal_name: settings.principal_name || '',
                principal_message: settings.principal_message || '',
                principal_image_url: settings.principal_image_url || '',
                hero_heading: settings.hero_heading || 'Empowering the Next Generation of Leaders',
                location_address: settings.location_address || '',
                hero_image_url: settings.hero_image_url || '',
                summer_timings: settings.summer_timings || '07:30 AM - 01:30 PM (Mon - Sat)',
                winter_timings: settings.winter_timings || '08:30 AM - 02:00 PM (Mon - Sat)',
                friday_hours: settings.friday_hours || 'Closing early at 12:00 PM',
            });
        }
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleHeroImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingHero(true);
        const uploadToast = toast.loading('Uploading hero image...');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `hero_image_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('school-assets')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('school-assets')
                .getPublicUrl(fileName);

            setFormData((prev) => ({ ...prev, hero_image_url: publicUrl }));
            toast.success('Hero image uploaded successfully!', { id: uploadToast });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload hero image.', { id: uploadToast });
        } finally {
            setIsUploadingHero(false);
        }
    };

    const handlePrincipalImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingPrincipal(true);
        const uploadToast = toast.loading('Uploading headmaster photo...');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `principal_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('school-assets')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('school-assets')
                .getPublicUrl(fileName);

            setFormData((prev) => ({ ...prev, principal_image_url: publicUrl }));
            toast.success('Headmaster photo uploaded successfully!', { id: uploadToast });
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload headmaster photo.', { id: uploadToast });
        } finally {
            setIsUploadingPrincipal(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const loadingToast = toast.loading('Saving configuration...');

        try {
            await updateSettings(formData);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            toast.success("Settings updated successfully!", { id: loadingToast });
        } catch (error) {
            console.error("Failed to update settings:", error);
            toast.error("Error saving settings to database.", { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-40 sm:h-64 text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                <p className="text-sm font-medium">Loading database configuration...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                <div>
                    <h2 className="font-bold text-lg text-slate-900">School Settings</h2>
                    <p className="text-xs text-slate-500">Manage global portal configurations directly from the database.</p>
                </div>
                {showSuccess && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold animate-pulse">
                        <CheckCircle className="w-4 h-4" />
                        <span>Database Updated!</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 sm:space-y-8">
                {/* General Information Section */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                        <Building className="w-4 h-4 text-slate-500" />
                        <h3 className="font-bold text-sm text-slate-800">General Information</h3>
                    </div>
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">School Name</label>
                            <input
                                type="text" name="school_name" value={formData.school_name} onChange={handleChange} required
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">EMIS Code</label>
                            <input
                                type="text" name="emis_code" value={formData.emis_code} onChange={handleChange} required
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Established Year
                            </label>
                            <input
                                type="text" name="established" value={formData.established} onChange={handleChange} required
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                            <input
                                type="text" name="district" value={formData.district} onChange={handleChange} required
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Province</label>
                            <input
                                type="text" name="province" value={formData.province} onChange={handleChange} required
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Hero Image Section */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                        <h3 className="font-bold text-sm text-slate-800">Homepage Hero Image</h3>
                    </div>
                    <div className="p-4 sm:p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {formData.hero_image_url ? (
                                <div className="relative w-32 h-24 shrink-0">
                                    <img src={formData.hero_image_url} alt="Hero Preview" className="w-full h-full object-cover rounded-lg border border-slate-200 shadow-sm" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, hero_image_url: '' }))}
                                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-500 hover:text-white transition-colors border border-white"
                                        title="Remove Image"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 text-xs shrink-0">No Image</div>
                            )}
                            <div className="flex-1 w-full space-y-2">
                                <label className="block text-xs font-bold text-slate-700">Upload New Portal Hero Image</label>
                                <input type="file" accept="image/*" onChange={handleHeroImageUpload} disabled={isUploadingHero} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Headmaster Message & Profile Section */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                        <h3 className="font-bold text-sm text-slate-800">Headmaster's Information & Message</h3>
                    </div>
                    <div className="p-4 sm:p-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Headmaster Name</label>
                                <input type="text" name="principal_name" value={formData.principal_name} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Headmaster Message Banner Heading</label>
                                <input type="text" name="hero_heading" value={formData.hero_heading} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                            </div>
                        </div>

                        {/* Headmaster Photo Upload */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                            {formData.principal_image_url ? (
                                <div className="relative w-24 h-24 shrink-0">
                                    <img src={formData.principal_image_url} alt="Principal Preview" className="w-full h-full object-cover rounded-full border border-slate-200 shadow-sm" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, principal_image_url: '' }))}
                                        className="absolute top-0 right-0 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-500 hover:text-white transition-colors border border-white"
                                        title="Remove Photo"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 text-xs text-center p-2 shrink-0">No Photo</div>
                            )}
                            <div className="flex-1 w-full space-y-2">
                                <label className="block text-xs font-bold text-slate-700">Upload Headmaster Picture</label>
                                <input type="file" accept="image/*" onChange={handlePrincipalImageUpload} disabled={isUploadingPrincipal} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Headmaster Message Content</label>
                            <textarea name="principal_message" value={formData.principal_message} onChange={handleChange} rows={5} required placeholder="Enter the message displayed on the homepage..." className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none" />
                        </div>
                    </div>
                </div>

                {/* School Schedule & Timings Section */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <h3 className="font-bold text-sm text-slate-800">School Schedule & Timings</h3>
                    </div>
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Summer Timings</label>
                            <input
                                type="text" name="summer_timings" value={formData.summer_timings} onChange={handleChange} required
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Winter Timings</label>
                            <input
                                type="text" name="winter_timings" value={formData.winter_timings} onChange={handleChange} required
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Friday Hours</label>
                            <input
                                type="text" name="friday_hours" value={formData.friday_hours} onChange={handleChange} required
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact & Administration Section */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <h3 className="font-bold text-sm text-slate-800">Contact Details</h3>
                    </div>
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Official Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Phone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Complete Location Address</label>
                            <textarea name="location_address" value={formData.location_address} onChange={handleChange} required rows={3} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 disabled:bg-slate-400 text-white font-bold text-sm px-8 py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors">
                        {isSaving ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span> : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Configuration</span>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsTab;