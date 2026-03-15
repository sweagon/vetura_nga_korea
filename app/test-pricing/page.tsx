'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/lib/ConfigContext';

export default function TestPricingPage() {
    const { config, calculateFinalPrice } = useConfig();
    const [testResults, setTestResults] = useState<any[]>([]);
    const [basePrice, setBasePrice] = useState(50000);
    const [vehicleType, setVehicleType] = useState('sedan');

    const testScenarios = [
        { type: 'sedan', price: 50000, description: 'Sedan with default config' },
        { type: 'suv', price: 50000, description: 'SUV with SUV config' },
        { type: 'hatchback', price: 35000, description: 'Hatchback' },
        { type: 'unknown', price: 50000, description: 'Unknown type (should use default)' },
    ];

    const runTests = () => {
        const results = testScenarios.map(scenario => {
            const result = calculateFinalPrice(scenario.price, scenario.type);
            return {
                ...scenario,
                result,
                passed: true // Add actual validation logic
            };
        });
        setTestResults(results);
    };

    useEffect(() => {
        runTests();
    }, [config]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-6">🧪 Pricing Calculator Test</h1>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p><strong>Default Shipping:</strong> €{config.shippingCost}</p>
                        <p><strong>Prishtina Shipping:</strong> €{config.shippingToPristina}</p>
                    </div>
                    <div>
                        <p><strong>Vehicle Types:</strong></p>
                        <ul className="list-disc pl-5">
                            {Object.entries(config.vehicleTypes).map(([key, value]: [string, any]) => (
                                <li key={key}>
                                    {key}: {value.enabled ? '✅' : '❌'} (€{value.shippingCost})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Test Results</h2>

                <div className="space-y-4">
                    {testResults.map((test, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <h3 className="font-medium mb-2">{test.description}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p>Base Price: €{test.price}</p>
                                    <p>Vehicle Type: {test.type}</p>
                                </div>
                                <div>
                                    <p>Shipping Used: €{test.result.shippingCost}</p>
                                    <p>Prishtina: €{test.result.shippingToPristina}</p>
                                    <p className="font-bold text-orange-500">
                                        Final: €{test.result.finalPrice}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">🔍 Manual Test</h3>
                <div className="flex gap-4">
                    <input
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(Number(e.target.value))}
                        className="px-3 py-2 border rounded"
                        placeholder="Base Price"
                    />
                    <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="px-3 py-2 border rounded"
                    >
                        {Object.keys(config.vehicleTypes).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            const result = calculateFinalPrice(basePrice, vehicleType);
                            alert(`Final Price: €${result.finalPrice}\nShipping: €${result.shippingCost}\nType used: ${result.vehicleTypeUsed}`);
                        }}
                        className="px-4 py-2 bg-orange-500 text-white rounded"
                    >
                        Calculate
                    </button>
                </div>
            </div>
        </div>
    );
}