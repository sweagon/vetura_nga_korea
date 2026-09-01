// components/ui/CustomSelect.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

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
    fullWidth?: boolean; // Add this prop
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
    fullWidth = false // Add this with default false
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Update position when opening
    const openDropdown = () => {
        if (disabled || loading) return;

        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setIsOpen(true);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!isOpen) return;

            const target = e.target as Node;
            const isButton = buttonRef.current?.contains(target);
            const isDropdown = dropdownRef.current?.contains(target);

            if (!isButton && !isDropdown) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen]);

    const baseButtonClasses = variant === 'hero'
        ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
        : 'bg-surface-2 border border-light/20 text-secondary hover:border-orange-primary/40 hover:text-primary';

    return (
        <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
            <button
                ref={buttonRef}
                type="button"
                onClick={openDropdown}
                className={`
                    flex items-center gap-2 px-3 py-2.5
                    ${baseButtonClasses}
                    rounded-lg text-sm
                    transition-all duration-200
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    w-full
                `}
                disabled={disabled || loading}
            >
                {icon && <span className="shrink-0 text-muted">{icon}</span>}
                <span className={`flex-1 text-left truncate ${selectedOption ? 'text-primary' : 'text-muted'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && mounted && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        zIndex: 999999,
                        pointerEvents: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-bg-primary border border-light/20 rounded-lg shadow-xl overflow-hidden">
                        <div className="overflow-y-auto max-h-[300px]">
                            {options.length > 0 ? (
                                options.map((option, idx) => (
                                    <button
                                        key={option.value}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            bg-blue-950
                                            w-full px-4 py-3 text-left text-sm
                                            hover:bg-surface-2 transition-colors
                                            cursor-pointer
                                            ${idx !== options.length - 1 ? 'border-b border-light/10' : ''}
                                            ${value === option.value
                                                ? 'bg-orange-5 text-orange-500 font-medium'
                                                : 'text-secondary hover:text-primary'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{option.label}</span>
                                            {value === option.value && (
                                                <Check size={14} className="text-orange-500" />
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-sm text-muted text-center">
                                    Nuk ka opsione
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}