import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

        console.log('📧 Sending email via Resend...');

        // Send email using Resend directly
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['ma.webagency@outlook.com'],
            subject: `Pyetje e re nga ${name} - Formula Export`,
            html: `
                <h2>Pyetje e re nga faqja</h2>
                <p><strong>Emri:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Telefoni:</strong> ${phone}</p>` : ''}
                ${carName ? `<p><strong>Makina:</strong> ${carName}</p>` : ''}
                <p><strong>Mesazhi:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        });

        if (error) {
            console.error('❌ Resend error:', error);
            return NextResponse.json(
                { error: 'Dërgimi i email-it dështoi: ' + error.message },
                { status: 500 }
            );
        }

        console.log('✅ Email sent:', data);
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('❌ Server error:', error);
        return NextResponse.json(
            { error: 'Gabim i brendshëm i serverit' },
            { status: 500 }
        );
    }
}