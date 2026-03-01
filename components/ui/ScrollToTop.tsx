// components/ui/ScrollToTop.tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 500);
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-fixed p-3 bg-surface border border-light rounded-lg shadow-lg hover:border-orange-primary hover:bg-orange-5 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
                    aria-label="Kthehu në fillim"
                >
                    <ArrowUp size={20} className="text-secondary group-hover:text-orange-primary transition-colors" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}