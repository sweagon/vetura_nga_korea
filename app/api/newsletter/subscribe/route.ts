import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email është i detyrueshëm' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email-i nuk është valid' },
                { status: 400 }
            );
        }

        // Save to Supabase
        const supabase = await createClient();
        const { error: dbError } = await supabase
            .from('newsletter')
            .insert([{
                email,
                name,
                subscribed_at: new Date().toISOString(),
                status: 'active'
            }]);

        if (dbError) {
            // Check for duplicate
            if (dbError.code === '23505') {
                return NextResponse.json(
                    { error: 'Ky email është tashmë i regjistruar' },
                    { status: 400 }
                );
            }
            throw dbError;
        }

        // Send welcome email using your new email service
        await sendEmail({
            to: email,
            subject: 'Mirë se vini në newsletter-in e Formula Export!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="width: 60px; height: 60px; background: #FF2800; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                            <span style="color: white; font-size: 30px; font-weight: bold;">F</span>
                        </div>
                        <h1 style="color: #FF2800; margin: 0;">Formula Export</h1>
                    </div>
                    
                    <h2 style="color: #333; text-align: center;">Mirë se vini në newsletter-in tonë!</h2>
                    
                    <p style="color: #666; text-align: center; margin: 24px 0;">
                        Faleminderit që u regjistruat, ${name || 'klient i dashur'}!
                    </p>
                    
                    <p style="color: #666;">
                        Tani do të informoheni për:
                    </p>
                    
                    <ul style="color: #666; padding-left: 20px;">
                        <li style="margin: 8px 0;">🚗 Ofertat më të reja nga Korea</li>
                        <li style="margin: 8px 0;">💰 Ulje të çmimeve dhe promocione</li>
                        <li style="margin: 8px 0;">📊 Trendet e tregut të makinave</li>
                        <li style="margin: 8px 0;">🎯 Këshilla për import</li>
                    </ul>
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
                        © ${new Date().getFullYear()} Formula Export. Të gjitha të drejtat e rezervuara.<br>
                        Për të çregjistruar, na kontaktoni në <a href="mailto:info@formula-export.com" style="color: #FF2800;">info@formula-export.com</a>.
                    </p>
                </body>
                </html>
            `
        });

        // Also notify admin about new subscriber
        await sendEmail({
            to: process.env.ADMIN_EMAIL!,
            subject: 'Abonent i ri në newsletter',
            html: `
                <h2>Abonent i ri në newsletter</h2>
                <p><strong>Email:</strong> ${email}</p>
                ${name ? `<p><strong>Emri:</strong> ${name}</p>` : ''}
                <p><strong>Data:</strong> ${new Date().toLocaleString('sq-AL')}</p>
            `
        });

        return NextResponse.json({
            success: true,
            message: 'U regjistruat me sukses në newsletter!'
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Gabim gjatë regjistrimit. Ju lutemi provoni përsëri.' },
            { status: 500 }
        );
    }
}