// scripts/setup-database.js - FIXED VERSION
require('dotenv').config({ path: '.env' });
const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    console.log('🚀 Setting up database...');

    if (!process.env.POSTGRES_URL) {
        console.error('❌ POSTGRES_URL not found in .env.local');
        process.exit(1);
    }

    try {
        // 1. Create admin table
        await sql`
            CREATE TABLE IF NOT EXISTS admin (
                id INTEGER PRIMARY KEY DEFAULT 1,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Admin table created');

        // 2. Create site_config table
        await sql`
            CREATE TABLE IF NOT EXISTS site_config (
                id INTEGER PRIMARY KEY DEFAULT 1,
                shipping_cost INTEGER NOT NULL DEFAULT 3500,
                shipping_to_pristina INTEGER NOT NULL DEFAULT 350,
                default_margin_percentage INTEGER NOT NULL DEFAULT 15,
                default_minimum_margin INTEGER NOT NULL DEFAULT 1000,
                contact_email VARCHAR(255) NOT NULL DEFAULT 'blerart@outlook.com',
                contact_phone VARCHAR(50) NOT NULL DEFAULT '+383 49 195 414',
                site_name VARCHAR(100) NOT NULL DEFAULT 'Vetura Korea Kosova',
                currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
                vehicle_types JSONB NOT NULL DEFAULT '{
                    "suv": {"shippingCost": 4500, "marginPercentage": 18, "minimumMargin": 1500, "enabled": true},
                    "sedan": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true},
                    "hatchback": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true},
                    "wagon": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true},
                    "coupe": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true},
                    "van": {"shippingCost": 3800, "marginPercentage": 12, "minimumMargin": 800, "enabled": true},
                    "pickup": {"shippingCost": 4000, "marginPercentage": 12, "minimumMargin": 800, "enabled": true},
                    "sport_car": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1500, "enabled": true},
                    "default": {"shippingCost": 3500, "marginPercentage": 15, "minimumMargin": 1000, "enabled": true}
                }',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT single_row CHECK (id = 1)
            )
        `;
        console.log('✅ Site config table created');

        // 3. Create admin_sessions table
        await sql`
            CREATE TABLE IF NOT EXISTS admin_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES admin(id),
                token VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        `;
        console.log('✅ Admin sessions table created');

        // 4. Create exchange_rates table
        await sql`
            CREATE TABLE IF NOT EXISTS exchange_rates (
                id INTEGER PRIMARY KEY DEFAULT 1,
                rates JSONB NOT NULL DEFAULT '[
                    {"from": "KRW", "to": "EUR", "rate": 0.00068, "lastUpdated": "2024-01-01T00:00:00.000Z"},
                    {"from": "USD", "to": "EUR", "rate": 0.93, "lastUpdated": "2024-01-01T00:00:00.000Z"},
                    {"from": "JPY", "to": "EUR", "rate": 0.0059, "lastUpdated": "2024-01-01T00:00:00.000Z"}
                ]',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT single_row CHECK (id = 1)
            )
        `;
        console.log('✅ Exchange rates table created');

        // 5. Create indexes for admin_sessions
        await sql`
            CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token)
        `;
        console.log('✅ Index on token created');

        await sql`
            CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at)
        `;
        console.log('✅ Index on expires_at created');

        // 6. Insert default config if not exists
        await sql`
            INSERT INTO site_config (id) 
            VALUES (1) 
            ON CONFLICT (id) DO NOTHING
        `;
        console.log('✅ Default config inserted');

        // 7. Insert default exchange rates if not exists
        await sql`
            INSERT INTO exchange_rates (id) 
            VALUES (1) 
            ON CONFLICT (id) DO NOTHING
        `;
        console.log('✅ Default exchange rates inserted');

        // 8. Insert or update admin user
        const password = '@Blerart_2026';
        const hash = await bcrypt.hash(password, 10);

        await sql`
            INSERT INTO admin (id, password_hash) 
            VALUES (1, ${hash})
            ON CONFLICT (id) DO UPDATE 
            SET password_hash = EXCLUDED.password_hash,
                updated_at = CURRENT_TIMESTAMP
        `;
        console.log('✅ Admin user created/updated');

        // 9. Verify all tables exist
        console.log('\n📊 Verifying database setup...');

        const { rows: adminCheck } = await sql`SELECT * FROM admin WHERE id = 1`;
        console.log(`✅ Admin user exists: ${adminCheck.length > 0 ? 'Yes' : 'No'}`);

        const { rows: configCheck } = await sql`SELECT * FROM site_config WHERE id = 1`;
        console.log(`✅ Site config exists: ${configCheck.length > 0 ? 'Yes' : 'No'}`);

        const { rows: ratesCheck } = await sql`SELECT * FROM exchange_rates WHERE id = 1`;
        console.log(`✅ Exchange rates exist: ${ratesCheck.length > 0 ? 'Yes' : 'No'}`);

        console.log('\n🎉 Database setup complete!');
        console.log('\n📝 Admin credentials:');
        console.log('   Password: @Blerart_2026');

    } catch (error) {
        console.error('❌ Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();