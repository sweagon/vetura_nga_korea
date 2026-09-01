import { sql } from '@vercel/postgres';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheRow {
    data: any;
    updated_at: Date;
}

export async function getNavigationCache<T>(key: string): Promise<T | null> {
    try {
        const { rows } = await sql<CacheRow>`
            SELECT data, updated_at FROM navigation_cache WHERE key = ${key} LIMIT 1
        `;
        if (rows.length === 0) return null;

        const updatedAt = new Date(rows[0].updated_at);
        if (Date.now() - updatedAt.getTime() > CACHE_TTL_MS) {
            return null;
        }

        return rows[0].data as T;
    } catch (error) {
        console.error('Error reading navigation cache:', error);
        return null;
    }
}

export async function setNavigationCache(key: string, data: any): Promise<void> {
    try {
        await sql`
            INSERT INTO navigation_cache (key, data, updated_at)
            VALUES (${key}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (key) DO UPDATE
            SET data = EXCLUDED.data, updated_at = NOW()
        `;
    } catch (error) {
        console.error('Error writing navigation cache:', error);
    }
}

export async function clearNavigationCache(): Promise<void> {
    try {
        await sql`DELETE FROM navigation_cache`;
    } catch (error) {
        console.error('Error clearing navigation cache:', error);
    }
}
