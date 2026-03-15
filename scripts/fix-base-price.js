// scripts/fix-base-price.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function fixBasePrice() {
    console.log('Ì¥ß Fixing base price calculation...\n');
    
    // Check what's in the database
    const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
    console.log('Current config:', rows[0]?.vehicle_types);
    
    // Update price calculation function in the database if needed
    // This is just for reference - the real fix is in the code
    
    console.log('\n‚úÖ To fix the price, we need to ensure:');
    console.log('1. Exchange rate is exactly 0.000628 (6.28 per 10,000 KRW)');
    console.log('2. price_with_margin_and_kosovo is used first');
    console.log('3. No extra calculations are applied');
    
    // Verify the exchange rate in the code
    console.log('\nÌ≥Å Check these files:');
    console.log('   - lib/priceCalculator.ts - exchange rate should be 0.000628');
    console.log('   - lib/api.ts - getApiPrice should return price_with_margin_and_kosovo');
    console.log('   - components/cars/CarDetailClient.tsx - should use apiPrice directly');
}

fixBasePrice();
