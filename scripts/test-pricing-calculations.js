// scripts/test-pricing-calculations.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

// Mock data for testing
const testCases = [
    {
        name: "Sedan with default config",
        vehicleType: "sedan",
        basePrice: 50000,
        expected: {
            shipping: 3500, // from default
            pristinaShipping: 350,
            total: 53850
        }
    },
    {
        name: "SUV with SUV config ENABLED",
        vehicleType: "suv",
        basePrice: 50000,
        suvEnabled: true,
        suvShipping: 4500,
        expected: {
            shipping: 4500,
            pristinaShipping: 350,
            total: 54850
        }
    },
    {
        name: "SUV with SUV config DISABLED (should use default)",
        vehicleType: "suv",
        basePrice: 50000,
        suvEnabled: false,
        expected: {
            shipping: 3500, // should fall back to default
            pristinaShipping: 350,
            total: 53850
        }
    },
    {
        name: "Unknown vehicle type",
        vehicleType: "unknown",
        basePrice: 50000,
        expected: {
            shipping: 3500,
            pristinaShipping: 350,
            total: 53850
        }
    }
];

async function testPriceCalculations() {
    console.log('🧪 Testing Price Calculations\n');
    console.log('='.repeat(60));

    // Get current config from database
    const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
    const config = rows[0];

    console.log('📊 Current Config from DB:');
    console.log(`   Default Shipping: €${config.shipping_cost}`);
    console.log(`   Prishtina Shipping: €${config.shipping_to_pristina}`);
    console.log(`   Vehicle Types:`, config.vehicle_types);
    console.log('='.repeat(60) + '\n');

    for (const test of testCases) {
        console.log(`\n📝 Test: ${test.name}`);
        console.log('-'.repeat(40));

        // Simulate calculateFinalPrice logic
        let shipping = config.shipping_cost;
        let usedType = 'default';
        let configSource = 'default';

        // Check if vehicle type exists and is enabled
        const vehicleTypes = config.vehicle_types;
        if (vehicleTypes && vehicleTypes[test.vehicleType]) {
            const typeConfig = vehicleTypes[test.vehicleType];

            // Override with test-specific enabled state if provided
            const enabled = test.suvEnabled !== undefined
                ? test.suvEnabled
                : (typeConfig.enabled || false);

            if (enabled) {
                shipping = test.suvShipping || typeConfig.shippingCost || config.shipping_cost;
                usedType = test.vehicleType;
                configSource = `${test.vehicleType} (enabled)`;
            } else {
                configSource = `${test.vehicleType} (disabled - using default)`;
            }
        } else {
            configSource = `${test.vehicleType} (not found - using default)`;
        }

        const pristinaShipping = config.shipping_to_pristina;
        const total = test.basePrice + shipping + pristinaShipping;

        // Results
        console.log(`   Base Price: €${test.basePrice.toLocaleString()}`);
        console.log(`   Shipping Used: €${shipping.toLocaleString()} (from ${configSource})`);
        console.log(`   Prishtina Shipping: €${pristinaShipping.toLocaleString()}`);
        console.log(`   Total: €${total.toLocaleString()}`);

        // Verify against expected
        const expected = test.expected;
        const shippingMatch = shipping === expected.shipping;
        const pristinaMatch = pristinaShipping === expected.pristinaShipping;
        const totalMatch = total === expected.total;

        console.log('\n   ✅ Verification:');
        console.log(`      Shipping: ${shippingMatch ? '✅' : '❌'} (Expected: €${expected.shipping}, Got: €${shipping})`);
        console.log(`      Prishtina: ${pristinaMatch ? '✅' : '❌'} (Expected: €${expected.pristinaShipping}, Got: €${pristinaShipping})`);
        console.log(`      Total: ${totalMatch ? '✅' : '❌'} (Expected: €${expected.total}, Got: €${total})`);

        if (!shippingMatch || !pristinaMatch || !totalMatch) {
            console.log('\n   ⚠️  TEST FAILED!');
        } else {
            console.log('\n   ✅ TEST PASSED!');
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 Testing Complete');
}

testPriceCalculations().catch(console.error);