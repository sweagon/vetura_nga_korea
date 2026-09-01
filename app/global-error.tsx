'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                    <div className="container-swiss py-12">
                        <div className="max-w-2xl mx-auto text-center">
                            {/* Error Icon */}
                            <div className="mb-6">
                                <div className="w-24 h-24 bg-error-bg rounded-full flex items-center justify-center mx-auto">
                                    <AlertTriangle size={48} className="text-error-text" />
                                </div>
                            </div>

                            {/* Error Title */}
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                Gabim i papritur
                            </h1>

                            {/* Error Message */}
                            <p className="text-secondary mb-8">
                                Na vjen keq, ndodhi një gabim i papritur. Ekipi ynë u njoftua dhe po punon për ta rregulluar.
                            </p>

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
                                    href="/"
                                    className="btn-secondary flex items-center justify-center"
                                >
                                    <Home size={18} className="mr-2" />
                                    Kthehu në fillim
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
