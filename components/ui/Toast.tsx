// components/ui/Toast.tsx - Fallback with hardcoded colors
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: number;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message, duration }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Fallback colors in case CSS variables aren't loading
    const getToastColors = (type: ToastType) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-[#E8F3E9] dark:bg-[#1C2F23]',
                    text: 'text-[#1E7B4C] dark:text-[#9AE6B4]',
                    border: 'border-[#A3D8A7] dark:border-[#2F4A3A]',
                    icon: <CheckCircle size={18} className="text-[#1E7B4C] dark:text-[#9AE6B4]" />
                };
            case 'error':
                return {
                    bg: 'bg-[#FEF0F0] dark:bg-[#321F22]',
                    text: 'text-[#C73B3B] dark:text-[#FEB2B2]',
                    border: 'border-[#FFC9C9] dark:border-[#5A2E33]',
                    icon: <AlertCircle size={18} className="text-[#C73B3B] dark:text-[#FEB2B2]" />
                };
            case 'warning':
                return {
                    bg: 'bg-[#FEF3E2] dark:bg-[#332A1C]',
                    text: 'text-[#B45B0F] dark:text-[#FBD38D]',
                    border: 'border-[#FFE4B8] dark:border-[#5A4A2A]',
                    icon: <AlertCircle size={18} className="text-[#B45B0F] dark:text-[#FBD38D]" />
                };
            case 'info':
            default:
                return {
                    bg: 'bg-[#E8F0FE] dark:bg-[#1C2A3F]',
                    text: 'text-[#1A5F9C] dark:text-[#90CDF4]',
                    border: 'border-[#BAC8E0] dark:border-[#2A3F5A]',
                    icon: <Info size={18} className="text-[#1A5F9C] dark:text-[#90CDF4]" />
                };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 min-w-[320px] max-w-[400px]">
                {toasts.map(toast => {
                    const colors = getToastColors(toast.type);

                    return (
                        <div
                            key={toast.id}
                            className={`
                                ${colors.bg} ${colors.border}
                                flex items-start justify-between gap-3 p-4 rounded-xl shadow-lg 
                                border animate-in slide-in-from-right-2 fade-in duration-300
                            `}
                            role="alert"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {colors.icon}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${colors.text}`}>
                                        {toast.message}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                aria-label="Mbyll"
                            >
                                <X size={16} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};