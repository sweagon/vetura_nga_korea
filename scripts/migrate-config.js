// scripts/migrate-config.js
// Adds missing columns/tables to the Neon DB and resets the admin password.
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
    console.error('❌ ADMIN_PASSWORD not set in .env.local');
    process.exit(1);
}

async function migrate() {
    console.log('🚀 Running config migration...');

    if (!process.env.POSTGRES_URL) {
        console.error('❌ POSTGRES_URL not found in .env.local');
        process.exit(1);
    }

    try {
        // 1. Add margin columns to site_config if missing
        await sql`
            ALTER TABLE site_config
            ADD COLUMN IF NOT EXISTS default_margin_percentage INTEGER NOT NULL DEFAULT 15,
            ADD COLUMN IF NOT EXISTS default_minimum_margin INTEGER NOT NULL DEFAULT 1000
        `;
        console.log('✅ default_margin_percentage / default_minimum_margin columns ensured');

        // 2. Backfill any null margin values
        await sql`
            UPDATE site_config
            SET default_margin_percentage = COALESCE(default_margin_percentage, 15),
                default_minimum_margin = COALESCE(default_minimum_margin, 1000)
            WHERE id = 1
        `;
        console.log('✅ Margin values backfilled');

        // 3. Create admin_sessions table + indexes
        await sql`
            CREATE TABLE IF NOT EXISTS admin_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES admin(id),
                token VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at)`;
        console.log('✅ admin_sessions table + indexes ensured');

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
        await sql`INSERT INTO exchange_rates (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;
        console.log('✅ exchange_rates table ensured');

        // 5. Create admin_login_attempts table (server-side brute-force protection)
        await sql`
            CREATE TABLE IF NOT EXISTS admin_login_attempts (
                attempt_key VARCHAR(255) PRIMARY KEY,
                failed_count INTEGER NOT NULL DEFAULT 0,
                first_failed_at TIMESTAMP,
                last_failed_at TIMESTAMP,
                locked_until TIMESTAMP
            )
        `;
        console.log('✅ admin_login_attempts table ensured');

        // 6. Reset admin password
        const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await sql`
            INSERT INTO admin (id, password_hash)
            VALUES (1, ${hash})
            ON CONFLICT (id) DO UPDATE
            SET password_hash = EXCLUDED.password_hash, updated_at = CURRENT_TIMESTAMP
        `;
        console.log(`✅ Admin password reset`);

        console.log('🎉 Migration complete!');

    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

migrate();
