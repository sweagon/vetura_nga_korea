// scripts/debug-car-price.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

const VIN = process.argv[2] || 'SCBFT63W0GC057590'; // Your Bentley

async function debugCarPrice() {
    console.log(`🔍 Debugging price for VIN: ${VIN}\n`);

    try {
        // 1. Get car data from API
        const response = await fetch(`http://localhost:3000/api/proxy/vin/${VIN}`);
        const car = await response.json();
        const lot = car.lots?.[0];

        if (!lot) {
            console.log('❌ No lot found');
            return;
        }

        console.log('📊 RAW API DATA:');
        console.log('----------------');
        console.log(`buy_now (USD): $${lot.buy_now?.toLocaleString()}`);
        console.log(`original_price (KRW): ₩${lot.details?.original_price?.toLocaleString()}`);
        console.log(`price_with_margin_and_kosovo: €${lot.price_with_margin_and_kosovo?.toLocaleString()}`);
        console.log(`step5: €${lot.step5?.toLocaleString()}`);

        // 2. Calculate our price
        console.log('\n🧮 OUR CALCULATION:');
        console.log('-------------------');

        // Get current config from DB
        const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
        const config = rows[0];

        console.log('Current config:');
        console.log(`- Default shipping: €${config.shipping_cost}`);
        console.log(`- Prishtina shipping: €${config.shipping_to_pristina}`);

        // Convert KRW to EUR (using approximate rate)
        const KRW_TO_EUR = 0.00068;
        const basePriceFromKRW = Math.round(lot.details?.original_price * KRW_TO_EUR);

        // Convert USD to EUR (using approximate rate)
        const USD_TO_EUR = 0.93;
        const basePriceFromUSD = Math.round(lot.buy_now * USD_TO_EUR);

        console.log('\nBase price conversions:');
        console.log(`- From original_price (KRW): €${basePriceFromKRW.toLocaleString()}`);
        console.log(`- From buy_now (USD): €${basePriceFromUSD.toLocaleString()}`);

        // Determine which base price we're using
        const usedBasePrice = basePriceFromKRW || basePriceFromUSD;
        console.log(`\n👉 Using base price: €${usedBasePrice.toLocaleString()}`);

        // Add our shipping
        const ourPrice = usedBasePrice + config.shipping_cost + config.shipping_to_pristina;
        console.log(`+ Our shipping: €${config.shipping_cost} + €${config.shipping_to_pristina}`);
        console.log(`= Our final price: €${ourPrice.toLocaleString()}`);

        // 3. Compare with other site
        console.log('\n🔁 COMPARISON:');
        console.log('--------------');
        console.log(`Other site price: €25,774`);
        console.log(`Our price: €${ourPrice.toLocaleString()}`);
        console.log(`Difference: €${(ourPrice - 25774).toLocaleString()}`);

        // 4. Check if other site is using price_with_margin_and_kosovo
        console.log('\n💡 ANALYSIS:');
        console.log('------------');
        if (lot.price_with_margin_and_kosovo) {
            console.log(`API's pre-calculated price: €${lot.price_with_margin_and_kosovo.toLocaleString()}`);
            console.log(`Other site likely uses this: €${lot.price_with_margin_and_kosovo.toLocaleString()}`);
            console.log(`\nThis matches other site's price: ${lot.price_with_margin_and_kosovo === 25774 ? '✅ YES' : '❌ NO'}`);
        }

        // 5. Check exchange rates
        console.log('\n📈 EXCHANGE RATE CHECK:');
        console.log('----------------------');
        const actualRate = lot.price_with_margin_and_kosovo / lot.details?.original_price;
        console.log(`API's effective KRW→EUR rate: ${(actualRate * 10000).toFixed(2)} per 10,000 KRW`);
        console.log(`Our rate: 6.8 per 10,000 KRW`);

    } catch (error) {
        console.error('Error:', error);
    }
}

debugCarPrice();