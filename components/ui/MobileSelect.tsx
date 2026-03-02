// components/ui/MobileSelect.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
    value: string;
    label: string;
}

interface MobileSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    icon?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
}

export default function MobileSelect({
    value,
    onChange,
    options,
    placeholder = 'Zgjidh',
    icon,
    loading = false,
    disabled = false,
    className = '',
}: MobileSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`w-full ${className}`}
        >
            {/* Select Button - No outline effects */}
            <button
                type="button"
                onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 w-full px-4 py-3.5
                    bg-surface-2 border border-light/20 rounded-xl
                    text-sm text-primary
                    transition-all duration-200
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-orange-primary/40'}
                    ${isOpen ? 'border-orange-primary/40' : ''}
                `}
                disabled={disabled || loading}
            >
                {icon && <span className="shrink-0 text-muted">{icon}</span>}
                <span className={`flex-1 text-left truncate ${selectedOption ? 'text-primary' : 'text-muted'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Expandable Options - These push content down */}
            <div
                className={`
                    overflow-hidden transition-all duration-200 ease-in-out
                    ${isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}
                `}
            >
                <div className="border border-light/20 rounded-xl overflow-hidden bg-surface-2">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-light/10">
                        {options.length > 0 ? (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full px-4 py-3.5 text-left text-sm
                                        transition-colors
                                        flex items-center justify-between gap-2
                                        ${value === option.value
                                            ? 'bg-orange-10 text-orange-primary font-medium'
                                            : 'bg-surface-2 text-secondary hover:bg-surface-3 hover:text-primary'
                                        }
                                    `}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {value === option.value && (
                                        <Check size={16} className="text-orange-primary shrink-0" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-sm text-muted text-center bg-surface-2">
                                Nuk ka opsione
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}