// app/admin/components/MobileHeader.tsx
'use client';

import { Menu, Shield } from 'lucide-react';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <div className="lg:hidden bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
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