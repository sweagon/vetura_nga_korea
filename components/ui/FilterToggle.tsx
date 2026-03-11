// components/ui/FilterToggle.tsx
'use client';

import { Filter } from 'lucide-react';

interface FilterToggleProps {
    onClick: () => void;
    activeCount?: number;
    className?: string;
}

export default function FilterToggle({ onClick, activeCount = 0, className = '' }: FilterToggleProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2.5 bg-surface-3 border border-light/20 rounded-lg text-sm text-primary hover:border-orange-500/40 hover:text-orange-500 transition-all duration-200 ${className}`}
            aria-label="Filtro makinat"
        >
            <Filter size={16} className="text-muted" />
            <span>Filtro</span>
            {activeCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                    {activeCount}
                </span>
            )}
        </button>
    );
}