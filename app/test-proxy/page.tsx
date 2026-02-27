// app/test-proxy/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function TestProxy() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/proxy/cars?limit=1')
            .then(res => res.json())
            .then(data => setData(data))
            .catch(err => setError(err.message));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl mb-4">Proxy Test</h1>
            {error && <div className="text-error-text">Error: {error}</div>}
            {data && (
                <pre className="bg-surface p-4 rounded overflow-auto">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}
