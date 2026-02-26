// lib/newsletter.ts
import { createClient } from '@/lib/supabase/client';

export interface Subscriber {
    email: string;
    name?: string;
    subscribed_at: string;
    status: 'active' | 'unsubscribed';
}

export async function subscribeToNewsletter(email: string, name?: string) {
    const supabase = createClient();

    try {
        // Check if already subscribed
        const { data: existing } = await supabase
            .from('newsletter')
            .select('email')
            .eq('email', email)
            .single();

        if (existing) {
            return {
                success: false,
                error: 'Ky email është tashmë i regjistruar në newsletter.'
            };
        }

        // Add to newsletter table
        const { error } = await supabase
            .from('newsletter')
            .insert([{
                email,
                name,
                subscribed_at: new Date().toISOString(),
                status: 'active'
            }]);

        if (error) throw error;

        // Send welcome email
        await fetch('/api/newsletter/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name })
        });

        return { success: true };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return {
            success: false,
            error: 'Ndodhi një gabim. Ju lutemi provoni përsëri.'
        };
    }
}

export async function unsubscribeFromNewsletter(email: string) {
    const supabase = createClient();

    try {
        const { error } = await supabase
            .from('newsletter')
            .update({ status: 'unsubscribed' })
            .eq('email', email);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        return { success: false, error: 'Gabim gjatë çregjistrimit' };
    }
}