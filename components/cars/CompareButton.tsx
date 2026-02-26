'use client';

import { GitCompare } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';

interface CompareButtonProps {
    car: {
        id: number;
        make: string;
        model: string;
    };
    className?: string;
    variant?: 'icon' | 'full';
}

export default function CompareButton({ car, className = '', variant = 'full' }: CompareButtonProps) {
    const [isInCompare, setIsInCompare] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
        setIsInCompare(compareList.includes(car.id));
    }, [car.id]);

    const toggleCompare = () => {
        const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');

        if (isInCompare) {
            const updated = compareList.filter((id: number) => id !== car.id);
            localStorage.setItem('compareList', JSON.stringify(updated));
            showToast('success', `${car.make} ${car.model} u hoq nga krahasimi`);
        } else {
            if (compareList.length >= 3) {
                showToast('error', 'Mund të krahasoni maksimumi 3 makina');
                return;
            }
            const updated = [...compareList, car.id];
            localStorage.setItem('compareList', JSON.stringify(updated));
            showToast('success', `${car.make} ${car.model} u shtua në krahasim`);
        }
        setIsInCompare(!isInCompare);
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={toggleCompare}
                className={`p-2 hover:bg-secondary rounded-full transition ${className}`}
                title="Krahaso"
            >
                <GitCompare
                    size={20}
                    className={isInCompare ? 'text-ferrari-red' : 'text-gray-600'}
                />
            </button>
        );
    }

    return (
        <button
            onClick={toggleCompare}
            className={`flex items-center space-x-1 text-sm transition ${className} ${isInCompare ? 'text-ferrari-red' : 'text-gray-500 hover:text-ferrari-red'
                }`}
        >
            <GitCompare size={16} />
            <span>Krahaso</span>
        </button>
    );
}