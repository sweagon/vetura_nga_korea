// app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Shield } from 'lucide-react';
import Sidebar from './components/Sidebar';

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <div className="lg:hidden bg-white/10 backdrop-blur-xl border-b border-white/20 fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-orange-500" />
                    <span className="text-white font-semibold">Admin Panel</span>
                </div>
                <button
                    onClick={onMenuClick}
                    className="p-2 text-white/70 hover:text-white"
                >
                    <Menu size={24} />
                </button>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/admin/check-session', { credentials: 'include' });
                const data = await response.json();
                setIsAuthenticated(data.authenticated);
                if (!data.authenticated && pathname !== '/admin') {
                    router.push('/admin');
                }
            } catch (error) {
                console.error('Auth error:', error);
                setIsAuthenticated(false);
                if (pathname !== '/admin') router.push('/admin');
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [router, pathname]);

    const handleLogout = async () => {
        try {
            await fetch('/api/admin/verify', { method: 'DELETE', credentials: 'include' });
            setIsAuthenticated(false);
            router.push('/admin');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-blue to-navy flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-blue to-navy flex items-center justify-center p-4">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-blue to-navy">
            {isMobile && <MobileHeader onMenuClick={() => setSidebarOpen(true)} />}

            <div className="flex">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onLogout={handleLogout}
                />

                <main className="flex-1 min-w-0">
                    <div className={isMobile ? "pt-16" : "pt-0"}>
                        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}