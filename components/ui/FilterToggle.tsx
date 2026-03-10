// components/ui/FilterToggle.tsx
'use client';

import { Filter } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface FilterToggleProps {
    onClick: () => void;
}

export default function FilterToggle({ onClick }: FilterToggleProps) {
    const searchParams = useSearchParams();

    const activeFilterCount = [
        searchParams.get('fuel_id'),
        searchParams.get('transmission_id'),
        searchParams.get('color_id'),
        searchParams.get('body_type_id'),
        searchParams.get('filter_year_from'),
        searchParams.get('filter_year_to'),
        searchParams.get('filter_price_from'),
        searchParams.get('filter_price_to'),
    ].filter(Boolean).length;

    return (
        <button
            onClick={onClick}
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
            aria-label="Filtro makinat"
        >
            <Filter size={24} />
            {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                </span>
            )}
        </button>
    );
}