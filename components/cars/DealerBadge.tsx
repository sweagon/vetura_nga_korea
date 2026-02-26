'use client';

import { Building2 } from 'lucide-react';

interface DealerBadgeProps {
    dealer: {
        name?: string | null;
        firm?: string | null;
        location?: string | null;
        phone?: string | null;
    } | null;
}

export default function DealerBadge({ dealer }: DealerBadgeProps) {
    if (!dealer?.firm && !dealer?.name) return null;

    return (
        <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} />
                <div>
                    <p className="font-medium">{dealer.firm || dealer.name}</p>
                    {dealer.location && (
                        <p className="text-xs text-gray-500">{dealer.location}</p>
                    )}
                </div>
            </div>
            {dealer.phone && (
                <a
                    href={`tel:${dealer.phone}`}
                    className="mt-2 text-sm text-blue-600 hover:underline block"
                >
                    📞 {dealer.phone}
                </a>
            )}
        </div>
    );
}