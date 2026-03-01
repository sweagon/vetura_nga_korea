'use client';

import { useState } from 'react';
import { Calculator, Truck, FileCheck, Euro, Info } from 'lucide-react';

interface CostCalculatorProps {
    carPrice?: number | null;
}

export default function CostCalculator({ carPrice = 0 }: CostCalculatorProps) {
    const [shippingCost] = useState(1200); // Average shipping cost Korea → Durrës
    const [customsRate] = useState(0.10); // 10% customs duty
    const [vatRate] = useState(0.18); // 18% VAT in Kosovo
    const [serviceFee] = useState(500); // Vetura Nga Korea service fee
    const [showDetails, setShowDetails] = useState(false);

    // Ensure carPrice is a number
    const price = Number(carPrice) || 0;

    const customs = price * customsRate;
    const vat = (price + customs + shippingCost) * vatRate;
    const totalCost = price + shippingCost + customs + vat + serviceFee;

    return (
        <div className="bg-surface rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-ferrari-red p-4 text-primary">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Calculator size={20} />
                        <h3 className="font-bold">Llogaritësi i kostos totale në Kosovë</h3>
                    </div>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-primary/80 hover:text-primary"
                    >
                        <Info size={18} />
                    </button>
                </div>
            </div>

            {/* Quick Total */}
            <div className="p-4 bg-gradient-to-br from-ferrari-red/5 to-transparent">
                <div className="text-center">
                    <p className="text-sm text-secondary mb-1">Totali i përllogaritur në Kosovë</p>
                    <div className="text-3xl font-bold text-ferrari-red">
                        €{totalCost.toFixed(0)}
                    </div>
                    <p className="text-xs text-muted mt-1">
                        *Çmimi në Kore: €{price.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Detailed Breakdown (toggle) */}
            {showDetails && (
                <div className="p-4 border-t border-theme space-y-3">
                    <div className="flex justify-between py-2 border-b border-dashed">
                        <span className="flex items-center text-secondary">
                            <Euro size={16} className="mr-2" />
                            Çmimi në Kore
                        </span>
                        <span className="font-medium">€{price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                        <span className="flex items-center text-secondary">
                            <Truck size={16} className="mr-2" />
                            Transporti (Korea → Durrës)
                        </span>
                        <span className="font-medium">€{shippingCost}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                        <span className="flex items-center text-secondary">
                            <FileCheck size={16} className="mr-2" />
                            Dogana (10%)
                        </span>
                        <span className="font-medium">€{customs.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                        <span className="flex items-center text-secondary">
                            <FileCheck size={16} className="mr-2" />
                            TVSH (18%)
                        </span>
                        <span className="font-medium">€{vat.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-dashed">
                        <span className="flex items-center text-secondary">
                            <Calculator size={16} className="mr-2" />
                            Shërbimi Vetura Nga Korea
                        </span>
                        <span className="font-medium">€{serviceFee}</span>
                    </div>
                    <div className="flex justify-between py-3 font-bold text-ferrari-red">
                        <span>TOTALI NË KOSOVË</span>
                        <span>€{totalCost.toFixed(0)}</span>
                    </div>

                    <div className="bg-info-bg p-3 rounded-lg mt-2">
                        <p className="text-xs text-blue-700">
                            ⓘ Llogaritja është orientuese. Kostot reale mund të ndryshojnë në varësi të vlerësimit doganor dhe tarifave aktuale të transportit.
                        </p>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full p-3 text-center text-sm text-ferrari-red hover:bg-secondary transition border-t"
            >
                {showDetails ? 'Fsheh detajet' : 'Shfaq detajet e llogaritjes'}
            </button>
        </div>
    );
}
