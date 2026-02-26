// app/api/newsletter/unsubscribe/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email është i detyrueshëm' },
                { status: 400 }
            );
        }

        // FIXED: Added await
        const supabase = await createClient();
        const { error } = await supabase
            .from('newsletter')
            .update({ status: 'unsubscribed' })
            .eq('email', email);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'U çregjistruat me sukses nga newsletter.'
        });

    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Gabim gjatë çregjistrimit' },
            { status: 500 }
        );
    }
}