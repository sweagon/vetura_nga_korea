'use client';

import { useState, useEffect } from 'react';
import { Share2, X } from 'lucide-react';
import ShareButtons from './ShareButtons';

interface FloatingShareBarProps {
    url: string;
    title: string;
    description?: string;
}

export default function FloatingShareBar({ url, title, description }: FloatingShareBarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setIsOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
            {isOpen ? (
                <div className="bg-surface rounded-lg shadow-xl p-4 mb-4 border border-theme">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold">Shpërndaje</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-secondary rounded-full"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <ShareButtons
                        url={url}
                        title={title}
                        description={description}
                        size="lg"
                    />
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-ferrari-red text-primary p-4 rounded-full shadow-lg hover:bg-ferrari-dark transition transform hover:scale-110 active:scale-95"
                    aria-label="Share"
                >
                    <Share2 size={24} />
                </button>
            )}
        </div>
    );
}
