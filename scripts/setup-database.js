// scripts/setup-database.js
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    console.log('🚀 Setting up database...');
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✓ Found' : '✗ Not found');

    if (!process.env.POSTGRES_URL) {
        console.error('❌ POSTGRES_URL not found in .env.local');
        console.log('\nPlease add this to your .env.local:');
        console.log('POSTGRES_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require');
        process.exit(1);
    }

    try {
        // Create config table
        await sql`
            CREATE TABLE IF NOT EXISTS site_config (
                id INTEGER PRIMARY KEY DEFAULT 1,
                shipping_cost INTEGER NOT NULL DEFAULT 3500,
                shipping_to_pristina INTEGER NOT NULL DEFAULT 350,
                contact_email VARCHAR(255) NOT NULL DEFAULT 'blerart@outlook.com',
                contact_phone VARCHAR(50) NOT NULL DEFAULT '+383 49 195 414',
                site_name VARCHAR(100) NOT NULL DEFAULT 'Vetura Korea Kosova',
                currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
                vehicle_types JSONB NOT NULL DEFAULT '{
                    "suv": {"shippingCost": 4500, "enabled": false},
                    "sedan": {"shippingCost": 3500, "enabled": true},
                    "hatchback": {"shippingCost": 3500, "enabled": true},
                    "wagon": {"shippingCost": 3500, "enabled": true},
                    "coupe": {"shippingCost": 3500, "enabled": true},
                    "van": {"shippingCost": 3800, "enabled": true},
                    "pickup": {"shippingCost": 4000, "enabled": true},
                    "default": {"shippingCost": 3500, "enabled": true}
                }',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Config table created');

        // Create admin table
        await sql`
            CREATE TABLE IF NOT EXISTS admin (
                id INTEGER PRIMARY KEY DEFAULT 1,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Admin table created');

        // Insert default config
        await sql`
            INSERT INTO site_config (id) VALUES (1) 
            ON CONFLICT (id) DO NOTHING
        `;
        console.log('✅ Default config inserted');

        // Hash and insert admin password
        const password = '@Blerart_2026';
        const hash = await bcrypt.hash(password, 10);

        await sql`
            INSERT INTO admin (id, password_hash) 
            VALUES (1, ${hash})
            ON CONFLICT (id) DO UPDATE 
            SET password_hash = EXCLUDED.password_hash
        `;
        console.log('✅ Admin user created');

        console.log('🎉 Database setup complete!');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
}

setupDatabase();