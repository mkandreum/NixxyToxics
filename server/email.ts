import nodemailer from 'nodemailer';
import db from './db';

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    const smtp = db.prepare('SELECT * FROM smtp_settings WHERE id = 1').get() as any;

    if (!smtp || !smtp.enabled) {
        console.warn("SMTP is disabled or not configured.");
        return { success: false, message: "SMTP disabled" };
    }

    const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.encryption === 'ssl',
        auth: {
            user: smtp.username,
            pass: smtp.password,
        },
    });

    try {
        await transporter.sendMail({
            from: `"${smtp.from_name || 'Nixxy Toxic'}" <${smtp.from_email || smtp.username}>`,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error("Email send error:", error);
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

    return `
    <div style="background-color: #d9ff36; padding: 40px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #d9ff36; border: 8px solid #000; padding: 40px; box-shadow: 20px 20px 0px #ff00ff;">
            <div style="margin-bottom: 40px;">
                ${fullLogoUrl ? `<img src="${fullLogoUrl}" style="max-height: 120px; width: auto;" alt="NIXXY TOXIC" />` : `<h1 style="font-family: 'Arial Black', Gadget, sans-serif; font-size: 40px; letter-spacing: -2px; margin: 0; text-transform: uppercase;">NIXXY TOXIC</h1>`}
            </div>
            
            <h2 style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; font-size: 32px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px; font-style: italic;">ORDER CONFIRMED</h2>
            
            <p style="font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: bold; text-align: left;">HI ${order.customer_name.toUpperCase()},</p>
            <p style="font-family: 'Courier New', Courier, monospace; font-size: 18px; text-align: left; line-height: 1.4;">${customMessage}</p>
            
            <div style="background-color: #fff; border: 4px solid #000; padding: 25px; margin: 30px 0; text-align: left; box-shadow: 10px 10px 0px #000;">
                <h3 style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; margin-top: 0;">CART ITEMS:</h3>
                ${itemsHtml}
                <div style="margin-top: 25px; text-align: right; font-family: 'Arial Black', Gadget, sans-serif; font-size: 28px; font-style: italic;">
                    TOTAL: ${order.total.toFixed(2)}€
                </div>
            </div>

            <div style="background-color: #000; color: #d9ff36; padding: 20px; border: 4px solid #fff; text-align: left; margin-top: 30px;">
                <p style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; margin-top: 0; font-size: 18px;">INSTRUCTIONS:</p>
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 16px; margin-bottom: 0;">${instructions}</p>
            </div>
            
            <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; margin-top: 40px; font-weight: bold; text-transform: uppercase; opacity: 0.6;">Don't reply to this mail, Bitch! This is automated toxicity.</p>
        </div>
    </div>
    `;
}

export function generateTicketEmail(order: any, event: any, siteLogoUrl: string) {
    const smtp = db.prepare('SELECT * FROM smtp_settings WHERE id = 1').get() as any;
    const fullLogoUrl = siteLogoUrl ? (siteLogoUrl.startsWith('http') ? siteLogoUrl : `https://nixxytoxic.com${siteLogoUrl}`) : '';
    const customMessage = smtp.ticket_template || `You are ready for the show! Here is your ticket for <strong>${event.venue}</strong>.`;

    return `
    <div style="background-color: #d9ff36; padding: 40px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #d9ff36; border: 8px solid #000; padding: 40px; box-shadow: 20px 20px 0px #00ffff;">
            <div style="margin-bottom: 40px;">
                ${fullLogoUrl ? `<img src="${fullLogoUrl}" style="max-height: 120px; width: auto;" alt="NIXXY TOXIC" />` : `<h1 style="font-family: 'Arial Black', Gadget, sans-serif; font-size: 40px; letter-spacing: -2px; margin: 0; text-transform: uppercase;">NIXXY TOXIC</h1>`}
            </div>
            
            <h2 style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; font-size: 32px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px; font-style: italic;">LIVE TICKET</h2>
            
            <p style="font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: bold; text-align: left;">HI ${order.customer_name.toUpperCase()},</p>
            <p style="font-family: 'Courier New', Courier, monospace; font-size: 18px; text-align: left; line-height: 1.4;">${customMessage}</p>
            
            <div style="background-color: #fff; border: 6px solid #000; padding: 30px; margin: 30px 0; text-align: center; box-shadow: 15px 15px 0px #000;">
                <h3 style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; margin: 0; font-size: 32px; font-style: italic;">${event.city.toUpperCase()}</h3>
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 22px; margin: 10px 0; font-weight: bold;">${event.venue.toUpperCase()}</p>
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 20px; margin: 0;">${event.date.toUpperCase()}</p>
                
                <div style="margin: 30px 0; background-color: #000; padding: 20px; display: inline-block; border: 4px solid #d9ff36;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TICKET:${order.order_id}&color=d9ff36&bgcolor=000" style="display: block;" />
                </div>
                <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: bold;">ORDER ID: #${order.order_id}</p>
            </div>
            
            <div style="background-color: #ff00ff; color: #fff; padding: 15px; border: 4px solid #000; display: inline-block; transform: rotate(-2deg); margin-top: 20px;">
                <p style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; margin: 0; font-size: 20px;">SHOW THIS AT THE ENTRANCE, BITCH!</p>
            </div>
            
            <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; margin-top: 40px; font-weight: bold; text-transform: uppercase; opacity: 0.6;">Don't reply to this mail. Nixxy is busy being toxic.</p>
        </div>
    </div>
    `;
}
