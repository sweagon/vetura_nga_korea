// app/admin/components/Breadcrumb.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
    'pricing': 'Transporti & Marzhat',
    'exchange-rates': 'Kurset e Këmbimit',
};

export default function Breadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    // Don't show on main admin page
    if (segments.length === 1 && segments[0] === 'admin') {
        return null;
    }

    return (
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap" aria-label="Breadcrumb">
            <Link
                href="/admin/pricing"
                className="text-white/50 hover:text-orange-500 transition-colors flex items-center gap-1"
            >
                <Home size={14} />
                <span>Ballina</span>
            </Link>

            {segments.slice(1).map((segment, index) => {
                const href = `/admin/${segments.slice(1, index + 2).join('/')}`;
                const isLast = index === segments.length - 2;
                const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

                return (
                    <div key={href} className="flex items-center gap-2">
                        <ChevronRight size={12} className="text-white/30" />
                        {isLast ? (
                            <span className="text-orange-400 font-medium text-sm">{label}</span>
                        ) : (
                            <Link
                                href={href}
                                className="text-white/50 hover:text-orange-500 transition-colors text-sm"
                            >
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}