import nodemailer from 'nodemailer';
import db from './db.js';

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    const smtp = db.prepare('SELECT * FROM smtp_settings WHERE id = 1').get() as any;

    if (!smtp || !smtp.enabled) {
        console.warn("SMTP is disabled or not configured.");
        return { success: false, message: "SMTP disabled" };
    }

    // Intelligent secure setting: 465 usually needs true, others false
    const isSSL = smtp.encryption === 'ssl' || smtp.port === 465;

    const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: isSSL,
        auth: {
            user: smtp.username,
            pass: smtp.password,
        },
        // For self-signed certs often found in smaller VPS
        tls: {
            rejectUnauthorized: false
        }
    });

    const fromAddress = smtp.from_email || (smtp.username.includes('@') ? smtp.username : 'noreply@nixxytoxic.com');

    try {
        console.log(`Sending email to ${to} using ${smtp.host}:${smtp.port}...`);
        const info = await transporter.sendMail({
            from: `"${smtp.from_name || 'Nixxy Toxic'}" <${fromAddress}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent successfully: ${info.messageId}`);
        return { success: true };
    } catch (error) {
        console.error("CRITICAL SMTP ERROR:", error);
        return { success: false, error };
    }
}

export function generateOrderEmail(order: any, siteLogoUrl: string) {
    const smtp = db.prepare('SELECT * FROM smtp_settings WHERE id = 1').get() as any;
    const items = JSON.parse(order.items);

    // Convert relative logo URL to absolute if possible, assuming the frontend URL
    const fullLogoUrl = siteLogoUrl ? (siteLogoUrl.startsWith('http') ? siteLogoUrl : `https://nixxytoxic.com${siteLogoUrl}`) : '';

    const itemsHtml = items.map((item: any) => `
        <div style="border-bottom: 2px solid #000; padding: 10px 0; display: flex; justify-content: space-between;">
            <span style="font-family: 'Courier New', Courier, monospace; font-weight: bold;">${item.quantity}x ${item.name.toUpperCase()}</span>
            <span style="font-family: 'Courier New', Courier, monospace; font-weight: bold; font-style: italic;">${(item.price * item.quantity).toFixed(2)}€</span>
        </div>
    `).join('');

    const customMessage = smtp.order_template || `Thanks for being toxic! Your order <strong>#${order.order_id}</strong> is being processed.`;
    const instructions = smtp.order_instructions || `This is a reservation system. You will receive another email with payment details soon.`;

    const emailStyle = `
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <style>
            :root { color-scheme: light; supported-color-schemes: light; }
            .email-body { background-color: #d9ff36 !important; }
            .content-box { background-color: #d9ff36 !important; border: 8px solid #000000 !important; }
            .white-box { background-color: #ffffff !important; color: #000000 !important; }
            p, h1, h2, h3, span { color: #000000 !important; }
            @media (prefers-color-scheme: dark) {
                .email-body { background-color: #d9ff36 !important; }
                .content-box { background-color: #d9ff36 !important; }
                .white-box { background-color: #ffffff !important; color: #000000 !important; }
            }
        </style>
    `;

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>${emailStyle}</head>
    <body style="margin: 0; padding: 0; background-color: #d9ff36;">
        <div class="email-body" style="background-color: #d9ff36; padding: 20px; text-align: center; color: #000000;">
            <div class="content-box" style="max-width: 600px; margin: 0 auto; background-color: #d9ff36; border: 8px solid #000000; padding: 30px; box-shadow: 15px 15px 0px #ff00ff;">
                <div style="margin-bottom: 30px;">
                    ${fullLogoUrl ? `<img src="${fullLogoUrl}" style="max-height: 100px; width: auto;" alt="NIXXY TOXIC" />` : `<h1 style="font-family: 'Arial Black', Gadget, sans-serif; font-size: 36px; letter-spacing: -2px; margin: 0; text-transform: uppercase;">NIXXY TOXIC</h1>`}
                </div>
                
                <h2 style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; font-size: 28px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px; font-style: italic; color: #000;">ORDER CONFIRMED</h2>
                
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: bold; text-align: left; color: #000;">HI ${order.customer_name.toUpperCase()},</p>
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 16px; text-align: left; line-height: 1.4; color: #000;">${customMessage}</p>
                
                <div class="white-box" style="background-color: #ffffff; border: 4px solid #000; padding: 20px; margin: 25px 0; text-align: left; box-shadow: 8px 8px 0px #000; color: #000;">
                    <h3 style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; margin-top: 0; color: #000;">CART ITEMS:</h3>
                    ${itemsHtml}
                    <div style="margin-top: 20px; text-align: right; font-family: 'Arial Black', Gadget, sans-serif; font-size: 24px; font-style: italic; color: #000;">
                        TOTAL: ${order.total.toFixed(2)}€
                    </div>
                </div>

                <div style="background-color: #000000; color: #d9ff36; padding: 15px; border: 4px solid #ffffff; text-align: left; margin-top: 25px;">
                    <p style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; margin-top: 0; font-size: 16px; color: #d9ff36;">INSTRUCTIONS:</p>
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; margin-bottom: 0; color: #d9ff36;">${instructions}</p>
                </div>
                
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 13px; margin-top: 30px; font-weight: bold; text-transform: uppercase; opacity: 0.6; color: #000;">Don't reply to this mail, Bitch! This is automated toxicity.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function generateTicketEmail(order: any, event: any, siteLogoUrl: string) {
    const smtp = db.prepare('SELECT * FROM smtp_settings WHERE id = 1').get() as any;
    const fullLogoUrl = siteLogoUrl ? (siteLogoUrl.startsWith('http') ? siteLogoUrl : `https://nixxytoxic.com${siteLogoUrl}`) : '';
    const customMessage = smtp.ticket_template || `You are ready for the show! Here is your ticket for <strong>${event.venue}</strong>.`;

    const emailStyle = `
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <style>
            :root { color-scheme: light; supported-color-schemes: light; }
            .email-body { background-color: #d9ff36 !important; }
            .content-box { background-color: #d9ff36 !important; border: 8px solid #000000 !important; }
            .white-box { background-color: #ffffff !important; color: #000000 !important; }
            p, h1, h2, h3, span { color: #000000 !important; }
            .neon-qr { background-color: #000000 !important; padding: 15px !important; }
            @media (prefers-color-scheme: dark) {
                .email-body { background-color: #d9ff36 !important; }
                .content-box { background-color: #d9ff36 !important; }
                .white-box { background-color: #ffffff !important; color: #000000 !important; }
            }
        </style>
    `;

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>${emailStyle}</head>
    <body style="margin: 0; padding: 0; background-color: #d9ff36;">
        <div class="email-body" style="background-color: #d9ff36; padding: 20px; text-align: center; color: #000000;">
            <div class="content-box" style="max-width: 600px; margin: 0 auto; background-color: #d9ff36; border: 8px solid #000000; padding: 30px; box-shadow: 15px 15px 0px #00ffff;">
                <div style="margin-bottom: 30px;">
                    ${fullLogoUrl ? `<img src="${fullLogoUrl}" style="max-height: 100px; width: auto;" alt="NIXXY TOXIC" />` : `<h1 style="font-family: 'Arial Black', Gadget, sans-serif; font-size: 36px; letter-spacing: -2px; margin: 0; text-transform: uppercase;">NIXXY TOXIC</h1>`}
                </div>
                
                <h2 style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; font-size: 28px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px; font-style: italic; color: #000;">LIVE TICKET</h2>
                
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: bold; text-align: left; color: #000;">HI ${order.customer_name.toUpperCase()},</p>
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 16px; text-align: left; line-height: 1.4; color: #000;">${customMessage}</p>
                
                <div class="white-box" style="background-color: #ffffff; border: 6px solid #000; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 12px 12px 0px #000; color: #000;">
                    <h3 style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; margin: 0; font-size: 28px; font-style: italic; color: #000;">${event.city.toUpperCase()}</h3>
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 20px; margin: 10px 0; font-weight: bold; color: #000;">${event.venue.toUpperCase()}</p>
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 18px; margin: 0; color: #000;">${event.date.toUpperCase()}</p>
                    
                    <div class="neon-qr" style="margin: 25px 0; background-color: #000000; padding: 15px; display: inline-block; border: 4px solid #d9ff36;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TICKET:${order.order_id}&color=d9ff36&bgcolor=000" style="display: block;" />
                    </div>
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; color: #000;">ORDER ID: #${order.order_id}</p>
                </div>
                
                <div style="background-color: #ff00ff; color: #ffffff; padding: 12px; border: 4px solid #000000; display: inline-block; transform: rotate(-2deg); margin-top: 15px;">
                    <p style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; margin: 0; font-size: 18px; color: #ffffff;">SHOW THIS AT THE ENTRANCE, BITCH!</p>
                </div>
                
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 13px; margin-top: 35px; font-weight: bold; text-transform: uppercase; opacity: 0.6; color: #000;">Don't reply to this mail. Nixxy is busy being toxic.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
