// scripts/reset-to-defaults.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function resetConfig() {
    console.log('🔄 Resetting config to defaults...');

    const defaultConfig = {
        shippingCost: 3500,
        shippingToPristina: 350,
        contactEmail: 'blerart@outlook.com',
        contactPhone: '+383 49 195 414',
        siteName: 'Vetura Korea Kosova',
        currency: 'EUR',
        vehicleTypes: {
            suv: { shippingCost: 4500, enabled: false },
            sedan: { shippingCost: 3500, enabled: true },
            hatchback: { shippingCost: 3500, enabled: true },
            wagon: { shippingCost: 3500, enabled: true },
            coupe: { shippingCost: 3500, enabled: true },
            van: { shippingCost: 3800, enabled: true },
            pickup: { shippingCost: 4000, enabled: true },
            default: { shippingCost: 3500, enabled: true }
        }
    };

    try {
        await sql`
            UPDATE site_config SET
                shipping_cost = ${defaultConfig.shippingCost},
                shipping_to_pristina = ${defaultConfig.shippingToPristina},
                vehicle_types = ${JSON.stringify(defaultConfig.vehicleTypes)}::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `;

        console.log('✅ Config reset to defaults!');
        console.log('\nNew values:');
        console.log(`- Default shipping: €${defaultConfig.shippingCost}`);
        console.log(`- Prishtina shipping: €${defaultConfig.shippingToPristina}`);
        console.log('\nVehicle types:');
        Object.entries(defaultConfig.vehicleTypes).forEach(([key, val]) => {
            console.log(`  ${key}: ${val.enabled ? 'ENABLED' : 'DISABLED'} (€${val.shippingCost})`);
        });

    } catch (error) {
        console.error('❌ Error resetting config:', error);
    }
}

resetConfig();