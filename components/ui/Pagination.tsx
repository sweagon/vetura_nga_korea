// components/ui/Pagination.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    onPageChange: (page: number) => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    maxVisiblePages?: number;
    // Optional: if you want to show page numbers, we'll estimate based on current page
    totalPages?: number; // Made optional
}

export default function Pagination({
    currentPage,
    onPageChange,
    hasNextPage,
    hasPrevPage,
    maxVisiblePages = 5,
    totalPages // Now optional
}: PaginationProps) {
    // Don't render if we don't have any navigation options
    if (!hasNextPage && !hasPrevPage) {
        return null;
    }

    // Calculate a reasonable "estimated" total pages for display purposes
    // If we have a next page, assume at least currentPage + 1
    // If we don't have an exact total, we'll show a limited range
    const estimatedTotalPages = totalPages || (hasNextPage ? currentPage + 2 : currentPage);

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];

        // Always show first page
        pages.push(1);

        // If we have an exact totalPages, use the existing logic
        if (totalPages) {
            // Calculate range around current page
            let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
            let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

            // Adjust if we're near the end
            if (end >= totalPages - 1) {
                end = totalPages - 1;
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
        } else {
            // Without totalPages, show a sliding window around current page
            const halfVisible = Math.floor(maxVisiblePages / 2);

            // Calculate start and end based on current page
            let start = Math.max(2, currentPage - halfVisible);
            let end = Math.min(
                hasNextPage ? currentPage + halfVisible : currentPage,
                start + maxVisiblePages - 1
            );

            // Show pages in the current range
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipsis and next indicator if we have more pages
            if (hasNextPage && end >= currentPage) {
                pages.push('...');
                // Optionally show the next page number as a hint
                if (currentPage + 1 <= end + 1) {
                    // Don't show if it would duplicate
                }
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center justify-center gap-2 py-8" aria-label="Pagination">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage}
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

            {/* Page Numbers - Only show if we have page numbers to display */}
            {pageNumbers.length > 0 && (
                <div className="flex items-center gap-1.5">
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
                            <span key={index} className="w-10 h-10 flex items-center justify-center text-muted select-none">
                                {page}
                            </span>
                        )
                    ))}
                </div>
            )}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
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