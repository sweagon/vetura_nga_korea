// components/cars/OptionList.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { categorizeOptions, type OptionDescriptor } from '@/lib/optionCodes';

interface OptionListProps {
    options?: (string | OptionDescriptor)[];
    title: string;
}

export default function OptionList({ options, title }: OptionListProps) {
    const [expanded, setExpanded] = useState(false);

    if (!options || options.length === 0) return null;

    const categories = categorizeOptions(options);
    const hasOptions = Object.values(categories).some(cat => cat.length > 0);

    if (!hasOptions) return null;

    const categoryLabels: Record<string, string> = {
        safety: 'Siguria',
        comfort: 'Komforti',
        technology: 'Teknologjia',
        exterior: 'Eksterieri',
        interior: 'Interieri',
        audio: 'Audio',
        other: 'Të tjera'
    };

    // Count total items
    const totalItems = Object.values(categories).reduce((acc, cat) => acc + cat.length, 0);

    return (
        <div className="border border-light/20 rounded-lg overflow-hidden mb-3">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 bg-surface-2 hover:bg-surface-3 transition-colors"
            >
                <div>
                    <span className="font-medium text-primary">{title}</span>
                    <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                        {totalItems}
                    </span>
                </div>
                {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <div className="p-4 space-y-4">
                    {Object.entries(categories).map(([key, items]) => {
                        if (items.length === 0) return null;

                        return (
                            <div key={key}>
                                <h4 className="text-xs font-medium text-muted mb-2 flex items-center gap-2">
                                    <span>{categoryLabels[key]}</span>
                                    <span className="text-xs bg-surface-3 px-1.5 py-0.5 rounded-full">
                                        {items.length}
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-2 p-2 bg-surface-2/50 rounded-lg hover:bg-surface-2 transition-colors"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2"></div>
                                            <div className="flex-1">
                                                <span className="text-sm text-primary">{item.name}</span>
                                                {/* <span className="text-xs text-muted block">Kodi: {item.code}</span> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}