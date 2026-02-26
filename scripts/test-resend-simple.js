// scripts/test-resend-simple.js
const { Resend } = require('resend');

const resend = new Resend('re_DQ2zsN58_BMuuRXtBRqbkxvRzWZtnzQRs');

async function test() {
    console.log('🔍 Testing Resend...');

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: ['agonkadriu18@gmail.com'], // Send to yourself
            subject: 'Test from Formula Export',
            html: '<p><strong>Test email</strong> from Formula Export</p>'
        });

        if (error) {
            console.error('❌ Error:', error);
        } else {
            console.log('✅ Success:', data);
        }
    } catch (error) {
        console.error('❌ Exception:', error);
    }
}

test();