'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    carName: string;
}

export default function ImageGallery({ images, carName }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="bg-tertiary h-96 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Nuk ka foto</span>
            </div>
        );
    }

    return (
        <>
            {/* Main Gallery */}
            <div className="bg-surface rounded-lg shadow-md overflow-hidden">
                {/* Main Image */}
                <div className="relative h-96 bg-secondary group">
                    <img
                        src={images[selectedImage]}
                        alt={`${carName} - Foto kryesore`}
                        className="w-full h-full object-cover"
                    />

                    {/* Navigation Arrows (for multiple images) */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-ferrari-red"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-ferrari-red"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}

                    {/* Fullscreen Button */}
                    <button
                        onClick={() => setShowLightbox(true)}
                        className="absolute bottom-4 right-4 bg-primary/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-ferrari-red"
                    >
                        <Maximize2 size={20} />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-4 bg-primary/50 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImage + 1} / {images.length}
                    </div>
                </div>

                {/* Thumbnail Grid */}
                {images.length > 1 && (
                    <div className="grid grid-cols-6 gap-2 p-4">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`relative h-20 rounded overflow-hidden ${idx === selectedImage ? 'ring-2 ring-ferrari-red' : 'opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={img}
                                    alt={`${carName} - Foto ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {showLightbox && (
                <div className="fixed inset-0 bg-primary/90 z-50 flex items-center justify-center">
                    <button
                        onClick={() => setShowLightbox(false)}
                        className="absolute top-4 right-4 text-white hover:text-ferrari-red transition"
                    >
                        <X size={32} />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img
                            src={images[selectedImage]}
                            alt={`${carName} - Lightbox`}
                            className="max-w-full max-h-full object-contain"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                    className="absolute left-4 bg-surface/20 hover:bg-ferrari-red text-white p-3 rounded-full transition"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                                    className="absolute right-4 bg-surface/20 hover:bg-ferrari-red text-white p-3 rounded-full transition"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}