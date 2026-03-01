// lib/recentlyViewed.ts
// Simple localStorage-based recently viewed - NO JSX, just pure TypeScript

const STORAGE_KEY = 'recently-viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  id: string;
  title: string;
  image?: string;
  price?: number;
  viewedAt: number;
}

export function addToRecentlyViewed(item: Omit<RecentlyViewedItem, 'viewedAt'>): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];

  const items = getRecentlyViewed();
  const existingIndex = items.findIndex(i => i.id === item.id);

  if (existingIndex !== -1) {
    items.splice(existingIndex, 1);
  }

  const newItem = { ...item, viewedAt: Date.now() };
  items.unshift(newItem);

  if (items.length > MAX_ITEMS) {
    items.pop();
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}