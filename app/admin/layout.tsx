// app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Shield, X } from 'lucide-react';
import Sidebar from './components/Sidebar';

// Mobile header component with proper z-index
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
                    className="p-2 text-white/70 hover:text-white transition-colors"
                    aria-label="Menu"
                >
                    <Menu size={24} />
                </button>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/admin/check-session', {
                    credentials: 'include'
                });
                const data = await response.json();
                const isAuth = data.authenticated;

                setIsAuthenticated(isAuth);

                if (!isAuth && pathname !== '/admin') {
                    router.push('/admin');
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
                if (pathname !== '/admin') {
                    router.push('/admin');
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router, pathname]);

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/admin/verify', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setIsAuthenticated(false);
                router.push('/admin');
                setSidebarOpen(false);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleMenuClick = () => {
        setSidebarOpen(true);
    };

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white/70 text-sm">Duke kontrolluar sesionin...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, only show children (login page) without sidebar
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy">
                <main className="min-h-screen flex items-center justify-center p-4">
                    {children}
                </main>
            </div>
        );
    }

    // Authenticated - show full layout with sidebar
    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy">
            {/* Mobile Header - Fixed at top with high z-index */}
            <MobileHeader onMenuClick={handleMenuClick} />

            <div className="flex">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onLogout={handleLogout}
                />

                {/* Main Content - Add padding to account for fixed mobile header */}
                <main className="flex-1 min-w-0 transition-all duration-300">
                    <div className="pt-16 lg:pt-0">
                        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}