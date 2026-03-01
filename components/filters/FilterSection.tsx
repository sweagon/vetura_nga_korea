// components/filters/FilterSection.tsx
'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSectionProps {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export default function FilterSection({
    title,
    isExpanded,
    onToggle,
    children
}: FilterSectionProps) {
    return (
        <div className="px-4 py-3">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-orange-primary/20 rounded"
                aria-expanded={isExpanded}
            >
                <span className="text-sm font-medium text-primary">{title}</span>
                {isExpanded ? (
                    <ChevronUp size={16} className="text-muted" />
                ) : (
                    <ChevronDown size={16} className="text-muted" />
                )}
            </button>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 pb-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}