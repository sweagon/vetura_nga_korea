// scripts/debug-price.mjs
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const VIN = 'SCBFT63W0GC057590';

async function debugPrice() {
    console.log('Ì¥ç Debugging price for VIN:', VIN);
    console.log('='.repeat(60));
    
    try {
        // 1. Fetch car data from API
        console.log('\nÌ≥° Fetching car data...');
        const response = await fetch(`http://localhost:3000/api/proxy/vin/${VIN}`);
        const car = await response.json();
        const lot = car.lots?.[0];
        
        if (!lot) {
            console.log('‚ùå No lot found');
            return;
        }
        
        console.log('\nÌ≥ä API RAW DATA:');
        console.log('----------------');
        console.log(`price_with_margin_and_kosovo: ‚Ç¨${lot.price_with_margin_and_kosovo}`);
        console.log(`step5: ‚Ç¨${lot.step5}`);
        console.log(`buy_now: $${lot.buy_now?.toLocaleString()}`);
        console.log(`original_price: ‚Ç©${lot.details?.original_price?.toLocaleString()}`);
        
        // 2. Calculate using different methods
        console.log('\nÌ∑Æ PRICE CALCULATIONS:');
        console.log('----------------------');
        
        // Method 1: Direct API price (what other site uses)
        const apiPrice = lot.price_with_margin_and_kosovo || lot.step5;
        console.log(`1. Direct API price: ‚Ç¨${apiPrice}`);
        
        // Method 2: From original_price with correct rate
        if (lot.details?.original_price) {
            const correctRate = Math.round(lot.details.original_price * 0.000628);
            console.log(`2. From original_price (0.000628): ‚Ç¨${correctRate}`);
            console.log(`   Difference from API: ‚Ç¨${correctRate - apiPrice}`);
        }
        
        // Method 3: From original_price with old rate
        if (lot.details?.original_price) {
            const oldRate = Math.round(lot.details.original_price * 0.00068);
            console.log(`3. From original_price (0.00068 - OLD): ‚Ç¨${oldRate}`);
            console.log(`   Difference from API: ‚Ç¨${oldRate - apiPrice}`);
        }
        
        // Method 4: From buy_now
        if (lot.buy_now) {
            const fromUSD = Math.round(lot.buy_now * 0.93);
            console.log(`4. From buy_now (0.93): ‚Ç¨${fromUSD}`);
            console.log(`   Difference from API: ‚Ç¨${fromUSD - apiPrice}`);
        }
        
        // 3. Get database config
        const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
        const config = rows[0];
        
        console.log('\nÌ≥ã DATABASE CONFIG:');
        console.log('------------------');
        console.log(`shipping_cost: ‚Ç¨${config.shipping_cost}`);
        console.log(`shipping_to_pristina: ‚Ç¨${config.shipping_to_pristina}`);
        
        // 4. Final price calculations
        console.log('\nÌ≤∞ FINAL PRICES:');
        console.log('----------------');
        console.log(`Other site price: ‚Ç¨25,774`);
        console.log(`Our base price (should match): ‚Ç¨${apiPrice}`);
        console.log(`+ Prishtina shipping: ‚Ç¨${config.shipping_to_pristina}`);
        console.log(`= Our final price: ‚Ç¨${apiPrice + config.shipping_to_pristina}`);
        
        // 5. Check if we're using the right price
        console.log('\n‚úÖ VERIFICATION:');
        if (apiPrice === 25774) {
            console.log('‚úì API price matches target: ‚Ç¨25,774');
        } else {
            console.log(`‚úó API price mismatch: expected ‚Ç¨25,774, got ‚Ç¨${apiPrice}`);
            console.log(`  Difference: ‚Ç¨${apiPrice - 25774}`);
        }
        
        // 6. Check exchange rate in code
        console.log('\nÌ≥Å CHECK THESE FILES:');
        console.log('1. lib/priceCalculator.ts - should have KRW_TO_EUR = 0.000628');
        console.log('2. lib/api.ts - getApiPrice should return price_with_margin_and_kosovo first');
        
    } catch (error) {
        console.error('‚ùå Error:', error);
    }
}

debugPrice();
