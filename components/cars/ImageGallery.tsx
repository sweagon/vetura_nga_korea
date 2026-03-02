// components/cars/ImageGallery.tsx
'use client';

import { useEffect, useRef } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

interface ImageGalleryProps {
    images: string[];
    carName: string;
}

export default function ImageGallery({ images, carName }: ImageGalleryProps) {
    const galleryRef = useRef<HTMLDivElement>(null);
    const displayImages = images.length > 0 ? images : ['/placeholder-car.jpg'];

    useEffect(() => {
        if (!galleryRef.current) return;

        const lightbox = new PhotoSwipeLightbox({
            gallery: galleryRef.current,
            children: 'a',
            pswpModule: () => import('photoswipe'),
            bgOpacity: 0.98,
            loop: true,
            wheelToZoom: true,
            pinchToClose: true,
            clickToCloseNonZoomable: true,
            preload: [1, 1],
        });

        lightbox.init();

        return () => {
            lightbox.destroy();
        };
    }, []);

    // Show first 4 images in a beautiful grid
    const mainImages = displayImages.slice(0, 5);
    const remainingCount = displayImages.length - 5;

    return (
        <div ref={galleryRef} className="grid grid-cols-4 gap-0.5 rounded-xl overflow-hidden">
            {/* Main large image - spans 2x2 */}
            <a
                href={displayImages[0]}
                data-pswp-width="1200"
                data-pswp-height="800"
                target="_blank"
                rel="noreferrer"
                className="col-span-2 row-span-2 relative group cursor-pointer"
            >
                <img
                    src={displayImages[0]}
                    alt={`${carName} - Main`}
                    className="w-full h-full object-cover aspect-[4/3]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <span className="absolute bottom-2 left-2 px-3 py-1.5 bg-black/70 text-white text-sm rounded-lg backdrop-blur-sm">
                    📸 {displayImages.length} photos
                </span>
            </a>

            {/* Remaining images */}
            {mainImages.slice(1, 5).map((img, idx) => (
                <a
                    key={idx}
                    href={img}
                    data-pswp-width="1200"
                    data-pswp-height="800"
                    target="_blank"
                    rel="noreferrer"
                    className="relative group aspect-[4/3] cursor-pointer"
                >
                    <img
                        src={img}
                        alt={`${carName} - ${idx + 2}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                    {/* Show +X on last image if there are more */}
                    {idx === 3 && remainingCount > 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white text-2xl font-bold">+{remainingCount}</span>
                        </div>
                    )}
                </a>
            ))}

            {/* Hidden links for remaining images (for lightbox) */}
            {displayImages.slice(5).map((img, idx) => (
                <a
                    key={idx + 5}
                    href={img}
                    data-pswp-width="1200"
                    data-pswp-height="800"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden"
                >
                    <img src={img} alt={`${carName} - ${idx + 6}`} />
                </a>
            ))}
        </div>
    );
}