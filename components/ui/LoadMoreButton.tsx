// components/ui/LoadMoreButton.tsx
'use client';

import { Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
    onClick: () => void;
    loading: boolean;
    hasMore: boolean;
    currentCount: number;
    totalCount: number;
    className?: string;
}

export default function LoadMoreButton({
    onClick,
    loading,
    hasMore,
    currentCount,
    totalCount,
    className = ''
}: LoadMoreButtonProps) {
    if (!hasMore) return null;

    const remaining = totalCount - currentCount;

    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            <button
                onClick={onClick}
                disabled={loading}
                className={`
          px-6 py-3 bg-orange-500 text-white rounded-lg font-medium
          hover:bg-orange-600 transition-colors disabled:opacity-50
          disabled:cursor-not-allowed flex items-center gap-2 min-w-[200px] justify-center
        `}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Duke ngarkuar...</span>
                    </>
                ) : (
                    <>
                        <span>Ngarko më shumë</span>
                        {remaining > 0 && (
                            <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                                +{remaining}
                            </span>
                        )}
                    </>
                )}
            </button>

            <p className="text-xs text-muted">
                Duke shfaqur {currentCount} nga {totalCount} makina
            </p>
        </div>
    );
}