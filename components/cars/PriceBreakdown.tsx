// components/cars/PriceBreakdown.tsx
// Clean visual breakdown of the price-related data for a car. All amounts come
// from the provider API (lot.buy_now / profit_amount_eur) plus the site-wide
// shipping/margin config, combined in lib/pricing.ts.
'use client';

import type { PriceDetails } from '@/lib/pricing';

type Variant = 'details' | 'expenses';

interface PriceBreakdownProps {
    priceDetails: PriceDetails | null;
    formatPrice: (amount: number) => string;
    variant?: Variant;
}

export default function PriceBreakdown({ priceDetails, formatPrice, variant = 'details' }: PriceBreakdownProps) {
    const pd = priceDetails ?? {
        basePrice: 0,
        providerProfit: 0,
        shippingCost: 0,
        shippingToPristina: 0,
        marginAmount: 0,
        marginPercentage: 0,
        finalPrice: 0,
        vehicleTypeUsed: 'default',
    };

    const showMargin = pd.marginAmount > 0;
    const marginRow = showMargin
        ? {
              label: `Marzha jonë (${pd.marginPercentage}%):`,
              value: formatPrice(pd.marginAmount),
          }
        : null;

    const rows = variant === 'expenses'
        ? [
              { label: 'Makina (përfshirë transportin detar):', value: formatPrice(pd.basePrice + pd.shippingCost) },
              marginRow,
              { label: 'Transporti Prishtinë:', value: formatPrice(pd.shippingToPristina) },
          ]
        : [
              { label: 'Çmimi bazë (Korea):', value: formatPrice(pd.basePrice) },
              { label: 'Transporti detar (Korea - Durrës):', value: formatPrice(pd.shippingCost) },
              marginRow,
              { label: 'Transporti tokësor (Durrës - Prishtinë):', value: formatPrice(pd.shippingToPristina) },
          ];

    return (
        <div className="space-y-2 text-sm">
            {rows.map((row) =>
                row ? (
                    <div key={row.label} className="flex justify-between">
                        <span className="text-white/60">{row.label}</span>
                        <span className="text-white">{row.value}</span>
                    </div>
                ) : null
            )}
            <div className="border-t border-white/10 my-2 pt-2">
                <div className="flex justify-between font-bold">
                    <span>Totali:</span>
                    <span className="text-orange-500">{formatPrice(pd.finalPrice)}</span>
                </div>
            </div>
        </div>
    );
}