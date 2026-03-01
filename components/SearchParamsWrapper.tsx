// components/SearchParamsWrapper.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface SearchParamsWrapperProps {
    children: (searchParams: URLSearchParams) => React.ReactNode;
    fallback?: React.ReactNode;
}

function SearchParamsHandler({ children }: { children: (searchParams: URLSearchParams) => React.ReactNode }) {
    const searchParams = useSearchParams();
    return children(searchParams);
}

export default function SearchParamsWrapper({ children, fallback = null }: SearchParamsWrapperProps) {
    return (
        <Suspense fallback={fallback}>
            <SearchParamsHandler>{children}</SearchParamsHandler>
        </Suspense>
    );
}