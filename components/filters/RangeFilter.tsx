// components/filters/RangeFilter.tsx
'use client';

import { useState, useEffect } from 'react';

interface RangeFilterProps {
    min: number;
    max: number;
    fromValue: string;
    toValue: string;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    fromPlaceholder?: string;
    toPlaceholder?: string;
    step?: number;
}

export default function RangeFilter({
    min,
    max,
    fromValue,
    toValue,
    onFromChange,
    onToChange,
    fromPlaceholder = 'Nga',
    toPlaceholder = 'Deri',
    step = 1
}: RangeFilterProps) {
    const [from, setFrom] = useState(fromValue);
    const [to, setTo] = useState(toValue);

    useEffect(() => {
        setFrom(fromValue);
    }, [fromValue]);

    useEffect(() => {
        setTo(toValue);
    }, [toValue]);

    const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFrom(value);
        onFromChange(value);
    };

    const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTo(value);
        onToChange(value);
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                    <input
                        type="number"
                        value={from}
                        onChange={handleFromChange}
                        placeholder={fromPlaceholder}
                        min={min}
                        max={max}
                        step={step}
                        className="input text-sm"
                    />
                </div>
                <div className="relative">
                    <input
                        type="number"
                        value={to}
                        onChange={handleToChange}
                        placeholder={toPlaceholder}
                        min={min}
                        max={max}
                        step={step}
                        className="input text-sm"
                    />
                </div>
            </div>

            {/* Quick range buttons */}
            <div className="flex gap-1 pt-1">
                <button
                    onClick={() => {
                        onFromChange(min.toString());
                        onToChange('5000');
                    }}
                    className="px-2 py-1 text-xs bg-surface-2 border border-light/20 rounded hover:border-orange-primary/30 transition-colors"
                >
                    Deri €5k
                </button>
                <button
                    onClick={() => {
                        onFromChange('10000');
                        onToChange('20000');
                    }}
                    className="px-2 py-1 text-xs bg-surface-2 border border-light/20 rounded hover:border-orange-primary/30 transition-colors"
                >
                    €10k-20k
                </button>
                <button
                    onClick={() => {
                        onFromChange('20000');
                        onToChange('');
                    }}
                    className="px-2 py-1 text-xs bg-surface-2 border border-light/20 rounded hover:border-orange-primary/30 transition-colors"
                >
                    Mbi €20k
                </button>
            </div>
        </div>
    );
}