// components/cars/ImageGallery.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageGalleryProps {
    images: string[];
    carName: string;
}

export default function ImageGallery({ images, carName }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const displayImages = images.length > 0 ? images : ['/placeholder-car.jpg'];

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!showLightbox) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevImage();
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextImage();
            }
            if (e.key === 'Escape') {
                setShowLightbox(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showLightbox, currentIndex]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (showLightbox) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showLightbox]);

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextImage();
        }
        if (isRightSwipe) {
            prevImage();
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    return (
        <>
            {/* Main Gallery */}
            <div className="relative group">
                {/* Main Image */}
                <div
                    onClick={() => setShowLightbox(true)}
                    className="relative aspect-[16/9] bg-surface-2 cursor-pointer overflow-hidden rounded-t-xl"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setShowLightbox(true);
                        }
                    }}
                    aria-label={`Shiko imazhin kryesor të ${carName}`}
                >
                    <img
                        src={displayImages[currentIndex]}
                        alt={`${carName} - Image ${currentIndex + 1}`}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        loading="eager"
                    />

                    {/* Image counter */}
                    {displayImages.length > 1 && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-sm">
                            {currentIndex + 1} / {displayImages.length}
                        </div>
                    )}
                </div>

                {/* Navigation Arrows */}
                {displayImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label="Next image"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}

                {/* Thumbnails */}
                {displayImages.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                        {displayImages.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`
                                    flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all
                                    ${index === currentIndex
                                        ? 'border-orange-primary opacity-100'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-orange-primary/50
                                `}
                                aria-label={`Shiko imazhin ${index + 1}`}
                                aria-current={index === currentIndex ? 'true' : undefined}
                            >
                                <img
                                    src={image}
                                    alt={`${carName} - Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {showLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-modal bg-black/95 flex items-center justify-center"
                        onClick={() => setShowLightbox(false)}
                        role="dialog"
                        aria-label="Image lightbox"
                        aria-modal="true"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                            aria-label="Mbyll"
                        >
                            <X size={24} />
                        </button>

                        {/* Image container */}
                        <div
                            className="relative w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <motion.img
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                src={displayImages[currentIndex]}
                                alt={`${carName} - Lightbox ${currentIndex + 1}`}
                                className="max-w-[90vw] max-h-[90vh] object-contain"
                            />

                            {/* Lightbox counter */}
                            {displayImages.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
                                    {currentIndex + 1} / {displayImages.length}
                                </div>
                            )}

                            {/* Lightbox navigation */}
                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Lightbox thumbnails */}
                        {displayImages.length > 1 && (
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-3 bg-black/50 rounded-full backdrop-blur-sm">
                                {displayImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`
                                            w-12 h-12 rounded overflow-hidden border-2 transition-all
                                            ${index === currentIndex
                                                ? 'border-orange-primary opacity-100'
                                                : 'border-transparent opacity-50 hover:opacity-100'
                                            }
                                            focus:outline-none focus:ring-2 focus:ring-white/50
                                        `}
                                        aria-label={`Shiko imazhin ${index + 1}`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}