import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';

export async function GET() {
    try {
        console.log('🧪 Testing email configuration...');

        // Test with a simple email
        const result = await sendEmail({
            to: process.env.ADMIN_EMAIL!, // Your admin email
            subject: 'Test Email from Formula Export',
            html: `
                <h1>Test Email</h1>
                <p>This is a test email to verify SMTP is working.</p>
                <p>Time: ${new Date().toISOString()}</p>
            `
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Email sent successfully',
                data: result.data
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Test endpoint error:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}