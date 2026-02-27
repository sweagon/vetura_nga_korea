// components/cars/ImageGallery.tsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import Image from 'next/image';

interface ImageGalleryProps {
    images: string[];
    carName: string;
}

export default function ImageGallery({ images, carName }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

    if (!images || images.length === 0) {
        return (
            <div className="aspect-video bg-surface-2 rounded-lg flex items-center justify-center">
                <span className="text-muted">No images available</span>
            </div>
        );
    }

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleImageError = (index: number) => {
        setImageErrors(prev => new Set(prev).add(index));
    };

    const validImages = images.filter((_, index) => !imageErrors.has(index));

    if (validImages.length === 0) {
        return (
            <div className="aspect-video bg-surface-2 rounded-lg flex items-center justify-center">
                <span className="text-muted">No valid images</span>
            </div>
        );
    }

    return (
        <>
            {/* Main Gallery */}
            <div className="relative bg-surface rounded-lg overflow-hidden">
                {/* Main Image */}
                <div className="relative aspect-video bg-surface-2">
                    {!imageErrors.has(currentIndex) ? (
                        <img
                            src={images[currentIndex]}
                            alt={`${carName} - Image ${currentIndex + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setShowLightbox(true)}
                            onError={() => handleImageError(currentIndex)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-2">
                            <span className="text-muted">Image failed to load</span>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-surface/80 hover:bg-surface rounded-full shadow-lg backdrop-blur-sm transition-all group"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={20} className="text-primary group-hover:text-ferrari-red transition-colors" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-surface/80 hover:bg-surface rounded-full shadow-lg backdrop-blur-sm transition-all group"
                                aria-label="Next image"
                            >
                                <ChevronRight size={20} className="text-primary group-hover:text-ferrari-red transition-colors" />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-surface/90 backdrop-blur-sm rounded-full text-sm text-primary border border-medium">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Fullscreen Button */}
                    <button
                        onClick={() => setShowLightbox(true)}
                        className="absolute bottom-4 left-4 p-2 bg-surface/90 hover:bg-surface backdrop-blur-sm rounded-full shadow-md transition-colors group border border-medium"
                        aria-label="View fullscreen"
                    >
                        <Maximize2 size={18} className="text-primary group-hover:text-ferrari-red transition-colors" />
                    </button>
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                    <div className="flex gap-2 p-4 bg-surface border-t border-medium overflow-x-auto scrollbar-thin">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${currentIndex === index
                                    ? 'ring-2 ring-ferrari-red ring-offset-2 ring-offset-surface'
                                    : 'opacity-70 hover:opacity-100'
                                    }`}
                            >
                                {!imageErrors.has(index) ? (
                                    <img
                                        src={image}
                                        alt={`${carName} - Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={() => handleImageError(index)}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                                        <span className="text-xs text-muted">Error</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {showLightbox && (
                <div className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-xl flex items-center justify-center">
                    <button
                        onClick={() => setShowLightbox(false)}
                        className="absolute top-6 right-6 p-3 bg-surface hover:bg-surface-2 rounded-full shadow-lg transition-colors group border border-medium"
                        aria-label="Close fullscreen"
                    >
                        <X size={24} className="text-primary group-hover:text-ferrari-red transition-colors" />
                    </button>

                    <div className="relative w-full max-w-6xl mx-4">
                        {/* Lightbox Image */}
                        <div className="relative aspect-video bg-surface-2 rounded-lg overflow-hidden">
                            {!imageErrors.has(currentIndex) ? (
                                <img
                                    src={images[currentIndex]}
                                    alt={`${carName} - Fullscreen ${currentIndex + 1}`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-muted">Image failed to load</span>
                                </div>
                            )}

                            {/* Lightbox Navigation */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevious}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-surface/80 hover:bg-surface rounded-full shadow-lg backdrop-blur-sm transition-all group"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft size={24} className="text-primary group-hover:text-ferrari-red" />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-surface/80 hover:bg-surface rounded-full shadow-lg backdrop-blur-sm transition-all group"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight size={24} className="text-primary group-hover:text-ferrari-red" />
                                    </button>
                                </>
                            )}

                            {/* Lightbox Counter */}
                            <div className="absolute bottom-4 right-4 px-4 py-2 bg-surface/90 backdrop-blur-sm rounded-full text-primary border border-medium">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}