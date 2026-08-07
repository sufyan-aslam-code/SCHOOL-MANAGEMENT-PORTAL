import React, { useState, useEffect } from 'react';
import { X, Megaphone, Calendar, AlertCircle } from 'lucide-react';
import { useAnnouncements } from '../../hooks/useAnnouncements';

export const LatestNoticePopup = () => {
    // Fetch only active announcements
    const { announcements, isLoading } = useAnnouncements(true);
    const [isOpen, setIsOpen] = useState(false);
    const [latestNotice, setLatestNotice] = useState(null);

    useEffect(() => {
        // Wait until announcements are loaded and ensure there is at least one
        if (!isLoading && announcements && announcements.length > 0) {
            const newest = announcements[0];
            setLatestNotice(newest);

            const dismissedId = sessionStorage.getItem('dismissedNoticeId');
            
            if (dismissedId !== newest.id) {
                const timer = setTimeout(() => setIsOpen(true), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [announcements, isLoading]);

    const handleClose = () => {
        if (latestNotice) {
            sessionStorage.setItem('dismissedNoticeId', latestNotice.id);
        }
        setIsOpen(false);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (!isOpen || !latestNotice) return null;

    return (
        // Overlay container with slight padding to keep it off the extreme screen edges
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            
            {/* Card Container: max-height ensures it fits on tiny screens, flex-col sets up internal scrolling */}
            <div className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Decorative Top Border (shrink-0 prevents it from squishing) */}
                <div className={`h-1.5 sm:h-2 w-full shrink-0 ${latestNotice.is_important ? 'bg-red-500' : 'bg-teal-500'}`}></div>

                {/* Floating Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-full transition-colors z-10"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* SCROLLABLE MIDDLE SECTION */}
                <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        {latestNotice.is_important ? (
                            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Urgent
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-100">
                                <Megaphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Notice
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Calendar className="w-3 h-3" /> {formatDate(latestNotice.publish_date)}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 leading-tight pr-6 sm:pr-8">
                        {latestNotice.title}
                    </h3>
                    
                    {/* Image / Flyer - scaled down for mobile */}
                    {latestNotice.image_url && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                            <img 
                                src={latestNotice.image_url} 
                                alt={latestNotice.title} 
                                className="w-full max-h-[160px] sm:max-h-[220px] object-contain"
                            />
                        </div>
                    )}

                    {/* Content text */}
                    <div className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {latestNotice.content}
                    </div>
                </div>

                {/* FIXED BOTTOM FOOTER */}
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                    <button 
                        onClick={handleClose}
                        className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-transform active:scale-[0.98] ${latestNotice.is_important ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-700 hover:bg-teal-800'}`}
                    >
                        Acknowledge & Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LatestNoticePopup;