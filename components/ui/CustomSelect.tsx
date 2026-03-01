// components/ui/CustomSelect.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    icon?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    variant?: 'default' | 'hero';
    'aria-label'?: string;
}

export default function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Zgjidh',
    icon,
    loading = false,
    disabled = false,
    className = '',
    variant = 'default',
    'aria-label': ariaLabel,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const baseButtonClasses = variant === 'hero'
        ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
        : 'bg-surface-2 border border-light/20 text-secondary hover:border-orange-primary/40 hover:text-primary';

    return (
        <div className={`relative ${className}`} ref={selectRef}>
            <button
                type="button"
                onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-1.5 px-2.5 py-2
                    ${baseButtonClasses}
                    rounded-lg text-xs
                    focus:outline-none focus:ring-2 focus:ring-orange-primary/20
                    transition-all duration-200
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isOpen ? 'ring-2 ring-orange-primary/20' : ''}
                    w-full
                    relative
                    z-10
                `}
                disabled={disabled || loading}
                aria-label={ariaLabel || placeholder}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                {icon && <span className="shrink-0 opacity-60">{icon}</span>}
                <span className={`flex-1 text-left truncate ${selectedOption ? '' : 'opacity-60'}`}>
                    {loading ? 'Duke ngarkuar...' : (selectedOption ? selectedOption.label : placeholder)}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={12} className="shrink-0 opacity-60" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && !disabled && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-primary border border-light/20 rounded-lg shadow-lg overflow-hidden z-dropdown"
                        role="listbox"
                    >
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {options.length > 0 ? (
                                options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            w-full px-3 py-2 text-left text-xs
                                            bg-orange-500 transition-colors
                                            hover:bg-orange-400
                                            flex items-center justify-between gap-2
                                            ${value === option.value ? 'text-orange-primary bg-orange-300' : 'text-secondary'}
                                            focus:outline-none focus:bg-surface-2
                                        `}
                                        role="option"
                                        aria-selected={value === option.value}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {value === option.value && (
                                            <Check size={12} className="text-orange-primary shrink-0" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-3 text-xs text-muted text-center">
                                    Nuk ka opsione
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}