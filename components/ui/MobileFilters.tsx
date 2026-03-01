// components/ui/MobileFilters.tsx
'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import FilterSidebar from '@/components/filters/FilterSidebar';

interface MobileFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    activeFilterCount: number;
    onClearAll: () => void;
}

export default function MobileFilters({
    isOpen,
    onClose,
    activeFilterCount,
    onClearAll,
}: MobileFiltersProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-modal z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-auto bg-primary border-l border-light/20">
                                        <div className="sticky top-0 z-sticky bg-primary/80 backdrop-blur-sm px-6 py-4 border-b border-light/20">
                                            <div className="flex items-center justify-between">
                                                <Dialog.Title className="text-lg font-semibold text-primary flex items-center gap-2">
                                                    Filtrat
                                                    {activeFilterCount > 0 && (
                                                        <span className="px-2 py-0.5 text-xs bg-orange-primary text-white rounded-full">
                                                            {activeFilterCount}
                                                        </span>
                                                    )}
                                                </Dialog.Title>
                                                <div className="flex items-center gap-2">
                                                    {activeFilterCount > 0 && (
                                                        <button
                                                            onClick={onClearAll}
                                                            className="text-sm text-muted hover:text-orange-primary transition-colors"
                                                        >
                                                            Pastro
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={onClose}
                                                        className="rounded-lg p-2 text-muted hover:text-primary hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-primary/20"
                                                        aria-label="Mbyll"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 px-6 py-4">
                                            <FilterSidebar />
                                        </div>

                                        <div className="sticky bottom-0 bg-primary/80 backdrop-blur-sm border-t border-light/20 px-6 py-4">
                                            <button
                                                onClick={onClose}
                                                className="w-full btn-primary"
                                            >
                                                Shfaq rezultatet
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}