// scripts/verify-api-prices.js
const { getApiPrice } = require('../lib/api');

const VINS = [
    'SCBFT63W0GC057590', // Your test Bentley
    // Add more VINs as needed
];

async function verifyPrices() {
    console.log('🔍 Verifying API prices match other site\n');
    
    for (const vin of VINS) {
        try {
            const response = await fetch(`http://localhost:3000/api/proxy/vin/${vin}`);
            const car = await response.json();
            const lot = car.lots?.[0];
            
            if (!lot) continue;
            
            const ourPrice = getApiPrice(lot);
            
            console.log(`VIN: ${vin}`);
            console.log(`Car: ${car.manufacturer?.name} ${car.model?.name} ${car.year}`);
            console.log(`Our price: €${ourPrice.toLocaleString()}`);
            console.log(`API price_with_margin: €${lot.price_with_margin_and_kosovo?.toLocaleString()}`);
            console.log(`Match: ${ourPrice === lot.price_with_margin_and_kosovo ? '✅ YES' : '❌ NO'}`);
            console.log('-'.repeat(40));
        } catch (error) {
            console.error(`Error checking ${vin}:`, error.message);
        }
    }
}

verifyPrices();
