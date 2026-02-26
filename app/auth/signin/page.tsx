// app/auth/signin/page.tsx
import { Suspense } from 'react';
import SignInForm from '@/components/auth/SignInForm';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
            <div className="max-w-md w-full">
                <Suspense fallback={<LoadingSkeleton type="form" />}>
                    <SignInForm />
                </Suspense>
            </div>
        </div>
    );
}