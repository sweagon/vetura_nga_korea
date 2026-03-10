// lib/filterCache.ts
import { type Car } from './api';

interface CachedPage {
    cars: Car[];
    page: number;
    timestamp: number;
}

interface CachedResult {
    pages: Map<number, CachedPage>;
    totalCount: number;
    filters: string;
    lastAccess: number;
    isLoading: boolean;
    error: string | null;
}

class FilterCache {
    private static instance: FilterCache;
    private cache: Map<string, CachedResult> = new Map();
    private readonly MAX_CACHE_SIZE = 30;
    private readonly PAGE_TTL = 5 * 60 * 1000; // 5 minutes

    static getInstance() {
        if (!FilterCache.instance) {
            FilterCache.instance = new FilterCache();
        }
        return FilterCache.instance;
    }

    generateKey(filters: Record<string, any>): string {
        const { page, ...filterWithoutPage } = filters;

        const filtered = Object.entries(filterWithoutPage)
            .filter(([_, value]) => value && value !== '' && value !== undefined)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}:${value}`)
            .join('|');

        return filtered || 'all';
    }

    getPage(filters: Record<string, any>, page: number): { cars: Car[]; totalCount: number } | null {
        const key = this.generateKey(filters);
        const cached = this.cache.get(key);

        if (!cached) {
            console.log('❌ Cache miss for key:', key);
            return null;
        }

        const cachedPage = cached.pages.get(page);
        if (!cachedPage) {
            console.log('❌ Cache miss for page:', page);
            return null;
        }

        // Check if page is expired
        if (Date.now() - cachedPage.timestamp > this.PAGE_TTL) {
            console.log('⏰ Cache expired for page:', page);
            cached.pages.delete(page);
            if (cached.pages.size === 0) {
                this.cache.delete(key);
            }
            return null;
        }

        cached.lastAccess = Date.now();
        console.log('✅ Cache hit:', { key, page, totalCount: cached.totalCount });
        return {
            cars: cachedPage.cars,
            totalCount: cached.totalCount
        };
    }

    setPage(filters: Record<string, any>, page: number, cars: Car[], totalCount: number) {
        const key = this.generateKey(filters);

        let cached = this.cache.get(key);

        if (!cached) {
            // If cache is full, remove least recently used
            if (this.cache.size >= this.MAX_CACHE_SIZE) {
                this.removeLRU();
            }

            cached = {
                pages: new Map(),
                totalCount,
                filters: key,
                lastAccess: Date.now(),
                isLoading: false,
                error: null
            };
            this.cache.set(key, cached);
            console.log('🆕 New cache entry:', { key, totalCount });
        } else {
            // Update totalCount if this is page 1 (most accurate)
            if (page === 1) {
                cached.totalCount = totalCount;
                console.log('🔄 Updated totalCount:', { key, totalCount });
            }
        }

        cached.pages.set(page, {
            cars,
            page,
            timestamp: Date.now()
        });
        cached.lastAccess = Date.now();
        cached.isLoading = false;
        cached.error = null;
    }

    isLoading(filters: Record<string, any>): boolean {
        const key = this.generateKey(filters);
        return this.cache.get(key)?.isLoading || false;
    }

    setLoading(filters: Record<string, any>, isLoading: boolean) {
        const key = this.generateKey(filters);
        const cached = this.cache.get(key);
        if (cached) {
            cached.isLoading = isLoading;
            cached.lastAccess = Date.now();
        }
    }

    setError(filters: Record<string, any>, error: string) {
        const key = this.generateKey(filters);
        const cached = this.cache.get(key);
        if (cached) {
            cached.error = error;
            cached.isLoading = false;
        }
    }

    clear(filters: Record<string, any>) {
        const key = this.generateKey(filters);
        this.cache.delete(key);
        console.log('🗑️ Cleared cache for key:', key);
    }

    clearAll() {
        this.cache.clear();
        console.log('🗑️ Cleared all cache');
    }

    private removeLRU() {
        let oldest: { key: string; lastAccess: number } | null = null;

        for (const [key, value] of this.cache.entries()) {
            if (!oldest || value.lastAccess < oldest.lastAccess) {
                oldest = { key, lastAccess: value.lastAccess };
            }
        }

        if (oldest) {
            this.cache.delete(oldest.key);
            console.log('🗑️ Removed LRU cache:', oldest.key);
        }
    }
}

export const filterCache = FilterCache.getInstance();