require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function migrate() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS navigation_cache (
                key VARCHAR(255) PRIMARY KEY,
                data JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('navigation_cache table ready');
    } catch (e) {
        console.error('Migration error:', e.message);
        process.exit(1);
    }
}

migrate();
