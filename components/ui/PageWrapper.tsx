// components/ui/PageWrapper.tsx
'use client';

import { Suspense } from 'react';

interface PageWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function PageWrapper({ children, fallback }: PageWrapperProps) {
    return (
        <Suspense fallback={fallback || <div className="min-h-screen bg-bg-primary animate-pulse" />}>
            {children}
        </Suspense>
    );
}