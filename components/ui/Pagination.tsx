import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex justify-center items-center space-x-4 mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-theme rounded-lg disabled:opacity-50 
                 hover:border-ferrari-red transition"
            >
                <ChevronLeft size={20} />
            </button>

            <span className="text-sm">
                Faqja {currentPage} nga {totalPages}
            </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-theme rounded-lg disabled:opacity-50 
                 hover:border-ferrari-red transition"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}