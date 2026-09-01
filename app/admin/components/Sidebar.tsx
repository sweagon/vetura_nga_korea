// app/admin/components/Sidebar.tsx - SIMPLE FIXED VERSION
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
    X
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    exact?: boolean;
}

const navItems: NavItem[] = [
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

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Load saved collapse state for desktop
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved !== null && !isMobile) {
            setIsCollapsed(saved === 'true');
        }

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

    const sidebarWidth = isCollapsed && !isMobile ? 'w-20' : 'w-64';

    // Desktop: always visible, position fixed/sticky
    // Mobile: slides in/out
    if (isMobile) {
        // Mobile sidebar - slides in
        return (
            <>
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-40"
                        onClick={onClose}
                    />
                )}
                <aside
                    className={`
                        fixed top-0 left-0 h-screen z-50
                        bg-gradient-to-b from-dark-blue to-navy
                        backdrop-blur-xl border-r border-white/20
                        transition-transform duration-300 ease-in-out
                        ${sidebarWidth}
                        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <div className="flex flex-col h-full">
                        {/* Close button */}
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={onClose}
                                className="p-2 text-white/70 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Logo */}
                        <div className="p-5 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                                <Shield className="w-8 h-8 text-orange-500" />
                                <div>
                                    <h1 className="text-white font-bold">Admin Panel</h1>
                                    <p className="text-white/40 text-xs">Vetura Korea Kosovë</p>
                                </div>
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
                                            transition-all duration-200
                                            ${active
                                                ? 'bg-orange-500/20 text-orange-500 border-l-2 border-orange-500'
                                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                                            }
                                        `}
                                    >
                                        <Icon size={18} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-3 border-t border-white/10">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-error-bg hover:text-error-text"
                            >
                                <LogOut size={18} />
                                <span className="font-medium text-sm">Shkyçu</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </>
        );
    }

    // Desktop sidebar - always visible
    return (
        <aside
            className={`
                sticky top-0 h-screen
                bg-gradient-to-b from-dark-blue to-navy
                backdrop-blur-xl border-r border-white/20
                transition-all duration-300 ease-in-out
                ${sidebarWidth}
            `}
        >
            <div className="flex flex-col h-full">
                {/* Logo Section with Collapse Button */}
                <div className={`p-5 border-b border-white/10 ${isCollapsed ? 'px-3' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                            <Shield className="w-8 h-8 text-orange-500 shrink-0" />
                            {!isCollapsed && (
                                <div>
                                    <h1 className="text-white font-bold text-base">Admin Panel</h1>
                                    <p className="text-white/40 text-xs">Vetura Korea Kosovë</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={toggleCollapse}
                            className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                        >
                            {isCollapsed ? (
                                <ChevronRight size={14} className="text-white/70" />
                            ) : (
                                <ChevronLeft size={14} className="text-white/70" />
                            )}
                        </button>
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
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                                    transition-all duration-200 group relative
                                    ${active
                                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/10 text-orange-500 border-l-2 border-orange-500'
                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }
                                    ${isCollapsed ? 'justify-center px-2' : ''}
                                `}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon size={18} className="shrink-0" />
                                {!isCollapsed && (
                                    <span className="font-medium text-sm">{item.label}</span>
                                )}
                                {isCollapsed && (
                                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className={`p-3 border-t border-white/10 ${isCollapsed ? 'px-2' : ''}`}>
                    <button
                        onClick={onLogout}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-white/60 hover:bg-error-bg hover:text-error-text
                            transition-all duration-200 group relative
                            ${isCollapsed ? 'justify-center px-2' : ''}
                        `}
                        title={isCollapsed ? "Shkyçu" : undefined}
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!isCollapsed && <span className="font-medium text-sm">Shkyçu</span>}
                        {isCollapsed && (
                            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                Shkyçu
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}