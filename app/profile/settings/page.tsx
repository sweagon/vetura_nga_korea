'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Bell, Globe, Moon, Shield, ChevronLeft } from 'lucide-react';

export default function ProfileSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="container-custom py-12">
                <div className="animate-pulse">
                    <div className="h-8 bg-tertiary rounded w-48 mb-8"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/profile"
                    className="inline-flex items-center text-sm text-secondary hover:text-ferrari-red mb-6 transition"
                >
                    <ChevronLeft size={16} className="mr-1" />
                    Kthehu te profili
                </Link>

                <h1 className="text-3xl font-bold mb-6">Cilësimet</h1>

                <div className="bg-surface rounded-lg shadow-md divide-y">
                    {/* Notifications */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <Bell className="text-ferrari-red mr-4" size={20} />
                            <div>
                                <h3 className="font-medium">Njoftimet</h3>
                                <p className="text-sm text-secondary">Menaxho preferencat e njoftimeve</p>
                            </div>
                        </div>
                        <ChevronRight className="text-muted" size={20} />
                    </div>

                    {/* Language */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <Globe className="text-ferrari-red mr-4" size={20} />
                            <div>
                                <h3 className="font-medium">Gjuha</h3>
                                <p className="text-sm text-secondary">Shqip (default)</p>
                            </div>
                        </div>
                        <ChevronRight className="text-muted" size={20} />
                    </div>

                    {/* Theme */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <Moon className="text-ferrari-red mr-4" size={20} />
                            <div>
                                <h3 className="font-medium">Tema</h3>
                                <p className="text-sm text-secondary">Ndrysho pamjen e faqes</p>
                            </div>
                        </div>
                        <ChevronRight className="text-muted" size={20} />
                    </div>

                    {/* Privacy */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <Shield className="text-ferrari-red mr-4" size={20} />
                            <div>
                                <h3 className="font-medium">Privatësia</h3>
                                <p className="text-sm text-secondary">Menaxho të dhënat personale</p>
                            </div>
                        </div>
                        <ChevronRight className="text-muted" size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
}
