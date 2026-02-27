import nodemailer from 'nodemailer';

// Define a proper type for email results
export type EmailResult = {
    success: boolean;
    data?: nodemailer.SentMessageInfo;
    error?: string;
};

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export async function sendEmail({
    to,
    subject,
    html,
    from = process.env.SMTP_FROM
}: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
}): Promise<EmailResult> {
    try {
        console.log('📧 Sending email via SMTP...', { to, subject });

        const info = await transporter.sendMail({
            from: `"Formula Export" <${from}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            html,
        });

        console.log('✅ Email sent:', info.messageId);
        return { success: true, data: info };
    } catch (error) {
        console.error('❌ SMTP error:', error);
        return { success: false, error: String(error) };
    }
}

export async function sendContactEmail(formData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    carName?: string;
}): Promise<EmailResult> {
    try {
        // Send to admin
        const adminResult = await sendEmail({
            to: process.env.ADMIN_EMAIL!,
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
        const userResult = await sendEmail({
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

        return userResult;
    } catch (error) {
        console.error('❌ Error in sendContactEmail:', error);
        return { success: false, error: String(error) };
    }
}