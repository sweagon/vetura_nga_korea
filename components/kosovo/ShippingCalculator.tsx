'use client';

import { useState } from 'react';
import { Truck, MapPin, Calendar } from 'lucide-react';

export default function ShippingCalculator() {
    const [city, setCity] = useState('Prishtinë');
    const [estimatedDays, setEstimatedDays] = useState(15);

    const cities = [
        'Prishtinë', 'Prizren', 'Pejë', 'Mitrovicë', 'Ferizaj',
        'Gjakovë', 'Gjilan', 'Podujevë', 'Vushtrri'
    ];

    return (
        <div className="bg-surface rounded-lg shadow-md p-6">
            <h3 className="font-bold mb-4 flex items-center">
                <Truck size={18} className="mr-2 text-ferrari-red" />
                Transporti në Kosovë
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-2">Qyteti</label>
                    <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2 border border-theme rounded-lg focus:outline-none focus:border-ferrari-red"
                    >
                        {cities.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Transporti nga Durrësi</span>
                        <span className="font-semibold">€150 - €250</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={14} className="mr-2" />
                        <span>Dorëzimi në {city} për 2-3 ditë pas mbërritjes në Durrës</span>
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-start">
                        <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                        Transporti nga Durrësi në qytetin tënd organizohet pasi makina të kalojë doganën.
                    </p>
                </div>
            </div>
        </div>
    );
}