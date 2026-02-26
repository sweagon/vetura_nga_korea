import Link from 'next/link';
import { Car, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center">
                <div className="w-24 h-24 bg-ferrari-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Car className="text-ferrari-red" size={40} />
                </div>
                <h1 className="text-4xl font-bold mb-4">404 - Makina nuk u gjet</h1>
                <p className="text-gray-600 mb-8 max-w-md">
                    Makina që po kërkon nuk ekziston ose është shitur.
                </p>
                <Link
                    href="/cars"
                    className="btn-primary inline-flex items-center"
                >
                    <Home size={18} className="mr-2" />
                    Shfleto makina të tjera
                </Link>
            </div>
        </div>
    );
}