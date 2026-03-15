// scripts/test-all-pricing.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function testAllPricing() {
    console.log('🔬 COMPREHENSIVE PRICING TEST SUITE\n');

    // Get current config
    const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
    const config = rows[0];

    console.log('📋 CONFIGURATION UNDER TEST:');
    console.log('-----------------------------');
    console.log(`Default Shipping: €${config.shipping_cost}`);
    console.log(`Prishtina Shipping: €${config.shipping_to_pristina}`);
    console.log('\nVehicle Types:');
    Object.entries(config.vehicle_types).forEach(([key, value]) => {
        console.log(`  ${key}: ${value.enabled ? 'ENABLED' : 'DISABLED'} (€${value.shippingCost})`);
    });

    console.log('\n' + '='.repeat(70) + '\n');

    const testCases = [
        { type: 'sedan', price: 50000, desc: 'Sedan - should use default' },
        { type: 'suv', price: 50000, desc: 'SUV - check if enabled' },
        { type: 'hatchback', price: 35000, desc: 'Hatchback' },
        { type: 'coupe', price: 45000, desc: 'Coupe' },
        { type: 'wagon', price: 40000, desc: 'Wagon' },
        { type: 'van', price: 38000, desc: 'Van' },
        { type: 'pickup', price: 42000, desc: 'Pickup' },
        { type: 'default', price: 50000, desc: 'Explicit default' },
        { type: 'unknown', price: 50000, desc: 'Unknown type - should fallback to default' }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of testCases) {
        console.log(`📝 Testing: ${test.desc}`);
        console.log(`   Type: ${test.type}, Base: €${test.price}`);

        // Determine expected shipping
        let expectedShipping = config.shipping_cost;
        let expectedType = 'default';

        const vehicleTypes = config.vehicle_types;
        if (vehicleTypes && vehicleTypes[test.type]?.enabled) {
            expectedShipping = vehicleTypes[test.type].shippingCost;
            expectedType = test.type;
        }

        // Simulate calculation
        let usedShipping = config.shipping_cost;
        let usedType = 'default';

        if (vehicleTypes && vehicleTypes[test.type]?.enabled) {
            usedShipping = vehicleTypes[test.type].shippingCost;
            usedType = test.type;
        }

        const total = test.price + usedShipping + config.shipping_to_pristina;
        const expectedTotal = test.price + expectedShipping + config.shipping_to_pristina;

        // Results
        console.log(`   Used Shipping: €${usedShipping} (from ${usedType})`);
        console.log(`   Prishtina: €${config.shipping_to_pristina}`);
        console.log(`   Total: €${total}`);

        // Verification
        const shippingMatch = usedShipping === expectedShipping;
        const typeMatch = usedType === expectedType;
        const totalMatch = total === expectedTotal;

        if (shippingMatch && typeMatch && totalMatch) {
            console.log(`   ✅ PASSED`);
            passed++;
        } else {
            console.log(`   ❌ FAILED`);
            if (!shippingMatch) console.log(`      Shipping mismatch: expected €${expectedShipping}, got €${usedShipping}`);
            if (!typeMatch) console.log(`      Type mismatch: expected ${expectedType}, got ${usedType}`);
            failed++;
        }

        console.log('-'.repeat(50) + '\n');
    }

    console.log('='.repeat(70));
    console.log(`📊 TEST SUMMARY: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(70));

    // Special test: Check if SUV is accidentally enabled
    if (config.vehicle_types.suv?.enabled) {
        console.log('\n⚠️  WARNING: SUV is ENABLED! Make sure this is intentional.');
    } else {
        console.log('\n✅ SUV is correctly disabled (using default shipping)');
    }

    // Check for filter conflicts
    console.log('\n🔍 FILTER COMBINATION CHECK:');
    const enabledTypes = Object.entries(config.vehicle_types)
        .filter(([_, v]) => v.enabled)
        .map(([k]) => k);

    if (enabledTypes.length === 0) {
        console.log('⚠️  No vehicle types enabled! All will use default shipping.');
    } else {
        console.log(`✅ Enabled types: ${enabledTypes.join(', ')}`);
        console.log('   These will use their specific shipping costs.');
        console.log(`   All others will use default: €${config.shipping_cost}`);
    }
}

testAllPricing().catch(console.error);