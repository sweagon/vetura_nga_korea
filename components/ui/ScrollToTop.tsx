'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled more than 500px
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Add scroll event listener
        window.addEventListener('scroll', toggleVisibility);

        // Clean up event listener on component unmount
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scrolling animation
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 bg-ferrari-red text-white rounded-full shadow-lg hover:bg-ferrari-dark transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ferrari-red focus:ring-offset-2"
            aria-label="Scroll to top"
            title="Kthehu në fillim"
        >
            <ChevronUp size={24} />
        </button>
    );
}