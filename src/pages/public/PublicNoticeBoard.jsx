import React from 'react';
import { Megaphone, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useAnnouncements } from '../../hooks/useAnnouncements';

export const PublicNoticeBoard = () => {
    // Pass 'true' to only fetch is_active = true announcements
    const { announcements, isLoading, isError } = useAnnouncements(true);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <section className="py-24 sm:py-32 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center mb-10 space-y-3">
                    <div className="inline-flex items-center justify-center gap-2 bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1.5 rounded-full">
                        <Megaphone className="w-4 h-4 text-teal-600" />
                        <span>Latest Updates</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Notice Board</h2>
                    <p className="text-slate-500 text-sm max-w-xl mx-auto">Stay informed with the latest news, schedules, and important announcements from the administration.</p>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-16 space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                        <span className="text-slate-500 font-medium text-sm">Loading announcements...</span>
                    </div>
                ) : isError ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center text-sm font-medium border border-red-100 flex flex-col items-center gap-2">
                        <AlertCircle className="w-6 h-6" />
                        <span>Failed to load announcements. Please check your connection and try again.</span>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <Megaphone className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No new announcements at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {announcements.map((notice) => (
                            <div 
                                key={notice.id} 
                                className={`relative bg-white p-6 sm:p-8 rounded-2xl shadow-sm border transition-shadow hover:shadow-md overflow-hidden ${notice.is_important ? 'border-red-200' : 'border-slate-200'}`}
                            >
                                {/* Left decorative border line */}
                                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${notice.is_important ? 'bg-red-500' : 'bg-teal-500'}`}></div>
                                
                                <div className="space-y-4 pl-2 sm:pl-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(notice.publish_date)}
                                        </span>
                                        {notice.is_important && (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                                <AlertCircle className="w-3.5 h-3.5" /> Urgent Notice
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                                        {notice.title}
                                    </h3>
                                    
                                    <p className="text-slate-600 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                                        {notice.content}
                                    </p>

                                    {/* Render attached image if it exists */}
                                    {notice.image_url && (
                                        <div className="pt-4 border-t border-slate-100 mt-4">
                                            <a href={notice.image_url} target="_blank" rel="noreferrer" className="block w-full overflow-hidden rounded-xl border border-slate-200 hover:opacity-95 transition-opacity">
                                                <img 
                                                    src={notice.image_url} 
                                                    alt={notice.title} 
                                                    className="w-full max-h-[500px] object-contain bg-slate-50" 
                                                />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PublicNoticeBoard;