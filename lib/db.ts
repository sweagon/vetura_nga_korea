import { sql } from '@vercel/postgres';
import { SiteConfig, defaultConfig } from './config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface DbConfig {
    shipping_cost: number;
    shipping_to_pristina: number;
    default_margin_percentage: number;
    default_minimum_margin: number;
    krw_to_eur_rate: number;
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
        defaultMarginPercentage: db.default_margin_percentage,
        defaultMinimumMargin: db.default_minimum_margin,
        krwToEurRate: typeof db.krw_to_eur_rate === 'number' && db.krw_to_eur_rate > 0
            ? db.krw_to_eur_rate
            : defaultConfig.krwToEurRate,
        contactEmail: db.contact_email,
        contactPhone: db.contact_phone,
        siteName: db.site_name,
        currency: db.currency as 'EUR' | 'USD' | 'ALL',
        vehicleTypes: db.vehicle_types
    };
}

export async function getConfigFromDb(): Promise<SiteConfig> {
    try {
        await sql`ALTER TABLE site_config ADD COLUMN IF NOT EXISTS krw_to_eur_rate numeric NOT NULL DEFAULT 0.000628`;

        const { rows } = await sql<DbConfig>`
            SELECT * FROM site_config WHERE id = 1 LIMIT 1
        `;

        if (rows.length === 0) {
            await sql`
                INSERT INTO site_config (
                    shipping_cost, shipping_to_pristina,
                    default_margin_percentage, default_minimum_margin, krw_to_eur_rate,
                    contact_email, contact_phone, site_name, currency, vehicle_types
                ) VALUES (
                    ${defaultConfig.shippingCost},
                    ${defaultConfig.shippingToPristina},
                    ${defaultConfig.defaultMarginPercentage},
                    ${defaultConfig.defaultMinimumMargin},
                    ${defaultConfig.krwToEurRate},
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

export async function saveConfigToDb(config: SiteConfig): Promise<void> {
    try {
        await sql`
            UPDATE site_config SET
                shipping_cost = ${config.shippingCost},
                shipping_to_pristina = ${config.shippingToPristina},
                default_margin_percentage = ${config.defaultMarginPercentage},
                default_minimum_margin = ${config.defaultMinimumMargin},
                krw_to_eur_rate = ${config.krwToEurRate ?? defaultConfig.krwToEurRate},
                contact_email = ${config.contactEmail},
                contact_phone = ${config.contactPhone},
                site_name = ${config.siteName},
                currency = ${config.currency},
                vehicle_types = ${JSON.stringify(config.vehicleTypes)}::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `;
    } catch (error) {
        console.error('Error saving config to DB:', error);
        throw error;
    }
}

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

export interface ChangePasswordResult {
    ok: boolean;
    error?: string;
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResult> {
    const { rows } = await sql<{ password_hash: string }>`
        SELECT password_hash FROM admin WHERE id = 1
    `;
    if (rows.length === 0) return { ok: false, error: 'not_found' };
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return { ok: false, error: 'invalid_current' };
    await updateAdminPassword(newPassword);
    await sql`DELETE FROM admin_sessions WHERE user_id = 1`;
    return { ok: true };
}

export interface LoginAttemptStatus {
    failedCount: number;
    locked: boolean;
    lockedUntil: Date | null;
    minutesLeft: number | null;
    remainingAttempts: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_BASE_MINUTES = 15;

async function readAttemptStatus(key: string): Promise<LoginAttemptStatus> {
    const { rows } = await sql<{
        failed_count: number;
        locked_until: Date | null;
        active_lock: boolean;
        minutes_left: number | null;
    }>`
        SELECT
            failed_count,
            locked_until,
            (locked_until IS NOT NULL AND locked_until > CURRENT_TIMESTAMP) AS active_lock,
            CEIL(EXTRACT(EPOCH FROM (locked_until - CURRENT_TIMESTAMP)) / 60)::int AS minutes_left
        FROM admin_login_attempts
        WHERE attempt_key = ${key}
    `;
    if (rows.length === 0) {
        return { failedCount: 0, locked: false, lockedUntil: null, minutesLeft: null, remainingAttempts: MAX_ATTEMPTS };
    }
    const row = rows[0];
    const activeLock = Boolean(row.active_lock);
    return {
        failedCount: row.failed_count,
        locked: activeLock,
        lockedUntil: activeLock ? row.locked_until : null,
        minutesLeft: activeLock ? (row.minutes_left ?? LOCKOUT_BASE_MINUTES) : null,
        remainingAttempts: activeLock ? 0 : Math.max(0, MAX_ATTEMPTS - row.failed_count),
    };
}

export async function getLoginAttemptStatus(key: string): Promise<LoginAttemptStatus> {
    try {
        return await readAttemptStatus(key);
    } catch (error) {
        console.error('Error reading login attempts:', error);
        return { failedCount: 0, locked: false, lockedUntil: null, minutesLeft: null, remainingAttempts: MAX_ATTEMPTS };
    }
}

export async function registerLoginFailure(key: string): Promise<LoginAttemptStatus> {
    try {
        await sql`
            INSERT INTO admin_login_attempts (attempt_key, failed_count, first_failed_at)
            VALUES (${key}, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (attempt_key) DO UPDATE
            SET failed_count = admin_login_attempts.failed_count + 1,
                last_failed_at = CURRENT_TIMESTAMP
        `;
        const { rows } = await sql`
            SELECT failed_count FROM admin_login_attempts WHERE attempt_key = ${key}
        `;
        const failedCount = rows[0]?.failed_count ?? 1;

        if (failedCount >= MAX_ATTEMPTS) {
            await sql`
                UPDATE admin_login_attempts
                SET locked_until = CURRENT_TIMESTAMP + make_interval(mins => ${LOCKOUT_BASE_MINUTES}),
                    failed_count = 0
                WHERE attempt_key = ${key}
            `;
        }
        return await readAttemptStatus(key);
    } catch (error) {
        console.error('Error registering login failure:', error);
        return { failedCount: 0, locked: false, lockedUntil: null, minutesLeft: null, remainingAttempts: MAX_ATTEMPTS };
    }
}

export async function clearLoginFailures(key: string): Promise<void> {
    try {
        await sql`DELETE FROM admin_login_attempts WHERE attempt_key = ${key}`;
    } catch (error) {
        console.error('Error clearing login failures:', error);
    }
}

export interface AdminSession {
    token: string;
    user_id: number;
    expires_at: Date;
}

export async function createAdminSession(userId: number = 1): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    await cleanupExpiredSessions();

    await sql`
        INSERT INTO admin_sessions (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    `;

    return token;
}

export async function validateSessionToken(token: string): Promise<boolean> {
    try {
        const { rows } = await sql`
            SELECT id FROM admin_sessions
            WHERE token = ${token}
            AND expires_at > NOW()
        `;
        return rows.length > 0;
    } catch (error) {
        console.error('Session validation error:', error);
        return false;
    }
}

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

export async function deleteSession(token: string): Promise<void> {
    await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
}

export async function deleteAllUserSessions(userId: number = 1): Promise<void> {
    await sql`DELETE FROM admin_sessions WHERE user_id = ${userId}`;
}

export async function cleanupExpiredSessions(): Promise<void> {
    try {
        await sql`DELETE FROM admin_sessions WHERE expires_at < NOW()`;
    } catch (error) {
        console.error('Error cleaning up sessions:', error);
    }
}

export interface ExchangeRate {
    from: string;
    to: string;
    rate: number;
    lastUpdated: string;
}

const DEFAULT_RATES: ExchangeRate[] = [
    { from: 'KRW', to: 'EUR', rate: 0.00068, lastUpdated: new Date().toISOString() },
    { from: 'USD', to: 'EUR', rate: 0.93, lastUpdated: new Date().toISOString() },
    { from: 'JPY', to: 'EUR', rate: 0.0059, lastUpdated: new Date().toISOString() }
];

export async function getExchangeRatesFromDb(): Promise<ExchangeRate[]> {
    try {
        const { rows } = await sql`
            SELECT rates FROM exchange_rates WHERE id = 1 LIMIT 1
        `;
        if (rows.length === 0) return DEFAULT_RATES;
        return rows[0].rates;
    } catch (error) {
        console.error('Error getting exchange rates from DB:', error);
        return DEFAULT_RATES;
    }
}

export async function saveExchangeRatesToDb(rates: ExchangeRate[]): Promise<void> {
    try {
        await sql`
            INSERT INTO exchange_rates (id, rates, updated_at)
            VALUES (1, ${JSON.stringify(rates)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE
            SET rates = EXCLUDED.rates, updated_at = NOW()
        `;
    } catch (error) {
        console.error('Error saving exchange rates to DB:', error);
        throw error;
    }
}

export async function updateKrwToEurRate(rate: number): Promise<void> {
    if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) return;
    try {
        await sql`ALTER TABLE site_config ADD COLUMN IF NOT EXISTS krw_to_eur_rate numeric NOT NULL DEFAULT 0.000628`;
        await sql`
            UPDATE site_config
            SET krw_to_eur_rate = ${rate}, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `;
    } catch (error) {
        console.error('Error updating krw_to_eur_rate:', error);
    }
}

export async function syncKrwRateFromRates(rates: ExchangeRate[]): Promise<void> {
    try {
        const krw = rates?.find((r) => r.from === 'KRW' && r.to === 'EUR');
        if (krw && typeof krw.rate === 'number' && isFinite(krw.rate) && krw.rate > 0) {
            await updateKrwToEurRate(krw.rate);
        }
    } catch (error) {
        console.error('Error syncing KRW rate:', error);
    }
}
