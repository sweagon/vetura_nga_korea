// scripts/check-config.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function checkConfig() {
    console.log('🔍 Checking database configuration...\n');

    const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
    const config = rows[0];

    console.log('📋 Current config:');
    console.log('------------------');
    console.log(`shipping_cost: €${config.shipping_cost}`);
    console.log(`shipping_to_pristina: €${config.shipping_to_pristina}`);
    console.log(`defaultMarginPercentage: ${config.defaultMarginPercentage || 'NOT SET'}`);
    console.log(`defaultMinimumMargin: €${config.defaultMinimumMargin || 'NOT SET'}`);

    console.log('\n🚗 Vehicle Types:');
    Object.entries(config.vehicle_types).forEach(([key, value]) => {
        console.log(`  ${key}:`);
        console.log(`    enabled: ${value.enabled}`);
        console.log(`    shippingCost: €${value.shippingCost}`);
        console.log(`    marginPercentage: ${value.marginPercentage || 15}%`);
        console.log(`    minimumMargin: €${value.minimumMargin || 1000}`);
    });
}

checkConfig();