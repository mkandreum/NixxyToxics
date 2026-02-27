import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import fs from 'fs';
import multer from 'multer';
import sharp from 'sharp';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nixxy-toxic-secret-key';

app.use(express.json());

const logActivity = (action: string, details: string) => {
    try {
        db.prepare('INSERT INTO activity_logs (action, details) VALUES (?, ?)').run(action, details);
    } catch (err) {
        console.error("Logging error:", err);
    }
};

// Ensure directories exist
const dataDir = path.join(__dirname, '../data');
const uploadsDir = path.join(__dirname, '../uploads');
[dataDir, uploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure Multer for uploads (temporary storage before processing)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AUTH MIDDLEWARE
const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send('Unauthorized');
    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).send('Invalid token');
    }
};

// Static files - hashed assets get long cache, HTML always revalidates
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            // HTML must always revalidate so new builds are picked up immediately
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (filePath.includes('/assets/')) {
            // Vite hashed assets can be cached forever (filename changes on rebuild)
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
}));

app.use('/uploads', express.static(uploadsDir, {
    maxAge: '30d',
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
}));

// --- AUTH ROUTES ---
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password') as { value: string };

    if (row && bcrypt.compareSync(password, row.value)) {
        const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).send('Invalid password');
    }
});

// --- API ROUTES ---

// Gallery
app.get('/api/gallery', (req, res) => {
    const images = db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC, created_at DESC').all();
    res.json(images);
});

app.post('/api/gallery/reorder', authenticate, (req, res) => {
    const { itemIds } = req.body;
    const stmt = db.prepare('UPDATE gallery SET sort_order = ? WHERE id = ?');
    const transaction = db.transaction((ids) => {
        ids.forEach((id: number, index: number) => stmt.run(index, id));
    });
    transaction(itemIds);
    res.sendStatus(200);
});

app.post('/api/gallery', authenticate, upload.single('photo'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');

    const filename = `gallery-${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    try {
        await sharp(req.file.buffer)
            .webp({ quality: 80 })
            .toFile(filepath);

        const url = `/uploads/${filename}`;
        const stmt = db.prepare('INSERT INTO gallery (url, caption) VALUES (?, ?)');
        const info = stmt.run(url, req.body.caption || '');
        logActivity('IMAGE_UPLOAD', `Uploaded new image to gallery: ${url}`);
        res.json({ id: info.lastInsertRowid, url });
    } catch (err) {
        console.error("Sharp error:", err);
        res.status(500).send('Error processing image');
    }
});

app.post('/api/settings/gallery-bg', authenticate, upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    // Note: videos are not converted to webp, just saved directly as they are.
    const filename = `bg-${Date.now()}${path.extname(req.file.originalname)}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, req.file.buffer);

    const url = `/uploads/${filename}`;
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    upsert.run('gallery_bg_video', url);
    res.json({ url });
});

app.delete('/api/gallery/:id', authenticate, (req, res) => {
    const item = db.prepare('SELECT url FROM gallery WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    logActivity('IMAGE_DELETE', `Deleted image: ${item?.url}`);
    res.sendStatus(200);
});

// Events (Drag Shows)
app.get('/api/events', (req, res) => {
    const events = db.prepare('SELECT * FROM events ORDER BY date ASC').all();
    res.json(events);
});

app.post('/api/events', authenticate, (req, res) => {
    try {
        const { date, city, venue, ticket_price, buy_url, tickets_available } = req.body;
        const stmt = db.prepare('INSERT INTO events (date, city, venue, ticket_price, buy_url, tickets_available) VALUES (?, ?, ?, ?, ?, ?)');
        const info = stmt.run(date, city, venue, ticket_price || 0, buy_url || '', tickets_available || 100);
        logActivity('EVENT_CREATE', `Created show in ${city} on ${date}`);
        res.json({ id: info.lastInsertRowid });
    } catch (err) {
        console.error("Error creating event:", err);
        res.status(500).json({ error: "Failed to create event" });
    }
});

app.get('/api/events/:id/attendees', authenticate, (req, res) => {
    const attendees = db.prepare('SELECT customer_name, customer_email, created_at FROM orders WHERE event_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(attendees);
});

app.delete('/api/events/:id', authenticate, (req, res) => {
    const item = db.prepare('SELECT city, date FROM events WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    logActivity('EVENT_DELETE', `Deleted show: ${item?.city} on ${item?.date}`);
    res.sendStatus(200);
});

app.patch('/api/events/:id', authenticate, (req, res) => {
    const { date, city, venue, ticket_price, buy_url, tickets_available } = req.body;
    const stmt = db.prepare(`
        UPDATE events 
        SET date = ?, city = ?, venue = ?, ticket_price = ?, buy_url = ?, tickets_available = ?
        WHERE id = ?
    `);
    stmt.run(date, city, venue, ticket_price, buy_url, tickets_available, req.params.id);
    res.sendStatus(200);
});

import { sendEmail, generateOrderEmail, generateTicketEmail } from './email';

// Products (Merchandise)
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC, created_at DESC').all();
    res.json(products);
});

app.post('/api/products', authenticate, upload.single('image'), async (req, res) => {
    const { name, description, price, badge } = req.body;
    let imageUrl = '';

    if (req.file) {
        const filename = `product-${Date.now()}.webp`;
        const filepath = path.join(uploadsDir, filename);
        await sharp(req.file.buffer)
            .webp()
            .toFile(filepath);
        imageUrl = `/uploads/${filename}`;
    }

    const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, badge, stock) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, description, price, imageUrl, badge || '', req.body.stock || -1);
    logActivity('PRODUCT_CREATE', `Added merch: ${name} (${price}€)`);
    res.json({ id: info.lastInsertRowid });
});

app.post('/api/products/reorder', authenticate, (req, res) => {
    const { productIds } = req.body;
    const stmt = db.prepare('UPDATE products SET sort_order = ? WHERE id = ?');
    const transaction = db.transaction((ids) => {
        ids.forEach((id: number, index: number) => stmt.run(index, id));
    });
    transaction(productIds);
    res.sendStatus(200);
});

app.delete('/api/products/:id', authenticate, (req, res) => {
    const item = db.prepare('SELECT name FROM products WHERE id = ?').get(req.params.id) as any;
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    logActivity('PRODUCT_DELETE', `Deleted merch: ${item?.name}`);
    res.sendStatus(200);
});

app.patch('/api/products/:id', authenticate, upload.single('image'), async (req, res) => {
    const { name, price, badge } = req.body;
    let imageUrl = req.body.image_url;

    if (req.file) {
        const filename = `product-${Date.now()}.webp`;
        const filepath = path.join(uploadsDir, filename);
        await sharp(req.file.buffer)
            .webp()
            .toFile(filepath);
        imageUrl = `/uploads/${filename}`;
    }

    const stmt = db.prepare(`
        UPDATE products 
        SET name = ?, price = ?, badge = ?, image_url = ?, stock = ?
        WHERE id = ?
    `);
    stmt.run(name, price, badge || '', imageUrl, req.body.stock || -1, req.params.id);
    logActivity('PRODUCT_UPDATE', `Updated merch: ${name}`);
    res.sendStatus(200);
});

// Checkout & Orders
app.post('/api/checkout', async (req, res) => {
    const { customer_name, customer_email, items, total, event_id, coupon_code } = req.body;

    // Check coupon
    let discount = 0;
    if (coupon_code) {
        const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(coupon_code) as any;
        if (coupon) {
            discount = (total * coupon.discount_percent) / 100;
        }
    }

    const orderId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Handle Stock for merchandise (not events for now as they have generic tickets_available)
    const productItems = items.filter((i: any) => !i.event_id);
    for (const item of productItems) {
        const prod = db.prepare('SELECT stock FROM products WHERE id = ?').get(item.id) as any;
        if (prod && prod.stock !== -1) {
            if (prod.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for ${item.name}` });
            }
            db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.id);
        }
    }

    const stmt = db.prepare('INSERT INTO orders (order_id, customer_name, customer_email, items, total, event_id, discount_applied) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(orderId, customer_name, customer_email, JSON.stringify(items), total - discount, event_id || null, discount);

    logActivity('ORDER_PLACE', `New order #${orderId} from ${customer_name} (${total - discount}€)`);

    const order = { order_id: orderId, customer_name, customer_email, items: JSON.stringify(items), total: total - discount };
    const siteLogo = db.prepare('SELECT value FROM settings WHERE key = ?').get('site_logo_url') as any;

    let emailHtml = '';
    let subject = '';

    if (event_id) {
        const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id) as any;
        emailHtml = generateTicketEmail(order, event, siteLogo?.value);
        subject = `🎟️ YOUR TICKETS: ${event.city} - Nixxy Toxic`;
    } else {
        emailHtml = generateOrderEmail(order, siteLogo?.value);
        subject = `💰 TOXIC ORDER CONFIRMATION #${orderId}`;
    }

    if (process.env.SMTP_ENABLED === 'true') {
        await sendEmail({ to: customer_email, subject, html: emailHtml });
    }

    res.json({ success: true, orderId });
});

app.get('/api/orders', authenticate, (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
});

app.patch('/api/orders/:id', authenticate, (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.sendStatus(200);
});

app.delete('/api/orders/:id', authenticate, (req, res) => {
    db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    res.sendStatus(200);
});

// SMTP Settings
app.get('/api/smtp', authenticate, (req, res) => {
    const smtp = db.prepare('SELECT * FROM smtp_settings WHERE id = 1').get();
    res.json(smtp);
});

app.post('/api/smtp', authenticate, (req, res) => {
    const { enabled, host, port, username, password, encryption, from_name, from_email, order_template, ticket_template, order_instructions } = req.body;
    const stmt = db.prepare(`
        UPDATE smtp_settings 
        SET enabled = ?, host = ?, port = ?, username = ?, password = ?, encryption = ?, from_name = ?, from_email = ?, order_template = ?, ticket_template = ?, order_instructions = ?
        WHERE id = 1
    `);
    stmt.run(enabled ? 1 : 0, host, port, username, password, encryption, from_name, from_email, order_template, ticket_template, order_instructions);
    res.sendStatus(200);
});

app.post('/api/settings/hero-image', authenticate, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const filename = `hero-${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);
    await sharp(req.file.buffer)
        .webp()
        .toFile(filepath);

    const url = `/uploads/${filename}`;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('hero_image_url', url);
    res.json({ url });
});

// --- STATS, LOGS & COUPONS ---

app.get('/api/activity', authenticate, (req, res) => {
    const logs = db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50').all();
    res.json(logs);
});

app.get('/api/coupons', authenticate, (req, res) => {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json(coupons);
});

app.post('/api/coupons', authenticate, (req, res) => {
    const { code, discount_percent } = req.body;
    try {
        db.prepare('INSERT INTO coupons (code, discount_percent) VALUES (?, ?)').run(code, discount_percent);
        logActivity('COUPON_CREATE', `Created coupon: ${code} (${discount_percent}%)`);
        res.sendStatus(201);
    } catch (err) {
        res.status(400).send('Code already exists');
    }
});

app.delete('/api/coupons/:id', authenticate, (req, res) => {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    res.sendStatus(200);
});

app.get('/api/admin/stats', authenticate, (req, res) => {
    const totalSales = db.prepare('SELECT SUM(total) as total FROM orders').get() as any;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
    const itemsCount = db.prepare('SELECT COUNT(*) as count FROM products').all() as any;

    // Daily sales for chart
    const dailySales = db.prepare(`
        SELECT date(created_at) as date, SUM(total) as amount 
        FROM orders 
        GROUP BY date(created_at) 
        ORDER BY date ASC 
        LIMIT 30
    `).all();

    // Top products
    const orders = db.prepare('SELECT items FROM orders').all() as any[];
    const productStats: any = {};
    orders.forEach(o => {
        const items = JSON.parse(o.items);
        items.forEach((item: any) => {
            if (!item.event_id) {
                productStats[item.name] = (productStats[item.name] || 0) + item.quantity;
            }
        });
    });

    res.json({
        totalRevenue: totalSales?.total || 0,
        orderCount: totalOrders?.count || 0,
        productCount: itemsCount?.count || 0,
        dailySales,
        productStats: Object.entries(productStats).map(([name, qty]) => ({ name, qty }))
    });
});

app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
        if (curr.key !== 'admin_password') { // Don't leak hashed password
            acc[curr.key] = curr.value;
        }
        return acc;
    }, {});
    res.json(settingsObj);
});

app.post('/api/settings', authenticate, (req, res) => {
    const updates = req.body;
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

    if (updates.admin_password) {
        updates.admin_password = bcrypt.hashSync(updates.admin_password, 10);
    }

    const transaction = db.transaction((data) => {
        for (const [key, value] of Object.entries(data)) {
            upsert.run(key, value);
        }
    });
    transaction(updates);
    res.sendStatus(200);
});

app.post('/api/settings/logo', authenticate, upload.single('logo'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    const filename = `logo-${Date.now()}${path.extname(req.file.originalname)}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, req.file.buffer);

    const url = `/uploads/${filename}`;
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    upsert.run('site_logo_url', url);
    res.json({ url });
});

// Banners
app.get('/api/banners', (req, res) => {
    const banners = db.prepare('SELECT * FROM banners').all();
    res.json(banners);
});

app.post('/api/banners', authenticate, (req, res) => {
    const { text, bg_color, text_color, active } = req.body;
    const stmt = db.prepare('INSERT INTO banners (text, bg_color, text_color, active) VALUES (?, ?, ?, ?)');
    const info = stmt.run(text, bg_color || '#dfff00', text_color || 'black', active !== undefined ? active : 1);
    res.json({ id: info.lastInsertRowid, ...req.body });
});

app.delete('/api/banners/:id', authenticate, (req, res) => {
    db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
    res.sendStatus(200);
});

app.put('/api/banners/:id', authenticate, (req, res) => {
    const { active } = req.body;
    db.prepare('UPDATE banners SET active = ? WHERE id = ?').run(active, req.params.id);
    res.sendStatus(200);
});

// Handle React routing - never cache the SPA entry point
app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
// Force reload trigger
