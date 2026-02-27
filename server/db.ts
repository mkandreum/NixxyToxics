import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcrypt';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(join(dataDir, 'database.sqlite'));

const saltRounds = 10;

// Initialize schema

// Settings
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

// Gallery
db.exec(`
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Events (Drag Shows)
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    city TEXT NOT NULL,
    venue TEXT NOT NULL,
    ticket_price REAL DEFAULT 0,
    buy_url TEXT,
    tickets_available INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Banners
db.exec(`
  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    bg_color TEXT DEFAULT '#dfff00',
    text_color TEXT DEFAULT 'black',
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Products (Merchandise)
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Orders
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE,
    customer_name TEXT,
    customer_email TEXT,
    items TEXT, -- JSON array of items
    total REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// SMTP Settings
db.exec(`
  CREATE TABLE IF NOT EXISTS smtp_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled INTEGER DEFAULT 0,
    host TEXT,
    port INTEGER,
    username TEXT,
    password TEXT,
    encryption TEXT DEFAULT 'tls',
    from_name TEXT,
    from_email TEXT,
    order_template TEXT,
    ticket_template TEXT,
    order_instructions TEXT
  )
`);

// Seed initial admin if not exists
const adminCount = db.prepare('SELECT count(*) as count FROM settings WHERE key = ?').get('admin_password') as any;
if (adminCount.count === 0) {
  const hashedPass = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'toxicadmin', 10);
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_password', hashedPass);
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('site_logo_text', 'Nixxy Toxic');
}

// Seed initial SMTP (empty)
const smtpCount = db.prepare('SELECT count(*) as count FROM smtp_settings').get() as any;
if (smtpCount.count === 0) {
  db.prepare('INSERT INTO smtp_settings (id, enabled) VALUES (1, 0)').run();
} else {
  // Migration for existing DBs
  const columns = db.prepare("PRAGMA table_info(smtp_settings)").all() as any[];
  const columnNames = columns.map(c => c.name);
  if (!columnNames.includes('order_template')) {
    db.exec("ALTER TABLE smtp_settings ADD COLUMN order_template TEXT");
  }
  if (!columnNames.includes('ticket_template')) {
    db.exec("ALTER TABLE smtp_settings ADD COLUMN ticket_template TEXT");
  }
  if (!columnNames.includes('order_instructions')) {
    db.exec("ALTER TABLE smtp_settings ADD COLUMN order_instructions TEXT");
  }

  // Migration for events table
  const eventColumns = db.prepare("PRAGMA table_info(events)").all() as any[];
  const eventColumnNames = eventColumns.map(c => c.name);
  if (!eventColumnNames.includes('ticket_price')) {
    db.exec("ALTER TABLE events ADD COLUMN ticket_price REAL DEFAULT 0");
  }
  if (!eventColumnNames.includes('buy_url')) {
    db.exec("ALTER TABLE events ADD COLUMN buy_url TEXT");
  }
  if (!eventColumnNames.includes('tickets_available')) {
    db.exec("ALTER TABLE events ADD COLUMN tickets_available INTEGER DEFAULT 100");
  }

  // Migration for products table
  const prodColumns = db.prepare("PRAGMA table_info(products)").all() as any[];
  const prodColumnNames = prodColumns.map(c => c.name);
  if (!prodColumnNames.includes('sort_order')) {
    db.exec("ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0");
  }
  if (!prodColumnNames.includes('badge')) {
    db.exec("ALTER TABLE products ADD COLUMN badge TEXT");
  }

  // Migration for orders table
  const orderColumns = db.prepare("PRAGMA table_info(orders)").all() as any[];
  const orderColumnNames = orderColumns.map(c => c.name);
  if (!orderColumnNames.includes('event_id')) {
    db.exec("ALTER TABLE orders ADD COLUMN event_id INTEGER");
  }
  if (!orderColumnNames.includes('status')) {
    db.exec("ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'");
  }

  // Migration for gallery table
  const galColumns = db.prepare("PRAGMA table_info(gallery)").all() as any[];
  const galColumnNames = galColumns.map(c => c.name);
  if (!galColumnNames.includes('sort_order')) {
    db.exec("ALTER TABLE gallery ADD COLUMN sort_order INTEGER DEFAULT 0");
    db.exec("UPDATE gallery SET sort_order = id");
  }

  // Migration for products table - STOCK
  const prodColumnsUpdated = db.prepare("PRAGMA table_info(products)").all() as any[];
  const prodColumnNamesUpdated = prodColumnsUpdated.map(c => c.name);
  if (!prodColumnNamesUpdated.includes('stock')) {
    db.exec("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT -1"); // -1 = unlimited
  }

  // Migration for orders table - DISCOUNTS
  const orderColumnsUpdated = db.prepare("PRAGMA table_info(orders)").all() as any[];
  const orderColumnNamesUpdated = orderColumnsUpdated.map(c => c.name);
  if (!orderColumnNamesUpdated.includes('discount_applied')) {
    db.exec("ALTER TABLE orders ADD COLUMN discount_applied REAL DEFAULT 0");
  }
}

// Activity Logs Table
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Coupons Table
db.exec(`
  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    discount_percent INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
