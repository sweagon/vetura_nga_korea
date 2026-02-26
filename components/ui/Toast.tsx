'use client';

import { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (type: ToastType, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center justify-between p-4 rounded-lg shadow-lg min-w-[300px] ${toast.type === 'success' ? 'bg-green-50 text-green-800' :
                                toast.type === 'error' ? 'bg-red-50 text-red-800' :
                                    'bg-blue-50 text-blue-800'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            {toast.type === 'success' && <CheckCircle size={18} />}
                            {toast.type === 'error' && <AlertCircle size={18} />}
                            <span>{toast.message}</span>
                        </div>
                        <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};