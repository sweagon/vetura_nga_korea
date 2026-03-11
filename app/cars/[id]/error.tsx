'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw, Car } from 'lucide-react';

export default function CarDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Car detail error:', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-primary">
            <div className="container-swiss py-12">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Error Icon */}
                    <div className="mb-6 relative">
                        <div className="w-24 h-24 bg-error-bg rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle size={48} className="text-error-text" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm animate-pulse">
                            !
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
                        Një problem u shfaq
                    </h1>

                    <div className="bg-surface rounded-xl p-6 mb-8 border border-light">
                        <p className="text-secondary mb-4">
                            Makina që po kërkoni nuk mund të shfaqet për momentin.
                            Kjo mund të ndodhë për disa arsye:
                        </p>
                        <ul className="text-left space-y-2 mb-4">
                            <li className="flex items-start text-secondary">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3"></span>
                                <span>Makina mund të jetë shitur ose hequr nga lista</span>
                            </li>
                            <li className="flex items-start text-secondary">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3"></span>
                                <span>Probleme teknike me lidhjen me serverin</span>
                            </li>
                            <li className="flex items-start text-secondary">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3"></span>
                                <span>ID e makinës mund të jetë e pasaktë</span>
                            </li>
                        </ul>
                        {error.message && (
                            <div className="bg-error-bg p-4 rounded-lg">
                                <p className="text-sm text-error-text font-mono break-all">
                                    {error.message}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={reset}
                            className="btn-primary flex items-center justify-center"
                        >
                            <RefreshCw size={18} className="mr-2" />
                            Provo përsëri
                        </button>
                        <Link
                            href="/cars"
                            className="btn-secondary flex items-center justify-center"
                        >
                            <Car size={18} className="mr-2" />
                            Shfleto makina të tjera
                        </Link>
                        <Link
                            href="/"
                            className="px-6 py-3 border border-medium rounded-lg hover:bg-surface-2 transition flex items-center justify-center text-secondary hover:text-primary"
                        >
                            <Home size={18} className="mr-2" />
                            Kthehu në fillim
                        </Link>
                    </div>

                    {error.digest && (
                        <p className="text-xs text-muted mt-8">
                            Error ID: {error.digest}
                        </p>
                    )}

                    <div className="mt-8 pt-8 border-t border-light">
                        <p className="text-sm text-secondary">
                            Nëse problemi vazhdon, ju lutemi{' '}
                            <Link href="/contact" className="text-orange-500 hover:underline">
                                na kontaktoni
                            </Link>{' '}
                            për ndihmë.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}