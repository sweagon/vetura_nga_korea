// lib/db.ts
import { sql } from '@vercel/postgres';
import { SiteConfig, defaultConfig } from './config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ============ CONFIG FUNCTIONS ============

export interface DbConfig {
    shipping_cost: number;
    shipping_to_pristina: number;
    default_margin_percentage: number;
    default_minimum_margin: number;
    contact_email: string;
    contact_phone: string;
    site_name: string;
    currency: string;
    vehicle_types: any;
}

function dbToSiteConfig(db: DbConfig): SiteConfig {
    return {
        shippingCost: db.shipping_cost,
        shippingToPristina: db.shipping_to_pristina,
        defaultMarginPercentage: db.default_margin_percentage,  // Add this
        defaultMinimumMargin: db.default_minimum_margin,        // Add this
        contactEmail: db.contact_email,
        contactPhone: db.contact_phone,
        siteName: db.site_name,
        currency: db.currency as 'EUR' | 'USD' | 'ALL',
        vehicleTypes: db.vehicle_types
    };
}

// Get config from database
export async function getConfigFromDb(): Promise<SiteConfig> {
    try {
        const { rows } = await sql<DbConfig>`
            SELECT * FROM site_config WHERE id = 1 LIMIT 1
        `;

        if (rows.length === 0) {
            // Insert default config
            await sql`
                INSERT INTO site_config (
                    shipping_cost, shipping_to_pristina, 
                    default_margin_percentage, default_minimum_margin,
                    contact_email, contact_phone, site_name, currency, vehicle_types
                ) VALUES (
                    ${defaultConfig.shippingCost},
                    ${defaultConfig.shippingToPristina},
                    ${defaultConfig.defaultMarginPercentage},
                    ${defaultConfig.defaultMinimumMargin},
                    ${defaultConfig.contactEmail},
                    ${defaultConfig.contactPhone},
                    ${defaultConfig.siteName},
                    ${defaultConfig.currency},
                    ${JSON.stringify(defaultConfig.vehicleTypes)}::jsonb
                )
            `;
            return defaultConfig;
        }

        return dbToSiteConfig(rows[0]);
    } catch (error) {
        console.error('Error getting config from DB:', error);
        return defaultConfig;
    }
}

// Save config to database
export async function saveConfigToDb(config: SiteConfig): Promise<void> {
    try {
        await sql`
            UPDATE site_config SET
                shipping_cost = ${config.shippingCost},
                shipping_to_pristina = ${config.shippingToPristina},
                default_margin_percentage = ${config.defaultMarginPercentage},
                default_minimum_margin = ${config.defaultMinimumMargin},
                contact_email = ${config.contactEmail},
                contact_phone = ${config.contactPhone},
                site_name = ${config.siteName},
                currency = ${config.currency},
                vehicle_types = ${JSON.stringify(config.vehicleTypes)}::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `;
        console.log('✅ Config saved to database');
    } catch (error) {
        console.error('Error saving config to DB:', error);
        throw error;
    }
}

// ============ ADMIN FUNCTIONS ============

export async function validateAdmin(password: string): Promise<boolean> {
    try {
        const { rows } = await sql<{ password_hash: string }>`
            SELECT password_hash FROM admin WHERE id = 1
        `;

        if (rows.length === 0) return false;

        return bcrypt.compare(password, rows[0].password_hash);
    } catch (error) {
        console.error('Admin validation error:', error);
        return false;
    }
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, 10);
    await sql`
        UPDATE admin SET password_hash = ${hash}, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
    `;
}

// ============ SESSION FUNCTIONS ============

export interface AdminSession {
    token: string;
    user_id: number;
    expires_at: Date;
}

// Create session for admin
export async function createAdminSession(userId: number = 1): Promise<string> {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration to 2 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    // Store session in database
    await sql`
        INSERT INTO admin_sessions (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    `;

    console.log(`✅ Session created for user ${userId}, expires at ${expiresAt.toISOString()}`);
    return token;
}

// Validate session token
export async function validateSessionToken(token: string): Promise<boolean> {
    try {
        const { rows } = await sql`
            SELECT id FROM admin_sessions 
            WHERE token = ${token} 
            AND expires_at > NOW()
        `;

        const isValid = rows.length > 0;
        console.log(`🔑 Session validation: ${isValid ? '✅ valid' : '❌ invalid'}`);
        return isValid;
    } catch (error) {
        console.error('Session validation error:', error);
        return false;
    }
}

// Get all active sessions (for debugging)
export async function getActiveSessions(): Promise<any[]> {
    try {
        const { rows } = await sql`
            SELECT id, user_id, token, created_at, expires_at 
            FROM admin_sessions 
            WHERE expires_at > NOW()
            ORDER BY created_at DESC
        `;
        return rows;
    } catch (error) {
        console.error('Error getting active sessions:', error);
        return [];
    }
}

// Delete session (logout)
export async function deleteSession(token: string): Promise<void> {
    await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
    console.log(`✅ Session deleted: ${token.substring(0, 8)}...`);
}

// Delete all sessions for a user (logout from all devices)
export async function deleteAllUserSessions(userId: number = 1): Promise<void> {
    await sql`DELETE FROM admin_sessions WHERE user_id = ${userId}`;
    console.log(`✅ All sessions deleted for user ${userId}`);
}

// Clean up expired sessions (call this periodically)
export async function cleanupExpiredSessions(): Promise<void> {
    const { rowCount } = await sql`DELETE FROM admin_sessions WHERE expires_at < NOW()`;
    console.log(`🧹 Cleaned up ${rowCount} expired sessions`);
}