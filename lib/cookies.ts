// lib/cookies.ts

export type CookieConsent = 'all' | 'essential' | 'none' | null;

export const getCookieConsent = (): CookieConsent => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cookieConsent') as CookieConsent;
};

export const hasAnalyticsConsent = (): boolean => {
    const consent = getCookieConsent();
    return consent === 'all';
};

export const hasFunctionalConsent = (): boolean => {
    const consent = getCookieConsent();
    return consent === 'all' || consent === 'essential';
};

// Use this in your Matchmaker to only track if user has consented
export const canTrackUser = (): boolean => {
    const consent = getCookieConsent();
    return consent === 'all'; // Only track analytics if they accepted all
};