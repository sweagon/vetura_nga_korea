// components/ui/CustomRangeSlider.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface CustomRangeSliderProps {
    min: number;
    max: number;
    fromValue: number | string;
    toValue: number | string;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    label?: string;
    unit?: string;
    step?: number;
}

export default function CustomRangeSlider({
    min,
    max,
    fromValue,
    toValue,
    onFromChange,
    onToChange,
    label,
    unit = '€',
    step = 1000
}: CustomRangeSliderProps) {
    const [from, setFrom] = useState(Number(fromValue) || min);
    const [to, setTo] = useState(Number(toValue) || max);
    const rangeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setFrom(Number(fromValue) || min);
    }, [fromValue, min]);

    useEffect(() => {
        setTo(Number(toValue) || max);
    }, [toValue, max]);

    const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), to - step);
        setFrom(value);
        onFromChange(value.toString());
    };

    const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), from + step);
        setTo(value);
        onToChange(value.toString());
    };

    const getPercentage = (value: number) => {
        return ((value - min) / (max - min)) * 100;
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="text-xs font-medium text-secondary uppercase tracking-wider">
                    {label}
                </label>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                        {unit}
                    </span>
                    <input
                        type="number"
                        value={from}
                        onChange={handleFromChange}
                        min={min}
                        max={max}
                        step={step}
                        className="input pl-8 text-sm"
                        placeholder="Nga"
                    />
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                        {unit}
                    </span>
                    <input
                        type="number"
                        value={to}
                        onChange={handleToChange}
                        min={min}
                        max={max}
                        step={step}
                        className="input pl-8 text-sm"
                        placeholder="Deri"
                    />
                </div>
            </div>

            {/* Range Slider */}
            <div className="relative pt-4 pb-2" ref={rangeRef}>
                <div className="h-1 bg-surface-2 rounded-full">
                    <div
                        className="absolute h-1 bg-orange-500 rounded-full"
                        style={{
                            left: `${getPercentage(from)}%`,
                            right: `${100 - getPercentage(to)}%`
                        }}
                    />
                </div>

                {/* From thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={from}
                    onChange={handleFromChange}
                    step={step}
                    className="absolute top-3 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                />

                {/* To thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={to}
                    onChange={handleToChange}
                    step={step}
                    className="absolute top-3 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                />
            </div>

            <div className="flex justify-between text-xs text-muted">
                <span>{unit}{min.toLocaleString()}</span>
                <span>{unit}{max.toLocaleString()}</span>
            </div>
        </div>
    );
}