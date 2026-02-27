import { Search, Heart, Car, GitCompare } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    type: 'search' | 'saved' | 'cars' | 'compare';
    message?: string;
}

export default function EmptyState({ type, message }: EmptyStateProps) {
    const icons = {
        search: Search,
        saved: Heart,
        cars: Car,
        compare: GitCompare
    };

    const Icon = icons[type];

    const titles = {
        search: 'Nuk u gjet asnjë makinë',
        saved: 'Nuk ke makina të ruajtura',
        cars: 'Nuk ka makina në dispozicion',
        compare: 'Nuk ka makina për krahasim'
    };

    return (
        <div className="text-center py-16 bg-secondary rounded-lg">
            <div className="w-20 h-20 bg-ferrari-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="text-ferrari-red" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{titles[type]}</h3>
            <p className="text-secondary mb-6">
                {message || 'Provo të ndryshosh filtrat ose të kërkosh për diçka tjetër'}
            </p>
            {type === 'saved' && (
                <Link href="/cars" className="btn-primary">
                    Shfleto makina
                </Link>
            )}
            {type === 'compare' && (
                <Link href="/cars" className="btn-primary">
                    Shfleto makina për krahasim
                </Link>
            )}
        </div>
    );
}
