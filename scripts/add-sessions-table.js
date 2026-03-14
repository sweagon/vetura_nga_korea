// scripts/add-sessions-table.js
require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function addSessionsTable() {
    console.log('🚀 Adding sessions table to database...');
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✓ Found' : '✗ Not found');

    if (!process.env.POSTGRES_URL) {
        console.error('❌ POSTGRES_URL not found in .env.local');
        process.exit(1);
    }

    try {
        // Create admin_sessions table
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

        // Create index for faster lookups
        await sql`
            CREATE INDEX IF NOT EXISTS idx_admin_sessions_token 
            ON admin_sessions(token)
        `;
        console.log('✅ Index on token created');

        await sql`
            CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires 
            ON admin_sessions(expires_at)
        `;
        console.log('✅ Index on expires_at created');

        console.log('🎉 Sessions table setup complete!');
        console.log('Now multiple admins can log in simultaneously.');

    } catch (error) {
        console.error('❌ Error setting up sessions table:', error);
    }
}

addSessionsTable();