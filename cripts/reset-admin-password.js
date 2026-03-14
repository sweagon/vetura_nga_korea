const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    const password = '@Blerand_2026';
    const hash = await bcrypt.hash(password, 10);

    try {
        await sql`
            UPDATE admin SET password_hash = ${hash}, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `;
        console.log('✅ Admin password reset successfully');
    } catch (error) {
        console.error('❌ Failed to reset password:', error);
    }
}

resetPassword();