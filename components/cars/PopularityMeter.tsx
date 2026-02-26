'use client';

interface PopularityMeterProps {
    views: number;
    subscribers: number;
}

export default function PopularityMeter({ views, subscribers }: PopularityMeterProps) {
    const popularityScore = Math.min(100, Math.round((views / 1000) * 10));

    return (
        <div className="bg-secondary p-4 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-1">
                    <span className="text-lg">👁️</span> {views.toLocaleString()} shikime
                </span>
                <span className="flex items-center gap-1">
                    <span className="text-lg">⭐</span> {subscribers} interesime
                </span>
            </div>
            <div className="w-full bg-tertiary h-2 rounded-full overflow-hidden">
                <div
                    className="bg-ferrari-red h-2 rounded-full transition-all duration-500"
                    style={{ width: `${popularityScore}%` }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-2">
                {popularityScore}% popullaritet në platformë
            </p>
        </div>
    );
}