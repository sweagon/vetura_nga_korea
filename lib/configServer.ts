// lib/configServer.ts
import { getConfigFromDb, saveConfigToDb } from './db';
import { SiteConfig, defaultConfig, validateConfig } from './config';

export async function getConfig(): Promise<SiteConfig> {
    try {
        return await getConfigFromDb();
    } catch (error) {
        console.error('Error reading config from DB:', error);
        return defaultConfig;
    }
}

export async function saveConfig(config: SiteConfig): Promise<void> {
    try {
        const { valid, errors } = validateConfig(config);
        if (!valid) {
            throw new Error(`Invalid config: ${errors.join(', ')}`);
        }
        await saveConfigToDb(config);
    } catch (error) {
        console.error('Error saving config:', error);
        throw error;
    }
}

export { validateConfig } from './config';