'use client';

import { MessageCircle, Phone } from 'lucide-react';

interface QuickActionsProps {
    car: {
        sellerPhone?: string | null;
        full_name?: string;
        id?: number;
    };
}

export default function QuickActions({ car }: QuickActionsProps) {
    if (!car.sellerPhone) return null;

    const cleanPhone = car.sellerPhone.replace(/[^0-9+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
        `Përshëndetje, jam i interesuar për makinën ${car.full_name || ''} (ID: ${car.id || ''})`
    )}`;

    return (
        <div className="grid grid-cols-2 gap-2">
            <a
                href={`tel:${cleanPhone}`}
                className="bg-secondary p-3 rounded-xl text-center hover:bg-tertiary transition flex items-center justify-center gap-2"
            >
                <Phone size={16} />
                <span className="text-sm">Telefono</span>
            </a>
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-100 p-3 rounded-xl text-center hover:bg-green-200 transition flex items-center justify-center gap-2"
            >
                <MessageCircle size={16} />
                <span className="text-sm">WhatsApp</span>
            </a>
        </div>
    );
}