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
    const items = JSON.parse(order.items);
    const itemsHtml = items.map((item: any) => `
        <div style="border-bottom: 2px solid #000; padding: 10px 0; display: flex; justify-content: space-between;">
            <span>${item.quantity}x ${item.name}</span>
            <span style="font-weight: bold;">${(item.price * item.quantity).toFixed(2)}€</span>
        </div>
    `).join('');

    return `
    <div style="font-family: monospace; background-color: #dfff00; color: #000; padding: 40px; border: 4px solid #000;">
        <div style="text-align: center; margin-bottom: 30px;">
            ${siteLogoUrl ? `<img src="${siteLogoUrl}" style="height: 80px;" />` : `<h1 style="font-size: 40px; margin: 0;">NIXXY TOXIC</h1>`}
        </div>
        
        <h2 style="text-transform: uppercase; font-size: 30px; border-bottom: 4px solid #000; padding-bottom: 10px;">Order Confirmation</h2>
        <p style="font-size: 18px;">Hi <strong>${order.customer_name}</strong>,</p>
        <p style="font-size: 16px;">Thanks for being toxic! Your order <strong>#${order.order_id}</strong> is being processed.</p>
        
        <div style="background-color: #fff; border: 4px solid #000; padding: 20px; margin: 20px 0;">
            <h3 style="text-transform: uppercase;">Items:</h3>
            ${itemsHtml}
            <div style="margin-top: 20px; text-align: right; font-size: 24px; font-weight: bold;">
                TOTAL: ${order.total.toFixed(2)}€
            </div>
        </div>
        
        <p style="font-size: 14px; opacity: 0.7;">This is an automated message. Don't reply, bitch!</p>
    </div>
    `;
}

export function generateTicketEmail(order: any, event: any, siteLogoUrl: string) {
    return `
    <div style="font-family: monospace; background-color: #dfff00; color: #000; padding: 40px; border: 4px solid #000;">
        <div style="text-align: center; margin-bottom: 30px;">
            ${siteLogoUrl ? `<img src="${siteLogoUrl}" style="height: 80px;" />` : `<h1 style="font-size: 40px; margin: 0;">NIXXY TOXIC</h1>`}
        </div>
        
        <h2 style="text-transform: uppercase; font-size: 30px; border-bottom: 4px solid #000; padding-bottom: 10px;">Drag Show Ticket</h2>
        <p style="font-size: 18px;">Hi <strong>${order.customer_name}</strong>,</p>
        <p style="font-size: 16px;">You are ready for the show! Here is your ticket for <strong>${event.venue}</strong>.</p>
        
        <div style="background-color: #fff; border: 4px solid #000; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="text-transform: uppercase; margin: 0; font-size: 24px;">${event.city}</h3>
            <p style="font-size: 20px; margin: 10px 0;">${event.date}</p>
            <div style="margin: 20px 0;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET:${order.order_id}" style="border: 4px solid #000;" />
            </div>
            <p style="font-size: 14px;">ORDER ID: #${order.order_id}</p>
        </div>
        
        <p style="font-size: 16px; font-weight: bold; color: #ff00ff;">Show this QR at the entrance, Bitch!</p>
    </div>
    `;
}
