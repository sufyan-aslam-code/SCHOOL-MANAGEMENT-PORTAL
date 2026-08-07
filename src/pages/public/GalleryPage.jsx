import React, { useState, useEffect } from 'react';
import { useGallery } from '../../hooks/useGallery';
import { Loader2, Image as ImageIcon, X, Calendar, ZoomIn } from 'lucide-react';

const GalleryCard = ({ image, formatDate, onClickImage }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const MAX_LENGTH = 100;
    const caption = image.caption || '';
    const isLongText = caption.length > MAX_LENGTH;

    const displayText = (!isExpanded && isLongText)
        ? caption.slice(0, MAX_LENGTH).trim() + '...'
        : caption;

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col">
            <div
                className="aspect-square w-full overflow-hidden bg-slate-200 relative cursor-pointer"
                onClick={() => onClickImage(image)}
            >
                <img
                    src={image.image_url}
                    alt={caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ZoomIn className="w-10 h-10 text-white opacity-80 scale-50 group-hover:scale-100 transition-transform duration-300" />
                </div>
            </div>

            <div className="p-5 relative bg-white flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-teal-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                        {formatDate(image.date || image.created_at)}
                    </span>
                </div>

                <p className="text-slate-800 font-medium leading-relaxed text-base transition-all duration-300 break-words">
                    {displayText}
                </p>

                <div className="mt-auto pt-2">
                    {isLongText && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-teal-600 hover:text-teal-800 font-semibold text-sm focus:outline-none transition-colors inline-block"
                        >
                            {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function GalleryPage() {
    const { images, loading, error } = useGallery();
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    useEffect(() => {
        if (selectedImage) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedImage]);

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">

            <div className="max-w-7xl mx-auto text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Campus Gallery
                </h1>
                <div className="w-24 h-1 bg-teal-600 mx-auto rounded-full mb-6"></div>
                <p className="max-w-2xl text-lg text-slate-600 mx-auto leading-relaxed">
                    Explore unforgettable moments, vibrant events, and lasting memories from our school community.
                </p>
            </div>

            <div className="max-w-7xl mx-auto">

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-5 mb-8 rounded-r-lg shadow-sm">
                        <p className="text-sm text-red-700 font-bold flex items-center gap-2">
                            <span>⚠️</span> Unable to load gallery: {error}
                        </p>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                        <Loader2 className="w-14 h-14 animate-spin mb-4 text-teal-600" />
                        <p className="text-lg font-semibold tracking-wide">Loading memories...</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ImageIcon className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No images yet</h3>
                        <p className="text-slate-500">Check back later for new photos from our latest events!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
                        {images.map((image) => (
                            <GalleryCard
                                key={image.id}
                                image={image}
                                formatDate={formatDate}
                                onClickImage={setSelectedImage}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 sm:p-8 transition-opacity duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/25 text-white rounded-full backdrop-blur-md transition-colors duration-200 z-[110]"
                        aria-label="Close modal"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div
                        className="relative max-w-6xl w-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage.image_url}
                            alt={selectedImage.caption || 'Gallery Image'}
                            className="w-full h-auto max-h-[90vh] object-contain rounded-xl shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}