// components/cars/SellerInfo.tsx
'use client';

import { User, Phone, Mail, MapPin, Building2 } from 'lucide-react';

interface SellerInfoProps {
    dealer?: {
        name: string;
        firm: string;
        location: string;
        phone: string;
    };
    sellerName?: string;
    sellerPhone?: string;
    sellerEmail?: string;
    sellerLocation?: string;
}

export default function SellerInfo({
    dealer,
    sellerName,
    sellerPhone,
    sellerEmail,
    sellerLocation
}: SellerInfoProps) {
    const name = dealer?.name || sellerName || 'Tregtar i paidentifikuar';
    const phone = dealer?.phone || sellerPhone || 'N/A';
    const location = dealer?.location || sellerLocation || 'Kore';
    const firm = dealer?.firm || 'Tregtar i autorizuar';

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-3">
                <User size={18} className="text-ferrari-red flex-shrink-0 mt-1" />
                <div>
                    <p className="text-sm text-muted">Emri</p>
                    <p className="font-medium text-primary">{name}</p>
                    <p className="text-xs text-secondary">{firm}</p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <Phone size={18} className="text-ferrari-red flex-shrink-0 mt-1" />
                <div>
                    <p className="text-sm text-muted">Telefoni</p>
                    <a
                        href={`tel:${phone}`}
                        className="text-sm text-secondary hover:text-ferrari-red transition"
                    >
                        {phone}
                    </a>
                </div>
            </div>

            {sellerEmail && (
                <div className="flex items-start gap-3">
                    <Mail size={18} className="text-ferrari-red flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-sm text-muted">Email</p>
                        <a
                            href={`mailto:${sellerEmail}`}
                            className="text-sm text-secondary hover:text-ferrari-red transition"
                        >
                            {sellerEmail}
                        </a>
                    </div>
                </div>
            )}

            <div className="flex items-start gap-3">
                <MapPin size={18} className="text-ferrari-red flex-shrink-0 mt-1" />
                <div>
                    <p className="text-sm text-muted">Vendndodhja</p>
                    <p className="text-sm text-secondary">{location}</p>
                </div>
            </div>
        </div>
    );
}