import { sql } from '@vercel/postgres';
import { SiteConfig, defaultConfig } from './config';
import bcrypt from 'bcryptjs';

// ============ CONFIG FUNCTIONS ============

export interface DbConfig {
    shipping_cost: number;
    shipping_to_pristina: number;
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
                    shipping_cost, shipping_to_pristina, contact_email, 
                    contact_phone, site_name, currency, vehicle_types
                ) VALUES (
                    ${defaultConfig.shippingCost},
                    ${defaultConfig.shippingToPristina},
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