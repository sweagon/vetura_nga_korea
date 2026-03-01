// components/ui/Pagination.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number; // Optional prop to control visible page buttons
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5 // Default to showing 5 page buttons
}: PaginationProps) {
    // Don't render if invalid
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];

        // Always show first page
        pages.push(1);

        // Calculate range around current page
        let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
        let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

        // Adjust if we're near the end
        if (end === totalPages - 1) {
            start = Math.max(2, totalPages - maxVisiblePages);
        }

        // Add ellipsis after first page if needed
        if (start > 2) {
            pages.push('...');
        }

        // Add middle pages
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Add ellipsis before last page if needed
        if (end < totalPages - 1) {
            pages.push('...');
        }

        // Always show last page if there is more than one page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center justify-center gap-2 py-6" aria-label="Pagination">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
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

            {/* Page Numbers - Now handles many pages gracefully */}
            <div className="flex items-center gap-1">
                {pageNumbers.map((page, index) => (
                    typeof page === 'number' ? (
                        <button
                            key={index}
                            onClick={() => onPageChange(page)}
                            className={`
                                min-w-10 h-10 px-3 flex items-center justify-center rounded-lg
                                text-sm font-medium transition-all duration-200
                                ${currentPage === page
                                    ? 'bg-orange-primary text-white shadow-md'
                                    : 'bg-surface-2 border border-light/30 text-secondary hover:text-primary hover:border-orange-primary/50'
                                }
                                focus:outline-none focus:ring-2 focus:ring-orange-primary/20
                            `}
                            aria-label={`Faqja ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={index} className="w-10 h-10 flex items-center justify-center text-muted">
                            {page}
                        </span>
                    )
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
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
                <ChevronRight size={18} />
            </button>
        </nav>
    );
}