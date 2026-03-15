// scripts/debug-config.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function debugConfig() {
    console.log('🔍 Debugging configuration...\n');

    const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
    const config = rows[0];

    console.log('📋 Database Config:');
    console.log('-------------------');
    console.log('shipping_cost:', config.shipping_cost);
    console.log('shipping_to_pristina:', config.shipping_to_pristina);
    console.log('default_margin_percentage:', config.default_margin_percentage);
    console.log('default_minimum_margin:', config.default_minimum_margin);
    console.log('contact_email:', config.contact_email);
    console.log('contact_phone:', config.contact_phone);
    console.log('site_name:', config.site_name);
    console.log('currency:', config.currency);

    console.log('\n🚗 Vehicle Types:');
    Object.entries(config.vehicle_types).forEach(([key, value]) => {
        console.log(`  ${key}:`);
        console.log(`    enabled: ${value.enabled}`);
        console.log(`    shippingCost: €${value.shippingCost}`);
        console.log(`    marginPercentage: ${value.marginPercentage || 15}%`);
        console.log(`    minimumMargin: €${value.minimumMargin || 1000}`);
    });
}

debugConfig();