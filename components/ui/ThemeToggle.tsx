// components/ui/ThemeToggle.tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-ferrari-red/10 transition-colors relative group"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon size={20} className="text-gray-700 group-hover:text-ferrari-red transition-colors" />
            ) : (
                <Sun size={20} className="text-dark-text-secondary group-hover:text-ferrari-red transition-colors" />
            )}
        </button>
    );
}