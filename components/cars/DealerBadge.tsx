// components/cars/DealerBadge.tsx
'use client';

import { Building2, MapPin, Phone, Award } from 'lucide-react';

interface DealerBadgeProps {
    dealer: {
        name: string;
        firm: string;
        location: string;
        phone: string;
    };
}

export default function DealerBadge({ dealer }: DealerBadgeProps) {
    return (
        <div className="bg-surface rounded-2xl p-6 border border-medium shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                <Building2 size={18} className="text-ferrari-red" />
                Tregtari
            </h3>

            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-ferrari-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award size={20} className="text-ferrari-red" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Tregtar</p>
                        <p className="font-medium text-primary">{dealer.name}</p>
                        <p className="text-sm text-secondary">{dealer.firm}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-ferrari-red flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-sm text-muted">Vendndodhja</p>
                        <p className="text-sm text-secondary">{dealer.location}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Phone size={18} className="text-ferrari-red flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-sm text-muted">Telefoni</p>
                        <a
                            href={`tel:${dealer.phone}`}
                            className="text-sm text-secondary hover:text-ferrari-red transition"
                        >
                            {dealer.phone}
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-medium">
                <p className="text-xs text-success-text flex items-center gap-1">
                    <span className="w-2 h-2 bg-success-text rounded-full"></span>
                    Tregtar i verifikuar
                </p>
            </div>
        </div>
    );
}