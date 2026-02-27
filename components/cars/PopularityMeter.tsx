// components/cars/PopularityMeter.tsx
'use client';

import { Eye, Heart } from 'lucide-react';

interface PopularityMeterProps {
    views: number;
    subscribers: number;
}

export default function PopularityMeter({ views, subscribers }: PopularityMeterProps) {
    const popularityScore = Math.min(100, Math.round((views + subscribers * 10) / 100));

    return (
        <div className="bg-surface rounded-2xl p-6 border border-medium shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-primary">Populariteti</h3>

            <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-ferrari-red mb-1">
                            <Eye size={18} />
                        </div>
                        <p className="text-2xl font-bold text-primary">{views.toLocaleString()}</p>
                        <p className="text-xs text-muted">Shikime</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-ferrari-red mb-1">
                            <Heart size={18} />
                        </div>
                        <p className="text-2xl font-bold text-primary">{subscribers.toLocaleString()}</p>
                        <p className="text-xs text-muted">Interesime</p>
                    </div>
                </div>

                {/* Popularity Bar */}
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-secondary">Niveli i interesit</span>
                        <span className="text-ferrari-red font-semibold">{popularityScore}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-ferrari-red to-ferrari-dark rounded-full transition-all duration-500"
                            style={{ width: `${popularityScore}%` }}
                        />
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {views > 1000 && (
                        <span className="px-2 py-1 bg-info-bg text-info-text rounded-full text-xs">
                            🔥 Shumë i kërkuar
                        </span>
                    )}
                    {subscribers > 10 && (
                        <span className="px-2 py-1 bg-success-bg text-success-text rounded-full text-xs">
                            ⭐ Popullor
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}