'use client';

import { X, Check, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SortOption {
    value: string;
    label: string;
}

interface MobileSortSheetProps {
    open: boolean;
    onClose: () => void;
    options: SortOption[];
    current: string;
    onSelect: (value: string) => void;
}

export default function MobileSortSheet({ open, onClose, options, current, onSelect }: MobileSortSheetProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="sort-sheet"
                    className="fixed inset-0 z-[60] lg:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Renditni makinat"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                        className="absolute inset-x-0 bottom-0 max-h-[70dvh] overflow-y-auto rounded-t-3xl bg-surface border-t border-white/10 shadow-2xl"
                    >
                        <div className="sticky top-0 bg-surface/95 backdrop-blur-xl rounded-t-3xl">
                            <div className="pt-2.5 pb-1 flex justify-center">
                                <div className="h-1 w-10 rounded-full bg-white/20" />
                            </div>
                            <div className="flex items-center justify-between px-5 pb-3">
                                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                                    <ArrowUpDown size={16} className="text-orange-500" />
                                    <span>Rendit</span>
                                </h2>
                                <button
                                    onClick={onClose}
                                    aria-label="Mbyll"
                                    className="p-2 -mr-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="px-3 pb-[max(env(safe-area-inset-bottom),16px)]">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => onSelect(opt.value)}
                                    className={`
                                        w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors
                                        ${current === opt.value
                                            ? 'bg-orange-500/10 text-orange-500 font-medium'
                                            : 'text-text-secondary hover:bg-surface-2'
                                        }
                                    `}
                                >
                                    <span>{opt.label}</span>
                                    {current === opt.value && <Check size={18} className="text-orange-500" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}