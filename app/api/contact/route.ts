import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, message, carName } = body;

        // Validate
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Emri, email dhe mesazhi janë të detyrueshëm' },
                { status: 400 }
            );
        }

        console.log('📧 Sending contact email via Namecheap SMTP...');

        const result = await sendContactEmail({
            name,
            email,
            phone,
            message,
            carName
        });

        if (!result.success) {
            console.error('❌ Email error:', result.error);
            return NextResponse.json(
                { error: result.error || 'Dërgimi i email-it dështoi' },
                { status: 500 }
            );
        }

        console.log('✅ Emails sent successfully');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('❌ Server error:', error);
        return NextResponse.json(
            { error: 'Gabim i brendshëm i serverit' },
            { status: 500 }
        );
    }
}