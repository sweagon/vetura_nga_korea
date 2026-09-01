'use client';

import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface MobileFilterBarProps {
    onOpenFilters: () => void;
    onOpenSort: () => void;
    activeCount: number;
}

export default function MobileFilterBar({ onOpenFilters, onOpenSort, activeCount }: MobileFilterBarProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />
            <div className="bg-[#0B1D33]/95 backdrop-blur-xl border-t border-white/5 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onOpenFilters}
                        aria-label="Hap filtrat"
                        className={`
                            flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium
                            transition-all duration-200 active:scale-[0.97]
                            ${activeCount > 0
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                                : 'bg-surface-2 text-text-primary border border-white/5 hover:border-orange-500/40'
                            }
                        `}
                    >
                        <SlidersHorizontal size={17} />
                        <span>Filtrat</span>
                        {activeCount > 0 && (
                            <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">
                                {activeCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={onOpenSort}
                        aria-label="Rendit makinat"
                        className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-text-secondary bg-surface-2 border border-white/5 transition-all duration-200 active:scale-[0.97] hover:text-text-primary hover:border-orange-500/40"
                    >
                        <ArrowUpDown size={17} />
                        <span>Rendit</span>
                    </button>
                </div>
            </div>
        </div>
    );
}