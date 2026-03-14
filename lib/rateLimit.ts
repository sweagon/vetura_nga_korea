interface RateLimitConfig {
    interval: number;
    max: number;
}

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

// Simple in-memory store (for development)
// For production, you might want to use Redis or similar
const store: RateLimitStore = {};

// Clean up expired entries every minute
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        Object.keys(store).forEach(key => {
            if (now > store[key].resetTime) {
                delete store[key];
            }
        });
    }, 60 * 1000);
}

export function rateLimit(config: RateLimitConfig) {
    return {
        check: async (key: string): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> => {
            const now = Date.now();
            const record = store[key];

            // Clean up if expired
            if (record && now > record.resetTime) {
                delete store[key];
                return createNewRecord(key, config, now);
            }

            if (!record) {
                return createNewRecord(key, config, now);
            }

            if (record.count >= config.max) {
                return {
                    success: false,
                    limit: config.max,
                    remaining: 0,
                    resetTime: record.resetTime
                };
            }

            // Increment count
            record.count++;
            return {
                success: true,
                limit: config.max,
                remaining: config.max - record.count,
                resetTime: record.resetTime
            };
        }
    };
}

function createNewRecord(key: string, config: RateLimitConfig, now: number) {
    const resetTime = now + config.interval;
    store[key] = {
        count: 1,
        resetTime
    };
    return {
        success: true,
        limit: config.max,
        remaining: config.max - 1,
        resetTime
    };
}