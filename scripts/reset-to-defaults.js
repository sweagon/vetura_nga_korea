// scripts/reset-to-defaults.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

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

async function resetConfig() {
    console.log('��� Resetting config to defaults...');
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Found' : '❌ Not found');

    try {
        // Show current config
        const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
        console.log('\n��� CURRENT CONFIG:');
        console.log(`- Default shipping: €${rows[0]?.shipping_cost}`);
        console.log(`- Prishtina shipping: €${rows[0]?.shipping_to_pristina}`);

        // Update to defaults
        await sql`
            UPDATE site_config SET
                shipping_cost = ${defaultConfig.shippingCost},
                shipping_to_pristina = ${defaultConfig.shippingToPristina},
                contact_email = ${defaultConfig.contactEmail},
                contact_phone = ${defaultConfig.contactPhone},
                site_name = ${defaultConfig.siteName},
                currency = ${defaultConfig.currency},
                vehicle_types = ${JSON.stringify(defaultConfig.vehicleTypes)}::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `;

        console.log('\n✅ CONFIG RESET COMPLETE!');
        console.log('\n��� NEW VALUES:');
        console.log(`- Default shipping: €${defaultConfig.shippingCost}`);
        console.log(`- Prishtina shipping: €${defaultConfig.shippingToPristina}`);

        console.log('\n��� VEHICLE TYPES:');
        Object.entries(defaultConfig.vehicleTypes).forEach(([key, val]) => {
            console.log(`  ${key}: ${val.enabled ? '✅ ENABLED' : '❌ DISABLED'} (€${val.shippingCost})`);
        });

        // Verify
        const { rows: updated } = await sql`SELECT * FROM site_config WHERE id = 1`;
        console.log('\n✅ VERIFICATION - New default shipping: €' + updated[0]?.shipping_cost);

    } catch (error) {
        console.error('❌ Error resetting config:', error);
    }
}

resetConfig();
