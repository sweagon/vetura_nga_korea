// scripts/add-margin-fields.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function addMarginFields() {
    console.log('📦 Adding margin fields to database...');
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Found' : '❌ Not found');

    try {
        // Get current config
        const { rows } = await sql`SELECT * FROM site_config WHERE id = 1`;
        const currentConfig = rows[0];

        console.log('\n📊 Current config before update:');
        console.log(JSON.stringify(currentConfig.vehicle_types, null, 2));

        // Update vehicle_types to include margin fields
        const updatedVehicleTypes = {};

        // Default margins by vehicle type
        const defaultMargins = {
            suv: { marginPercentage: 18, minimumMargin: 1500 },
            sedan: { marginPercentage: 15, minimumMargin: 1000 },
            hatchback: { marginPercentage: 15, minimumMargin: 1000 },
            wagon: { marginPercentage: 15, minimumMargin: 1000 },
            coupe: { marginPercentage: 15, minimumMargin: 1000 },
            van: { marginPercentage: 12, minimumMargin: 800 },
            pickup: { marginPercentage: 12, minimumMargin: 800 },
            default: { marginPercentage: 15, minimumMargin: 1000 }
        };

        // Process each vehicle type
        for (const [key, value] of Object.entries(currentConfig.vehicle_types)) {
            const defaults = defaultMargins[key] || defaultMargins.default;
            updatedVehicleTypes[key] = {
                shippingCost: value.shippingCost,
                enabled: value.enabled,
                marginPercentage: value.marginPercentage || defaults.marginPercentage,
                minimumMargin: value.minimumMargin || defaults.minimumMargin
            };
        }

        // Update the database
        await sql`
            UPDATE site_config SET
                vehicle_types = ${JSON.stringify(updatedVehicleTypes)}::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `;

        console.log('\n✅ Added margin fields to vehicle types:');
        console.log(JSON.stringify(updatedVehicleTypes, null, 2));

        // Verify the update
        const { rows: updated } = await sql`SELECT * FROM site_config WHERE id = 1`;
        console.log('\n✅ Verification - Config updated successfully');
        console.log('New vehicle_types:', JSON.stringify(updated[0].vehicle_types, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

addMarginFields();