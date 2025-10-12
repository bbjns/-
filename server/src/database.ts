import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
const db = new Database(dbPath);

export const initDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      isPremium INTEGER DEFAULT 0,
      premiumExpireDate TEXT,
      isAdmin INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      amount REAL NOT NULL,
      duration INTEGER NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Create admin user if doesn't exist
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (id, email, password, isAdmin)
      VALUES (?, ?, ?, 1)
    `).run(generateId(), adminEmail, hashedPassword);
    console.log(`Admin user created: ${adminEmail} / admin123`);
  }

  console.log('Database initialized');
};

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export default db;
