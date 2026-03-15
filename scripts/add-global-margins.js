// scripts/add-global-margins.js
const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function addGlobalMargins() {
    console.log('📦 Adding global margin fields to database...');

    try {
        // Add columns if they don't exist
        await sql`
            ALTER TABLE site_config 
            ADD COLUMN IF NOT EXISTS default_margin_percentage INTEGER DEFAULT 15,
            ADD COLUMN IF NOT EXISTS default_minimum_margin INTEGER DEFAULT 1000
        `;

        // Update with default values
        await sql`
            UPDATE site_config 
            SET default_margin_percentage = 15, 
                default_minimum_margin = 1000 
            WHERE id = 1
        `;

        console.log('✅ Global margin fields added successfully');

        // Verify the update
        const { rows } = await sql`
            SELECT default_margin_percentage, default_minimum_margin 
            FROM site_config 
            WHERE id = 1
        `;

        console.log('📊 Current values:', rows[0]);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

addGlobalMargins();