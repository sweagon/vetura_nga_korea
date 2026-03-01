// components/ui/CustomInput.tsx
'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    error?: string;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
    ({ className = '', icon, error, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            w-full px-4 py-2.5
            ${icon ? 'pl-10' : 'pl-4'}
            bg-surface-2/80 backdrop-blur-sm
            border border-light rounded-xl
            text-sm text-primary placeholder:text-muted
            hover:border-orange-primary/30 hover:bg-surface-2
            focus:outline-none focus:border-orange-primary focus:ring-2 focus:ring-orange-10
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error-bg' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-error-text">{error}</p>
                )}
            </div>
        );
    }
);

CustomInput.displayName = 'CustomInput';

export default CustomInput;