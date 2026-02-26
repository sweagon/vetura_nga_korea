'use client';

import { useSession, signOut } from 'next-auth/react'; // Add signOut here
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, LogOut } from 'lucide-react';

export default function AccountPage() {
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
                <div className="max-w-md mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-tertiary rounded w-48 mb-8"></div>
                        <div className="h-32 bg-tertiary rounded mb-4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="container-custom py-12">
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-surface p-8 rounded-lg shadow-md">
                        <User size={48} className="mx-auto text-ferrari-red mb-4" />
                        <h1 className="text-2xl font-bold mb-4">Llogaria</h1>
                        <p className="text-gray-600 mb-6">
                            Ju lutemi hyni në llogarinë tuaj për të vazhduar.
                        </p>
                        <Link href="/auth/signin" className="btn-primary inline-block">
                            Hyr në llogari
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-12">
            <h1 className="text-3xl font-bold mb-8">Llogaria ime</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Info */}
                <div className="md:col-span-2">
                    <div className="bg-surface rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Informacionet personale</h2>

                        <div className="space-y-4">
                            <div className="flex items-center p-3 bg-secondary rounded-lg">
                                <User className="text-ferrari-red mr-3" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Emri</p>
                                    <p className="font-medium">{session.user?.name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-secondary rounded-lg">
                                <Mail className="text-ferrari-red mr-3" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{session.user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 bg-secondary rounded-lg">
                                <Phone className="text-ferrari-red mr-3" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Telefoni</p>
                                    <p className="font-medium">N/A</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="md:col-span-1">
                    <div className="bg-surface rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Opsione</h2>
                        <div className="space-y-2">
                            <Link
                                href="/saved"
                                className="block p-3 hover:bg-secondary rounded-lg transition"
                            >
                                Makinat e ruajtura
                            </Link>
                            <Link
                                href="/profile/edit"
                                className="block p-3 hover:bg-secondary rounded-lg transition"
                            >
                                Ndrysho profilin
                            </Link>
                            <Link
                                href="/auth/change-password"
                                className="block p-3 hover:bg-secondary rounded-lg transition"
                            >
                                Ndrysho passwordin
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center"
                            >
                                <LogOut size={18} className="mr-2" />
                                Dil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}