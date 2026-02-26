// lib/email-templates.ts

export const emailTemplates = {
    contact: (data: { name: string; email: string; phone?: string; message: string; carName?: string }) => ({
        subject: `Pyetje e re nga ${data.name} - Formula Export`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pyetje e re</title>
            </head>
            <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
                <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <!-- Header with Logo -->
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="width: 60px; height: 60px; background: #FF2800; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                            <span style="color: white; font-size: 30px; font-weight: bold;">F</span>
                        </div>
                        <h1 style="color: #FF2800; margin: 0; font-size: 24px;">Formula Export</h1>
                    </div>

                    <h2 style="color: #333; margin-top: 0;">Pyetje e re nga faqja</h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                        <tr>
                            <td style="padding: 12px 0; color: #666; width: 120px; border-bottom: 1px solid #eee;"><strong>Emri:</strong></td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${data.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                <a href="mailto:${data.email}" style="color: #FF2800; text-decoration: none;">${data.email}</a>
                            </td>
                        </tr>
                        ${data.phone ? `
                        <tr>
                            <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Telefoni:</strong></td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                <a href="tel:${data.phone}" style="color: #FF2800; text-decoration: none;">${data.phone}</a>
                            </td>
                        </tr>
                        ` : ''}
                        ${data.carName ? `
                        <tr>
                            <td style="padding: 12px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Makina:</strong></td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${data.carName}</td>
                        </tr>
                        ` : ''}
                    </table>

                    <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 0 0 8px 0; color: #666;"><strong>Mesazhi:</strong></p>
                        <p style="margin: 0; color: #333; white-space: pre-line;">${data.message}</p>
                    </div>

                    <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #eee; text-align: center;">
                        <a href="mailto:${data.email}" style="background: #FF2800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block; margin: 0 8px;">📧 Përgjigju</a>
                        ${data.phone ? `<a href="tel:${data.phone}" style="background: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block; margin: 0 8px;">📞 Telefono</a>` : ''}
                    </div>

                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
                        Ky email u dërgua nga faqja e Formula Export.<br>
                        © ${new Date().getFullYear()} Formula Export. Të gjitha të drejtat e rezervuara.
                    </p>
                </div>
            </body>
            </html>
        `
    }),

    welcome: (name: string, email: string) => ({
        subject: 'Mirë se vini në Formula Export!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mirë se vini!</title>
            </head>
            <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
                <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="width: 60px; height: 60px; background: #FF2800; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                            <span style="color: white; font-size: 30px; font-weight: bold;">F</span>
                        </div>
                        <h1 style="color: #FF2800; margin: 0;">Formula Export</h1>
                    </div>

                    <h2 style="color: #333; text-align: center;">Mirë se vini, ${name}!</h2>
                    
                    <p style="color: #666; text-align: center; margin: 24px 0;">
                        Faleminderit që u regjistruat në Formula Export - platforma më e madhe për import të makinave nga Korea në Kosovë.
                    </p>

                    <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; margin: 24px 0;">
                        <h3 style="color: #333; margin-top: 0;">Me llogarinë tuaj mund të:</h3>
                        <ul style="color: #666; padding-left: 20px;">
                            <li style="margin: 8px 0;">❤️ Ruani makinat që ju pëlqejnë</li>
                            <li style="margin: 8px 0;">🎯 Merrni rekomandime të personalizuara</li>
                            <li style="margin: 8px 0;">⚖️ Krahasoni makina të ndryshme</li>
                            <li style="margin: 8px 0;">🔔 Merrni njoftime për çmime</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 32px 0;">
                        <a href="https://formulaexport.com/cars" style="background: #FF2800; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
                            🔍 Shfleto makinat
                        </a>
                    </div>

                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
                        Email: ${email}<br>
                        © ${new Date().getFullYear()} Formula Export
                    </p>
                </div>
            </body>
            </html>
        `
    }),

    passwordReset: (name: string, resetLink: string) => ({
        subject: 'Ndrysho passwordin - Formula Export',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Ndrysho passwordin</title>
            </head>
            <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
                <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <div style="width: 60px; height: 60px; background: #FF2800; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                            <span style="color: white; font-size: 30px; font-weight: bold;">F</span>
                        </div>
                        <h1 style="color: #FF2800; margin: 0;">Formula Export</h1>
                    </div>

                    <h2 style="color: #333; text-align: center;">Ndrysho passwordin</h2>
                    
                    <p style="color: #666; text-align: center; margin: 24px 0;">
                        Përshëndetje ${name},<br>
                        Keni kërkuar të ndryshoni passwordin për llogarinë tuaj.
                    </p>

                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetLink}" style="background: #FF2800; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">
                            🔐 Ndrysho passwordin
                        </a>
                    </div>

                    <p style="color: #999; font-size: 14px; text-align: center; background: #f5f5f5; padding: 16px; border-radius: 8px;">
                        Ose kopjoni këtë link: <br>
                        <span style="color: #FF2800; word-break: break-all;">${resetLink}</span>
                    </p>

                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
                        Ky link skadon pas 1 ore.<br>
                        Nëse nuk keni kërkuar ndryshim të passwordit, ju lutemi injoroni këtë email.
                    </p>
                </div>
            </body>
            </html>
        `
    })
};