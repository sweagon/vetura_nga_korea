// lib/email.ts
import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// For testing, always use Resend's test sender
const FROM_EMAIL = 'onboarding@resend.dev';
const ADMIN_EMAIL = 'ma.webagency@outlook.com';

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string | string[];
    subject: string;
    html: string;
}) {
    try {
        console.log('📧 Sending email...', { to, subject });

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            console.error('❌ Resend error:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Email sent:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Exception:', error);
        return { success: false, error: String(error) };
    }
}

export async function sendContactEmail(formData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    carName?: string;
}) {
    // Send to admin
    const adminResult = await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Pyetje e re nga ${formData.name} - Formula Export`,
        html: `
            <h2>Pyetje e re nga faqja</h2>
            <p><strong>Emri:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            ${formData.phone ? `<p><strong>Telefoni:</strong> ${formData.phone}</p>` : ''}
            ${formData.carName ? `<p><strong>Makina:</strong> ${formData.carName}</p>` : ''}
            <p><strong>Mesazhi:</strong></p>
            <p>${formData.message.replace(/\n/g, '<br>')}</p>
        `
    });

    if (!adminResult.success) {
        return adminResult;
    }

    // Send auto-reply to user
    await sendEmail({
        to: formData.email,
        subject: 'Ne morëm pyetjen tuaj - Formula Export',
        html: `
            <h2>Faleminderit për mesazhin, ${formData.name}!</h2>
            <p>Ne morëm pyetjen tuaj dhe do të përgjigjemi sa më shpejt (zakonisht brenda 24 orëve).</p>
            <p>Mesazhi juaj:</p>
            <p><em>${formData.message}</em></p>
            <hr>
            <p style="color: #666; font-size: 12px;">Formula Export - Import i makinave nga Korea në Kosovë</p>
        `
    });

    return { success: true };
}