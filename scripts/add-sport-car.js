// scripts/add-sport-car.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function addSportCar() {
    console.log('🚗 Adding sport_car to vehicle types...');

    try {
        // Get current config
        const { rows } = await sql`SELECT vehicle_types FROM site_config WHERE id = 1`;
        const currentTypes = rows[0].vehicle_types;

        // Add sport_car if it doesn't exist
        if (!currentTypes.sport_car) {
            currentTypes.sport_car = {
                shippingCost: 3500,
                marginPercentage: 15,
                minimumMargin: 1500,
                enabled: true
            };

            await sql`
                UPDATE site_config 
                SET vehicle_types = ${JSON.stringify(currentTypes)}::jsonb,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
            `;

            console.log('✅ Added sport_car to vehicle types');
        } else {
            console.log('✅ sport_car already exists');
        }

        console.log('\n📊 Updated vehicle types:', JSON.stringify(currentTypes, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

addSportCar();