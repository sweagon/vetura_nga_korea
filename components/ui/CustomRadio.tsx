// components/ui/CustomRadio.tsx
'use client';

import { Check } from 'lucide-react';

interface CustomRadioProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    name?: string;
    value?: string;
    type?: 'radio' | 'checkbox';
}

export default function CustomRadio({
    checked,
    onChange,
    label,
    name,
    value,
    type = 'radio'
}: CustomRadioProps) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
                <input
                    type={type}
                    name={name}
                    value={value}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer sr-only"
                />
                <div className={`
          ${type === 'radio' ? 'w-5 h-5 rounded-full' : 'w-5 h-5 rounded'}
          border border-light 
          peer-checked:border-orange-primary peer-checked:bg-orange-500 
          transition-all duration-200
          group-hover:border-orange-primary/50
        `} />
                <div className={`
          absolute inset-0 flex items-center justify-center 
          text-white scale-0 peer-checked:scale-100 
          transition-transform duration-200
        `}>
                    {type === 'radio' ? (
                        <div className="w-2 h-2 bg-white rounded-full" />
                    ) : (
                        <Check size={14} strokeWidth={3} />
                    )}
                </div>
            </div>
            <span className="text-sm text-secondary group-hover:text-primary transition-colors">
                {label}
            </span>
        </label>
    );
}