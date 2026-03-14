// lib/configServer.ts - Server-only code (with Node.js modules)
import fs from 'fs/promises';
import path from 'path';
import { SiteConfig, defaultConfig } from './config';
// Note: We don't need to import validateConfig here anymore

// Path to config file
const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// Read config from file
export async function getConfig(): Promise<SiteConfig> {
    try {
        await ensureDataDir();

        // Try to read existing config
        try {
            const data = await fs.readFile(CONFIG_PATH, 'utf-8');
            const savedConfig = JSON.parse(data);

            // Merge with default to ensure all fields exist
            return {
                ...defaultConfig,
                ...savedConfig,
                vehicleTypes: {
                    ...defaultConfig.vehicleTypes,
                    ...(savedConfig.vehicleTypes || {})
                }
            };
        } catch (error) {
            // If file doesn't exist, create it with default config
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                await saveConfig(defaultConfig);
                return defaultConfig;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error reading config:', error);
        return defaultConfig; // Fallback to default on error
    }
}

// Save config to file
export async function saveConfig(config: SiteConfig): Promise<void> {
    try {
        await ensureDataDir();
        await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
        console.log('✅ Config saved to file at:', CONFIG_PATH);
    } catch (error) {
        console.error('Error saving config:', error);
        throw error;
    }
}