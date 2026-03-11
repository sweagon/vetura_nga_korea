// components/ui/Pagination.tsx
'use client';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    onNext: () => void;
    onPrev: () => void;
    hasNext: boolean;
    hasPrev: boolean;
    loading?: boolean;
    isPrefetching?: boolean;
}

export default function Pagination({
    currentPage,
    onNext,
    onPrev,
    hasNext,
    hasPrev,
    loading = false,
    isPrefetching = false
}: PaginationProps) {
    if (!hasNext && !hasPrev) return null;

    return (
        <nav className="flex items-center justify-center gap-4 py-8" aria-label="Pagination">
            <button
                onClick={onPrev}
                disabled={!hasPrev || loading}
                className={`
                    w-10 h-10 flex items-center justify-center rounded-lg
                    bg-surface-2 border border-light/30
                    text-muted hover:text-primary hover:border-orange-primary/50
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-orange-primary/20
                `}
                aria-label="Faqja paraprake"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">
                    Faqja {currentPage}
                </span>
                {isPrefetching && (
                    <Loader2 size={14} className="animate-spin text-orange-500" />
                )}
            </div>

            <button
                onClick={onNext}
                disabled={!hasNext || loading}
                className={`
                    w-10 h-10 flex items-center justify-center rounded-lg
                    bg-surface-2 border border-light/30
                    text-muted hover:text-primary hover:border-orange-primary/50
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-orange-primary/20
                `}
                aria-label="Faqja tjetër"
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
            </button>
        </nav>
    );
}