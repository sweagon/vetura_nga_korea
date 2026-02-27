'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }


    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="mx-auto text-error-text mb-4" size={48} />
                        <h3 className="text-lg font-semibold mb-2">Diçka shkoi keq</h3>
                        <p className="text-secondary mb-4">Ju lutemi provoni përsëri</p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="btn-primary"
                        >
                            Provo përsëri
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
