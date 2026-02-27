// components/cars/QuickActions.tsx
'use client';

import { Phone, Mail, MessageCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
    car: any;
}

export default function QuickActions({ car }: QuickActionsProps) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <a
                href={`tel:${car.sellerPhone}`}
                className="flex items-center justify-center gap-2 p-3 bg-surface-2 hover:bg-ferrari-red hover:text-primary rounded-xl border border-medium transition-all group"
            >
                <Phone size={18} className="text-primary group-hover:text-primary" />
                <span className="text-sm font-medium">Telefon</span>
            </a>
            <a
                href={`mailto:${car.sellerEmail}`}
                className="flex items-center justify-center gap-2 p-3 bg-surface-2 hover:bg-ferrari-red hover:text-primary rounded-xl border border-medium transition-all group"
            >
                <Mail size={18} className="text-primary group-hover:text-primary" />
                <span className="text-sm font-medium">Email</span>
            </a>
            <a
                href={`https://wa.me/${car.sellerPhone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-surface-2 hover:bg-ferrari-red hover:text-primary rounded-xl border border-medium transition-all group"
            >
                <MessageCircle size={18} className="text-primary group-hover:text-primary" />
                <span className="text-sm font-medium">WhatsApp</span>
            </a>
            <Link
                href={`/contact?car=${car.id}`}
                className="flex items-center justify-center gap-2 p-3 bg-surface-2 hover:bg-ferrari-red hover:text-primary rounded-xl border border-medium transition-all group"
            >
                <Calendar size={18} className="text-primary group-hover:text-primary" />
                <span className="text-sm font-medium">Takim</span>
            </Link>
        </div>
    );
}
