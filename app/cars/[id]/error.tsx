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
        // Log the error to an error reporting service
        console.error('Car detail error:', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-secondary">
            <div className="container-custom py-12">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Error Icon */}
                    <div className="mb-6 relative">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle size={48} className="text-red-500" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-ferrari-red rounded-full flex items-center justify-center text-white font-bold text-sm animate-pulse">
                            !
                        </div>
                    </div>

                    {/* Error Title */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Një problem u shfaq
                    </h1>

                    {/* Error Message */}
                    <div className="bg-surface rounded-lg shadow-md p-6 mb-8">
                        <p className="text-gray-600 mb-4">
                            Makina që po kërkoni nuk mund të shfaqet për momentin.
                            Kjo mund të ndodhë për disa arsye:
                        </p>
                        <ul className="text-left space-y-2 mb-4">
                            <li className="flex items-start text-gray-600">
                                <span className="w-1.5 h-1.5 bg-ferrari-red rounded-full mt-2 mr-3"></span>
                                <span>Makina mund të jetë shitur ose hequr nga lista</span>
                            </li>
                            <li className="flex items-start text-gray-600">
                                <span className="w-1.5 h-1.5 bg-ferrari-red rounded-full mt-2 mr-3"></span>
                                <span>Probleme teknike me lidhjen me serverin</span>
                            </li>
                            <li className="flex items-start text-gray-600">
                                <span className="w-1.5 h-1.5 bg-ferrari-red rounded-full mt-2 mr-3"></span>
                                <span>ID e makinës mund të jetë e pasaktë</span>
                            </li>
                        </ul>
                        {error.message && (
                            <div className="bg-red-50 p-4 rounded-lg">
                                <p className="text-sm text-red-600 font-mono break-all">
                                    {error.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
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
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-secondary transition flex items-center justify-center"
                        >
                            <Home size={18} className="mr-2" />
                            Kthehu në fillim
                        </Link>
                    </div>

                    {/* Error ID for support */}
                    {error.digest && (
                        <p className="text-xs text-gray-400 mt-8">
                            Error ID: {error.digest}
                        </p>
                    )}

                    {/* Support Info */}
                    <div className="mt-8 pt-8 border-t border-theme">
                        <p className="text-sm text-gray-500">
                            Nëse problemi vazhdon, ju lutemi{' '}
                            <Link href="/contact" className="text-ferrari-red hover:underline">
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