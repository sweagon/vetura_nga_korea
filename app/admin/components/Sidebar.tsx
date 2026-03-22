// app/admin/components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Truck,
    DollarSign,
    LogOut,
    Shield,
    ChevronLeft,
    ChevronRight,
    X,
    Home
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    exact?: boolean;
}

const navItems: NavItem[] = [
    { href: '/#', label: 'Ballina', icon: Home, exact: false },
    { href: '/admin/pricing', label: 'Transporti & Marzhat', icon: Truck, exact: false },
    { href: '/admin/exchange-rates', label: 'Kurset e Këmbimit', icon: DollarSign, exact: false },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export default function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and window resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            // Auto-collapse on desktop, expand on mobile
            if (window.innerWidth >= 1024) {
                const saved = localStorage.getItem('sidebarCollapsed');
                if (saved !== null) {
                    setIsCollapsed(saved === 'true');
                }
            } else {
                setIsCollapsed(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const isActive = (item: NavItem) => {
        if (item.exact) {
            return pathname === item.href;
        }
        return pathname.startsWith(item.href);
    };

    const handleNavClick = () => {
        if (isMobile) {
            onClose();
        }
    };

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', String(newState));
    };

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

    // Different z-index for mobile vs desktop
    const zIndexClass = isMobile ? 'z-50' : 'z-40';

    const sidebarClasses = `
        fixed top-0 left-0 h-screen
        bg-gradient-to-b from-dark-blue/98 to-navy/98
        backdrop-blur-xl border-r border-white/20
        transition-all duration-300 ease-in-out
        ${sidebarWidth}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${zIndexClass}
    `;

    return (
        <>
            {/* Overlay for mobile - higher z-index than sidebar? No, lower */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={sidebarClasses}>
                <div className="flex flex-col h-full">
                    {/* Close button for mobile */}
                    {isMobile && (
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={onClose}
                                className="p-2 text-white/70 hover:text-white transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {/* Logo Section */}
                    <div className={`p-5 border-b border-white/10 ${isCollapsed && !isMobile ? 'px-3' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-2.5 ${isCollapsed && !isMobile ? 'justify-center w-full' : ''}`}>
                                <div className="relative shrink-0">
                                    <Shield className="w-8 h-8 text-orange-500" />
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                                {(!isCollapsed || isMobile) && (
                                    <div>
                                        <h1 className="text-white font-bold text-base tracking-tight">Admin Panel</h1>
                                        <p className="text-white/40 text-[10px]">Vetura Korea Kosovë</p>
                                    </div>
                                )}
                            </div>

                            {/* Collapse Toggle Button (Desktop only) */}
                            {!isMobile && (
                                <button
                                    onClick={toggleCollapse}
                                    className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 shrink-0"
                                >
                                    {isCollapsed ? (
                                        <ChevronRight size={14} className="text-white/70" />
                                    ) : (
                                        <ChevronLeft size={14} className="text-white/70" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                        {navItems.map((item) => {
                            const active = isActive(item);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={handleNavClick}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl
                                        transition-all duration-200 group relative
                                        ${active
                                            ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-500 border-l-2 border-orange-500'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }
                                        ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}
                                    `}
                                >
                                    <Icon size={18} className="shrink-0" />
                                    {(!isCollapsed || isMobile) && (
                                        <span className="font-medium text-sm">
                                            {item.label}
                                        </span>
                                    )}
                                    {isCollapsed && !isMobile && (
                                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900/95 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / Logout */}
                    <div className={`p-3 border-t border-white/10 ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
                        <button
                            onClick={onLogout}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                text-white/60 hover:bg-red-500/10 hover:text-red-500
                                transition-all duration-200 group relative
                                ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}
                            `}
                        >
                            <LogOut size={18} className="shrink-0" />
                            {(!isCollapsed || isMobile) && (
                                <span className="font-medium text-sm">Shkyçu</span>
                            )}
                            {isCollapsed && !isMobile && (
                                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900/95 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                    Shkyçu
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}