// hooks/types.ts
import { type Car } from '@/lib/api';

export interface BaseHookResult {
    cars: Car[];
    loading: boolean;
    loadingMore: boolean;
    currentPage: number;
    totalPages: number;
    totalMatches: number;
    error: string | null;
    goToPage: (page: number) => void;
}

export interface ServerHookResult extends BaseHookResult {
    // Server pagination has no progress info
}

export interface ClientHookResult extends BaseHookResult {
    searchProgress: number;
    currentSearchPage: number;
    totalSearchPages: number;
}

export type HookResult = ServerHookResult | ClientHookResult;