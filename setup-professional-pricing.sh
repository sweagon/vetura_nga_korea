#!/bin/bash

echo "🚀 Setting up Professional Pricing System with Real-time Exchange Rates"
echo "========================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ Found $1${NC}"
        return 0
    else
        echo -e "${RED}❌ File not found: $1${NC}"
        return 1
    fi
}

# Function to backup file
backup_file() {
    local file=$1
    local backup="${file}.backup-$(date +%Y%m%d-%H%M%S)"
    cp "$file" "$backup"
    echo -e "${GREEN}✅ Backed up $file to $backup${NC}"
}

echo ""
echo "📦 Step 1: Installing required packages"
echo "----------------------------------------"
npm install axios
echo -e "${GREEN}✅ Installed axios${NC}"

echo ""
echo "📁 Step 2: Creating exchange rate service"
echo "------------------------------------------"

# Create lib/exchangeRates.ts
cat > lib/exchangeRates.ts << 'EOF'
// lib/exchangeRates.ts
import axios from 'axios';

// Free exchange rate API (you can upgrade to paid for production)
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/';

// Cache exchange rates to avoid hitting API limit
let rateCache: {
    usdToEur: number | null;
    krwToEur: number | null;
    lastFetched: Date | null;
} = {
    usdToEur: null,
    krwToEur: null,
    lastFetched: null
};

// Cache expiry time (1 hour)
const CACHE_EXPIRY = 60 * 60 * 1000;

export async function getExchangeRates(): Promise<{ usdToEur: number; krwToEur: number }> {
    try {
        // Check if cache is valid
        if (rateCache.lastFetched && 
            (new Date().getTime() - rateCache.lastFetched.getTime()) < CACHE_EXPIRY &&
            rateCache.usdToEur &&
            rateCache.krwToEur) {
            console.log('📊 Using cached exchange rates');
            return {
                usdToEur: rateCache.usdToEur,
                krwToEur: rateCache.krwToEur
            };
        }

        console.log('🌐 Fetching fresh exchange rates...');
        
        // Fetch USD as base (most common)
        const usdResponse = await axios.get(`${EXCHANGE_API_URL}USD`);
        const krwResponse = await axios.get(`${EXCHANGE_API_URL}KRW`);

        // Get rates to EUR
        const usdToEur = usdResponse.data.rates?.EUR || 0.93;
        const krwToEur = krwResponse.data.rates?.EUR || 0.00068;

        // Update cache
        rateCache = {
            usdToEur,
            krwToEur,
            lastFetched: new Date()
        };

        console.log('✅ Exchange rates updated:', { usdToEur, krwToEur });

        return { usdToEur, krwToEur };
    } catch (error) {
        console.error('❌ Error fetching exchange rates:', error);
        
        // Return cached rates if available, otherwise fallback
        if (rateCache.usdToEur && rateCache.krwToEur) {
            console.log('⚠️ Using expired cache due to API error');
            return {
                usdToEur: rateCache.usdToEur,
                krwToEur: rateCache.krwToEur
            };
        }
        
        // Ultimate fallback
        console.log('⚠️ Using fallback exchange rates');
        return {
            usdToEur: 0.93,
            krwToEur: 0.00068
        };
    }
}

// For server-side only
export async function getExchangeRatesServer(): Promise<{ usdToEur: number; krwToEur: number }> {
    return getExchangeRates();
}
EOF
echo -e "${GREEN}✅ Created lib/exchangeRates.ts${NC}"

echo ""
echo "📁 Step 3: Creating price calculator service"
echo "---------------------------------------------"

# Create lib/priceCalculator.ts
cat > lib/priceCalculator.ts << 'EOF'
// lib/priceCalculator.ts
import { Lot } from './api';
import { getExchangeRates, getExchangeRatesServer } from './exchangeRates';

export interface CalculatedPrice {
    basePriceEur: number;
    exchangeRate: {
        usdToEur: number;
        krwToEur: number;
    };
    source: 'original_price' | 'buy_now' | 'fallback';
    originalCurrency: 'KRW' | 'USD' | 'N/A';
    originalAmount: number;
}

export async function calculateBasePriceInEUR(lot: Lot | undefined): Promise<CalculatedPrice> {
    if (!lot) {
        return {
            basePriceEur: 0,
            exchangeRate: { usdToEur: 0, krwToEur: 0 },
            source: 'fallback',
            originalCurrency: 'N/A',
            originalAmount: 0
        };
    }

    // Get current exchange rates
    const rates = await getExchangeRates();

    // Priority 1: original_price in KRW
    if (lot.details?.original_price) {
        const basePriceEur = Math.round(lot.details.original_price * rates.krwToEur);
        return {
            basePriceEur,
            exchangeRate: rates,
            source: 'original_price',
            originalCurrency: 'KRW',
            originalAmount: lot.details.original_price
        };
    }

    // Priority 2: buy_now in USD
    if (lot.buy_now) {
        const basePriceEur = Math.round(lot.buy_now * rates.usdToEur);
        return {
            basePriceEur,
            exchangeRate: rates,
            source: 'buy_now',
            originalCurrency: 'USD',
            originalAmount: lot.buy_now
        };
    }

    // Fallback
    return {
        basePriceEur: 0,
        exchangeRate: rates,
        source: 'fallback',
        originalCurrency: 'N/A',
        originalAmount: 0
    };
}

// For client-side caching
let cachedRates: { usdToEur: number; krwToEur: number } | null = null;
let lastFetch = 0;

export async function getCachedExchangeRates(): Promise<{ usdToEur: number; krwToEur: number }> {
    const now = Date.now();
    
    // Refresh cache every 5 minutes
    if (!cachedRates || now - lastFetch > 5 * 60 * 1000) {
        cachedRates = await getExchangeRates();
        lastFetch = now;
    }
    
    return cachedRates;
}

// Synchronous version with warning (for backward compatibility)
export function getBasePriceInEUR(lot: Lot | undefined): number {
    console.warn('⚠️ Using synchronous price calculation with approximate rates. Consider using calculateBasePriceInEUR for accurate prices.');
    
    if (!lot) return 0;
    
    // Approximate rates (fallback only)
    if (lot.details?.original_price) {
        return Math.round(lot.details.original_price * 0.00068);
    }
    
    if (lot.buy_now) {
        return Math.round(lot.buy_now * 0.93);
    }
    
    return 0;
}
EOF
echo -e "${GREEN}✅ Created lib/priceCalculator.ts${NC}"

echo ""
echo "📁 Step 4: Creating exchange rates API endpoint"
echo "------------------------------------------------"

# Create app/api/exchange-rates/route.ts
mkdir -p app/api/exchange-rates
cat > app/api/exchange-rates/route.ts << 'EOF'
// app/api/exchange-rates/route.ts
import { NextResponse } from 'next/server';
import { getExchangeRatesServer } from '@/lib/exchangeRates';

export async function GET() {
    try {
        const rates = await getExchangeRatesServer();
        
        return NextResponse.json({
            success: true,
            rates,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return NextResponse.json({
            success: false,
            rates: {
                usdToEur: 0.93,
                krwToEur: 0.00068
            },
            timestamp: new Date().toISOString(),
            error: 'Using fallback rates'
        });
    }
}
EOF
echo -e "${GREEN}✅ Created app/api/exchange-rates/route.ts${NC}"

echo ""
echo "📁 Step 5: Creating exchange rates admin panel"
echo "------------------------------------------------"

# Create app/admin/exchange-rates/page.tsx
mkdir -p app/admin/exchange-rates
cat > app/admin/exchange-rates/page.tsx << 'EOF'
'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

export default function ExchangeRatesPage() {
    const [rates, setRates] = useState({ usdToEur: 0.93, krwToEur: 0.00068 });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/exchange-rates');
            const data = await response.json();
            setRates(data.rates);
            setMessage('Kurset u rifreskuan');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error fetching rates:', error);
            setMessage('Gabim gjatë rifreskimit');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Here you would save to your database
        setMessage('Kurset u ruajtën');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-blue via-dark-blue to-navy py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <h1 className="text-2xl font-bold text-white mb-6">Kurset e Këmbimit</h1>

                    {message && (
                        <div className="mb-4 p-3 bg-green-500/20 text-green-500 rounded-lg">
                            {message}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/70 mb-2">USD → EUR</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={rates.usdToEur}
                                    onChange={(e) => setRates({ ...rates, usdToEur: parseFloat(e.target.value) })}
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                    step="0.01"
                                />
                                <button
                                    onClick={fetchRates}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                >
                                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/70 mb-2">KRW → EUR</label>
                            <input
                                type="number"
                                value={rates.krwToEur}
                                onChange={(e) => setRates({ ...rates, krwToEur: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                                step="0.00001"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            Ruaj Ndryshimet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
EOF
echo -e "${GREEN}✅ Created app/admin/exchange-rates/page.tsx${NC}"

echo ""
echo "📝 Step 6: Updating lib/api.ts"
echo "-------------------------------"

if check_file "lib/api.ts"; then
    backup_file "lib/api.ts"
    
    # Append helper functions to api.ts
    cat >> lib/api.ts << 'EOF'

// ============ PROFESSIONAL PRICING FUNCTIONS ============
import { calculateBasePriceInEUR } from './priceCalculator';

// Async version that gets real exchange rates
export async function getBasePriceInEURAsync(lot: Lot | undefined): Promise<number> {
    const result = await calculateBasePriceInEUR(lot);
    return result.basePriceEur;
}

// Get full price details with source info
export async function getPriceDetails(lot: Lot | undefined): Promise<{
    price: number;
    source: string;
    originalCurrency: string;
    originalAmount: number;
}> {
    const result = await calculateBasePriceInEUR(lot);
    return {
        price: result.basePriceEur,
        source: result.source,
        originalCurrency: result.originalCurrency,
        originalAmount: result.originalAmount
    };
}
EOF
    echo -e "${GREEN}✅ Updated lib/api.ts with professional pricing functions${NC}"
fi

echo ""
echo "🔄 Step 7: Updating components to use async pricing"
echo "----------------------------------------------------"

# Update CarDetailClient.tsx
if check_file "components/cars/CarDetailClient.tsx"; then
    backup_file "components/cars/CarDetailClient.tsx"
    
    # Create a temporary file with the updated content
    cat components/cars/CarDetailClient.tsx | sed '/const price =/d' > /tmp/CarDetailClient.tmp
    
    # Add the new async price loading
    cat > /tmp/CarDetailClient.new << 'EOF'
    // Professional pricing with real-time exchange rates
    const [basePrice, setBasePrice] = useState(0);
    const [loadingPrice, setLoadingPrice] = useState(true);
    const [priceSource, setPriceSource] = useState('');

    useEffect(() => {
        const loadPrice = async () => {
            if (lot) {
                setLoadingPrice(true);
                try {
                    const { getPriceDetails } = await import('@/lib/api');
                    const details = await getPriceDetails(lot);
                    setBasePrice(details.price);
                    setPriceSource(`${details.source} (${details.originalCurrency})`);
                } catch (error) {
                    console.error('Error loading price:', error);
                    // Fallback to synchronous calculation
                    const { getBasePriceInEUR } = await import('@/lib/priceCalculator');
                    setBasePrice(getBasePriceInEUR(lot));
                } finally {
                    setLoadingPrice(false);
                }
            }
        };
        
        loadPrice();
    }, [lot]);

    // Use basePrice in calculateFinalPrice
EOF
    
    # Insert the new code after the lot declaration
    # This is a simplified approach - you may need to manually adjust
    echo -e "${YELLOW}⚠️ Please manually update components/cars/CarDetailClient.tsx to use async pricing${NC}"
    echo "   See the instructions below:"
fi

echo ""
echo "📋 Manual Update Instructions for CarDetailClient.tsx:"
echo "========================================================"
echo ""
echo "1. Add these imports at the top:"
echo "   import { getPriceDetails } from '@/lib/api';"
echo "   import { useState, useEffect } from 'react';"
echo ""
echo "2. After getting the lot, add:"
echo ""
echo '   const [basePrice, setBasePrice] = useState(0);'
echo '   const [loadingPrice, setLoadingPrice] = useState(true);'
echo ""
echo '   useEffect(() => {'
echo '       const loadPrice = async () => {'
echo '           if (lot) {'
echo '               setLoadingPrice(true);'
echo '               try {'
echo '                   const details = await getPriceDetails(lot);'
echo '                   setBasePrice(details.price);'
echo '               } catch (error) {'
echo '                   console.error("Error loading price:", error);'
echo '                   const { getBasePriceInEUR } = await import("@/lib/priceCalculator");'
echo '                   setBasePrice(getBasePriceInEUR(lot));'
echo '               } finally {'
echo '                   setLoadingPrice(false);'
echo '               }'
echo '           }'
echo '       };'
echo '       loadPrice();'
echo '   }, [lot]);'
echo ""
echo "3. Replace the price calculation with:"
echo '   const priceDetails = mounted && !loadingPrice ? calculateFinalPrice(basePrice, effectiveVehicleType) : {'
echo '       basePrice: basePrice,'
echo '       shippingCost: config.shippingCost,'
echo '       shippingToPristina: config.shippingToPristina,'
echo '       finalPrice: basePrice + config.shippingCost + config.shippingToPristina,'
echo '       vehicleTypeUsed: effectiveVehicleType'
echo '   };'
echo ""

echo ""
echo "📋 Manual Update Instructions for CarCard.tsx:"
echo "================================================"
echo ""
echo "Replace the price calculation with:"
echo ""
echo '   const [displayPrice, setDisplayPrice] = useState(0);'
echo '   '
echo '   useEffect(() => {'
echo '       const loadPrice = async () => {'
echo '           if (lot) {'
echo '               const { getBasePriceInEURAsync } = await import("@/lib/api");'
echo '               const price = await getBasePriceInEURAsync(lot);'
echo '               setDisplayPrice(price + (config?.shippingToPristina || 350));'
echo '           }'
echo '       };'
echo '       loadPrice();'
echo '   }, [lot, config]);'
echo ""

echo ""
echo "🧪 Step 8: Testing the setup"
echo "-----------------------------"
echo -e "${YELLOW}Run these commands to test:${NC}"
echo "1. npm run dev"
echo "2. Visit http://localhost:3000/api/exchange-rates"
echo "3. Visit http://localhost:3000/admin/exchange-rates"
echo "4. Check a car detail page and look for console logs"
echo ""

echo ""
echo "🎉 Professional Pricing Setup Complete!"
echo "========================================"
echo -e "${GREEN}✅ Exchange rate service created${NC}"
echo -e "${GREEN}✅ Price calculator created${NC}"
echo -e "${GREEN}✅ API endpoint created${NC}"
echo -e "${GREEN}✅ Admin panel created${NC}"
echo -e "${YELLOW}⚠️ Manual updates needed for components${NC}"
echo ""
echo "Next steps:"
echo "1. Manually update CarDetailClient.tsx and CarCard.tsx as shown above"
echo "2. Test the exchange rates endpoint"
echo "3. Monitor the console for any errors"
echo "4. Consider upgrading to a paid exchange rate API for production"