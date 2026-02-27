// components/cars/CompareButton.tsx
'use client';

import { GitCompare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface CompareButtonProps {
    car: {
        id: number;
        make: string;
        model: string;
    };
    variant?: 'icon' | 'card' | 'full';
}

export default function CompareButton({ car, variant = 'icon' }: CompareButtonProps) {
    const router = useRouter();
    const [isInCompare, setIsInCompare] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
        setIsInCompare(compareList.includes(car.id));
    }, [car.id]);

    const handleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUpdating) return;

        setIsUpdating(true);

        try {
            const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');

            if (isInCompare) {
                // Remove from compare
                const updated = compareList.filter((id: number) => id !== car.id);
                localStorage.setItem('compareList', JSON.stringify(updated));
                setIsInCompare(false);
            } else {
                // Add to compare (max 3 cars)
                if (compareList.length >= 3) {
                    alert('Mund të krahasoni maksimumi 3 makina njëherësh');
                    return;
                }
                const updated = [...compareList, car.id];
                localStorage.setItem('compareList', JSON.stringify(updated));
                setIsInCompare(true);
            }

            // Dispatch event for UI updates
            const event = new CustomEvent('compareUpdate', {
                detail: { carId: car.id, action: isInCompare ? 'remove' : 'add' }
            });
            window.dispatchEvent(event);
        } finally {
            setIsUpdating(false);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleCompare}
                disabled={isUpdating}
                className={`p-2 rounded-lg transition-all ${isInCompare
                    ? 'bg-ferrari-red text-white hover:bg-ferrari-dark'
                    : 'bg-surface-2 text-secondary hover:bg-ferrari-red hover:text-white border border-medium'
                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isInCompare ? "Hiq nga krahasimi" : "Shto në krahasim"}
            >
                <GitCompare size={18} />
            </button>
        );
    }

    if (variant === 'card') {
        return (
            <button
                onClick={handleCompare}
                disabled={isUpdating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isInCompare
                    ? 'bg-ferrari-red text-white hover:bg-ferrari-dark'
                    : 'bg-surface-2 text-secondary hover:bg-ferrari-red hover:text-white border border-medium'
                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <GitCompare size={14} />
                <span>{isInCompare ? 'Në krahasim' : 'Krahaso'}</span>
            </button>
        );
    }

    // Full variant
    return (
        <button
            onClick={handleCompare}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isInCompare
                ? 'bg-ferrari-red text-white hover:bg-ferrari-dark'
                : 'bg-surface-2 text-secondary hover:bg-ferrari-red hover:text-white border border-medium'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <GitCompare size={18} />
            <span>{isInCompare ? 'Hiq nga krahasimi' : 'Shto në krahasim'}</span>
        </button>
    );
}