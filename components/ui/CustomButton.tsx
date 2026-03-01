// components/ui/CustomButton.tsx
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
    ({
        children,
        variant = 'primary',
        size = 'md',
        loading = false,
        icon,
        fullWidth = false,
        className = '',
        disabled,
        ...props
    }, ref) => {
        const baseClasses = 'relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-primary/20 overflow-hidden';

        const variantClasses = {
            primary: 'bg-orange-primary text-white hover:bg-orange-dark active:scale-[0.98] disabled:hover:bg-orange-primary',
            secondary: 'bg-surface-2/80 text-secondary border border-light/10 hover:border-orange-primary/30 hover:text-primary hover:bg-surface-2',
            outline: 'bg-transparent border border-light/20 text-secondary hover:border-orange-primary/30 hover:text-primary hover:bg-surface-2/50',
            ghost: 'bg-transparent text-secondary hover:text-primary hover:bg-surface-2/50'
        };

        const sizeClasses = {
            sm: 'px-3 py-2 text-xs',
            md: 'px-5 py-3 text-sm',
            lg: 'px-6 py-4 text-base'
        };

        return (
            <button
                ref={ref}
                className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${loading ? 'cursor-wait' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <motion.div
                        className="absolute inset-0 bg-white/10"
                        animate={{
                            x: ['-100%', '100%'],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                )}
                {icon}
                {children}
            </button>
        );
    }
);

CustomButton.displayName = 'CustomButton';

export default CustomButton;