// lib/email-templates.ts

export const getWelcomeEmail = (name: string) => ({
    subject: 'Mirësevini në Formula Export!',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF2800;">Mirësevini, ${name}!</h1>
            <p>Faleminderit që u regjistruat në Formula Export.</p>
            <p>Tani mund të:</p>
            <ul>
                <li>Ruani makinat që ju pëlqejnë</li>
                <li>Krahasoni makina të ndryshme</li>
                <li>Merrni njoftime për oferta të reja</li>
            </ul>
            <p>Filloni të eksploroni makinat tona!</p>
            <a href="https://formula-export.com/cars" style="display: inline-block; background-color: #FF2800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                Shiko makinat
            </a>
        </div>
    `
});

export const getPasswordResetEmail = (resetLink: string) => ({
    subject: 'Rivendosja e fjalëkalimit',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF2800;">Rivendos fjalëkalimin</h1>
            <p>Keni kërkuar të rivendosni fjalëkalimin tuaj.</p>
            <p>Klikoni linkun më poshtë për të vazhduar:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #FF2800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Rivendos fjalëkalimin
            </a>
            <p>Ky link skadon për 1 orë.</p>
            <p>Nëse nuk e keni kërkuar ju, injoroni këtë email.</p>
        </div>
    `
});

export const getInquiryConfirmationEmail = (name: string, carName: string) => ({
    subject: 'Pyetja juaj u dërgua',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF2800;">Faleminderit për pyetjen, ${name}!</h1>
            <p>Pyetja juaj për <strong>${carName}</strong> u dërgua me sukses.</p>
            <p>Shitësi do të kontaktojë me ju së shpejti.</p>
            <a href="https://formula-export.com/cars" style="display: inline-block; background-color: #FF2800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                Vazhdo eksplorimin
            </a>
        </div>
    `
});

export const getNewsletterWelcomeEmail = (email: string) => ({
    subject: 'Mirësevini në Newsletter!',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF2800;">Faleminderit që u abonuat!</h1>
            <p>Email-i juaj <strong>${email}</strong> u regjistrua me sukses në newsletter-in tonë.</p>
            <p>Tani do të merrni:</p>
            <ul>
                <li>Makina të reja</li>
                <li>Oferta speciale</li>
                <li>Lajme nga bota e automjeteve</li>
            </ul>
        </div>
    `
});

export const getContactConfirmationEmail = (name: string) => ({
    subject: 'Mesazhi juaj u dërgua',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF2800;">Faleminderit, ${name}!</h1>
            <p>Mesazhi juaj u dërgua me sukses.</p>
            <p>Ekipi ynë do të përgjigjet sa më shpejt të jetë e mundur.</p>
        </div>
    `
});