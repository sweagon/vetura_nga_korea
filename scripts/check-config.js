require('dotenv').config({ path: '.env' });
const { sql } = require('@vercel/postgres');

async function checkConfig() {
    console.log('🔍 Checking database config...\n');

    try {
        // Check site_config
        const { rows: configRows } = await sql`
            SELECT * FROM site_config WHERE id = 1
        `;

        if (configRows.length === 0) {
            console.log('❌ No config found in database!');
        } else {
            console.log('✅ Config found:');
            console.log('   - Shipping Cost:', configRows[0].shipping_cost);
            console.log('   - Default Margin:', configRows[0].default_margin_percentage);
            console.log('   - Vehicle Types:', Object.keys(configRows[0].vehicle_types).join(', '));
        }

        // Check admin sessions
        const { rows: sessionRows } = await sql`
            SELECT COUNT(*) as count FROM admin_sessions WHERE expires_at > NOW()
        `;
        console.log('\n📊 Active sessions:', sessionRows[0].count);

        // Check exchange rates
        const { rows: ratesRows } = await sql`
            SELECT * FROM exchange_rates WHERE id = 1
        `;

        if (ratesRows.length === 0) {
            console.log('❌ No exchange rates found!');
        } else {
            console.log('✅ Exchange rates found');
        }

    } catch (error) {
        console.error('Error checking config:', error);
    }
}

checkConfig();