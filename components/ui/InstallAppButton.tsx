'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Smartphone, Monitor } from 'lucide-react';

export default function InstallAppButton() {
    const pathname = usePathname();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [visible, setVisible] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(display-mode: standalone)');
        const updateStandalone = () => setIsStandalone(media.matches);
        updateStandalone();
        media.addEventListener('change', updateStandalone);

        const onBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', onBeforeInstall);

        const timer = window.setTimeout(() => {
            const dismissed = window.localStorage.getItem('install-prompt-dismissed');
            if (!dismissed) setVisible(true);
        }, 6000);

        return () => {
            media.removeEventListener('change', updateStandalone);
            window.removeEventListener('beforeinstallprompt', onBeforeInstall);
            window.clearTimeout(timer);
        };
    }, []);

    if (isStandalone || !visible || pathname?.startsWith('/admin')) {
        return null;
    }

    const dismiss = () => {
        setVisible(false);
        setSheetOpen(false);
        try {
            window.localStorage.setItem('install-prompt-dismissed', '1');
        } catch {
            // ignore storage errors
        }
    };

    const handleClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice?.outcome === 'accepted') {
                setDeferredPrompt(null);
                dismiss();
            } else {
                setDeferredPrompt(null);
            }
        } else {
            setSheetOpen(true);
        }
    };

    const isIOS = typeof window !== 'undefined' && /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    return (
        <>
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClick}
                aria-label="Instalo aplikacionin"
                className="fixed bottom-20 lg:bottom-6 right-4 z-40 flex items-center gap-2 rounded-full bg-orange-500 text-white pl-4 pr-5 py-3 shadow-xl shadow-orange-500/25 hover:bg-orange-dark transition-colors"
            >
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                <Download size={18} />
                <span className="text-sm font-medium">Instalo</span>
            </motion.button>

            <AnimatePresence>
                {sheetOpen && (
                    <motion.div
                        key="install-sheet"
                        className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={dismiss}
                            aria-hidden="true"
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Instalo aplikacionin"
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                            className="relative w-full sm:max-w-md bg-surface border-t sm:border border-light/20 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-orange-500/15 text-orange-500">
                                        <Smartphone size={20} />
                                    </span>
                                    <div>
                                        <h2 className="font-semibold text-text-primary">Instalo aplikacionin</h2>
                                        <p className="text-xs text-text-muted">Vetura Korea Kosovë në ekranin tënd</p>
                                    </div>
                                </div>
                                <button
                                    onClick={dismiss}
                                    aria-label="Mbyll"
                                    className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <ol className="space-y-3 text-sm text-text-secondary">
                                {isIOS ? (
                                    <>
                                        <li className="flex gap-3">
                                            <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-surface-2 text-xs font-semibold text-orange-500">1</span>
                                            <span>
                                                Hap menynë <b className="text-text-primary">Share (Përdaje)</b> — ikona katror me shigjetë
                                                <Share size={14} className="inline ml-1 text-text-muted" /> te Safari.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-surface-2 text-xs font-semibold text-orange-500">2</span>
                                            <span>
                                                Prek <b className="text-text-primary">Well (Shto në ekranin kryesor)</b>.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-surface-2 text-xs font-semibold text-orange-500">3</span>
                                            <span>Prek <b className="text-text-primary">Shto (Add)</b> — aplikacioni shfaqet në ekranin kryesor.</span>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex gap-3">
                                            <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-surface-2 text-xs font-semibold text-orange-500">1</span>
                                            <span>
                                                Në shfletues, prek menynë <b className="text-text-primary">⋮</b> ose ikonën e instalimit
                                                <Monitor size={14} className="inline ml-1 text-text-muted" /> te shiriti i adresës.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-surface-2 text-xs font-semibold text-orange-500">2</span>
                                            <span>
                                                Zgjidh <b className="text-text-primary">Instalo aplikacionin</b> ose{" "}
                                                <b className="text-text-primary">Shto në ekranin kryesor</b>.
                                            </span>
                                        </li>
                                    </>
                                )}
                            </ol>

                            <button
                                onClick={dismiss}
                                className="mt-6 w-full py-2.5 rounded-lg bg-surface-2 text-text-secondary text-sm font-medium hover:bg-surface-3 transition-colors"
                            >
                                Mos ma shfaq më
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}