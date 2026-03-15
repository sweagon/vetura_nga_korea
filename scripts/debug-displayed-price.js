const { getApiPriceży } = require('../lib/api');

const VIN = 'SCBFT63W0GC057590'; // Your test car

async function debugPrice() {
    console.log('🔍 Debugging displayed price\n');

    try {
        // 1. Fetch the car data
        const response = await fetch(`http://localhost:3000/api/proxy/vin/${VIN}`);
        const car = await response.json();
        const lot = car.lots?.[0];

        if (!lot) {
            console.log('❌ No lot found');
            return;
        }

        console.log('📊 API DATA:');
        console.log('------------');
        console.log(`price_with_margin_and_kosovo: €${lot.price_with_margin_and_kosovo}`);
        console.log(`step5: €${lot.step5}`);
        console.log(`buy_now: $${lot.buy_now}`);
        console.log(`original_price: ₩${lot.details?.original_price}`);

        console.log('\n🧮 OUR CALCULATION:');
        console.log('-------------------');

        // Check what getApiPrice returns
        const { getApiPrice } = require('../lib/api');
        const apiPrice = getApiPrice(lot);
        console.log(`getApiPrice() returns: €${apiPrice}`);

        // Check what calculateBasePriceInEUR returns
        const { calculateBasePriceInEUR } = require('../lib/priceCalculator');
        const calculated = await calculateBasePriceInEUR(lot);
        console.log(`calculateBasePriceInEUR returns:`);
        console.log(`  - price: €${calculated.basePriceEur}`);
        console.log(`  - source: ${calculated.source}`);
        console.log(`  - exchange rate used: ${calculated.exchangeRate.krwToEur}`);

        // Check what's in the database config
        const { sql } = require('@vercel/postgres');
        require('dotenv').config({ path: '.env.local' });
        const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
        console.log('\n📋 DATABASE CONFIG:');
        console.log(`shipping_cost: €${rows[0]?.shipping_cost}`);
        console.log(`shipping_to_pristina: €${rows[0]?.shipping_to_pristina}`);

        // Calculate what final price should be
        const finalPrice = apiPrice + rows[0]?.shipping_to_pristina;
        console.log(`\n💰 FINAL PRICE SHOULD BE: €${finalPrice} (€${apiPrice} + €${rows[0]?.shipping_to_pristina})`);

        if (apiPrice === 25774) {
            console.log('✅ API price matches target: €25,774');
        } else {
            console.log(`❌ API price mismatch: expected €25,774, got €${apiPrice}`);
            console.log(`   Difference: €${apiPrice - 25774}`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugPrice();
