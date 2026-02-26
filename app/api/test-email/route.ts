import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getWelcomeEmail } from '@/lib/email-templates';

export async function GET() {
    try {
        // Send a test email
        const emailData = getWelcomeEmail('Test User');
        const result = await sendEmail({
            to: 'your-email@example.com', // Replace with your email
            subject: emailData.subject,
            html: emailData.html,
        });

        if (result.success) {
            return NextResponse.json({ message: 'Test email sent successfully' });
        } else {
            throw new Error('Failed to send test email');
        }
    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json(
            { error: 'Failed to send test email' },
            { status: 500 }
        );
    }
}