'use client';

import { useState } from 'react';
import MatchmakerWidget from '@/components/matchmaker/MatchmakerWidget';
import { fetchCars } from '@/lib/api';
import { useEffect } from 'react';

export default function TestMatchmakerPage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCars = async () => {
            const data = await fetchCars({ limit: 100, sort: 'price_desc' });
            setCars(data?.cars || []);
            setLoading(false);
        };
        loadCars();
    }, []);

    // Add this useEffect to expose cars to window for testing
    useEffect(() => {
        // Only in development/test mode
        if (process.env.NODE_ENV === 'development' && cars.length > 0) {
            (window as any).__matchmakerData = {
                cars: cars,
            };
            console.log('📦 Test data available at window.__matchmakerData');
        }
    }, [cars]);

    // Analyze available makes for debugging
    const getAvailableMakes = () => {
        const makes = new Set(cars.map((c: any) => c.make));
        console.log('📊 Available makes:', Array.from(makes));
        return Array.from(makes);
    };

    const testScenarios = [
        {
            name: "Renault Lover",
            action: () => {
                const renaults = cars.filter((c: any) =>
                    c.make?.includes('Renault') || c.make?.includes('Samsung')
                );
                renaults.slice(0, 3).forEach((car: any) => {
                    const event = new CustomEvent('carSave', { detail: car });
                    window.dispatchEvent(event);
                    console.log('✅ Saved Renault:', car.model);
                });
                alert(`Added ${Math.min(3, renaults.length)} Renault cars to preferences!`);
            }
        },
        {
            name: "KG Mobility Fan",
            action: () => {
                const kgCars = cars.filter((c: any) =>
                    c.make?.includes('KG') || c.make?.includes('Ssangyong')
                );
                kgCars.slice(0, 3).forEach((car: any) => {
                    const event = new CustomEvent('carSave', { detail: car });
                    window.dispatchEvent(event);
                    console.log('✅ Saved KG:', car.model);
                });
                alert(`Added ${Math.min(3, kgCars.length)} KG cars to preferences!`);
            }
        },
        {
            name: "Budget Korean",
            action: () => {
                const cheapKoreans = cars.filter((c: any) =>
                    (c.make?.includes('Kia') || c.make?.includes('Chevrolet')) &&
                    c.price < 15000
                );
                cheapKoreans.slice(0, 3).forEach((car: any) => {
                    const event = new CustomEvent('carSave', { detail: car });
                    window.dispatchEvent(event);
                    console.log('✅ Saved budget Korean:', car.make, car.model);
                });
                alert(`Added ${Math.min(3, cheapKoreans.length)} budget Korean cars!`);
            }
        },
        {
            name: "Save First 3 Cars",
            action: () => {
                cars.slice(0, 3).forEach((car: any, i) => {
                    setTimeout(() => {
                        const event = new CustomEvent('carSave', { detail: car });
                        window.dispatchEvent(event);
                        console.log(`✅ Saved car ${i + 1}:`, car.make, car.model);
                    }, i * 500);
                });
                alert('Saving first 3 cars - check console!');
            }
        },
        {
            name: "Show Available Makes",
            action: () => {
                const makes = getAvailableMakes();
                console.log('📊 Available makes in your data:', makes);
                alert(`Check console for available makes (${makes.length} found)`);
            }
        },
        {
            name: "Clear Preferences",
            action: () => {
                localStorage.removeItem('preferences_guest');
                localStorage.removeItem('recentSearches');
                localStorage.removeItem('savedCars');
                window.location.reload();
            }
        }
    ];

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container-custom py-8">
            <h1 className="text-3xl font-bold mb-4">🧪 Matchmaker Test Page</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {testScenarios.map((scenario, i) => (
                    <button
                        key={i}
                        onClick={scenario.action}
                        className="p-3 bg-ferrari-red text-white rounded-lg hover:bg-ferrari-dark transition"
                    >
                        {scenario.name}
                    </button>
                ))}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg mb-8">
                <p className="text-sm">
                    <strong>Debug Info:</strong> Open browser console (F12) to see logs.
                    Click "Show Available Makes" first to see what cars are in your data.
                </p>
            </div>

            <MatchmakerWidget cars={cars} />
        </div>
    );
}