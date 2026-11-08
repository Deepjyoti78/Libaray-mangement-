import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { getDb } from './connection.js';
import { migrate } from './migrate.js';
import { seed } from './seed.js';
import { ensureOperationalDefaults } from './defaults.js';

export async function initializeDatabase() {
  await migrate();
  const db = await getDb();
  if (config.nodeEnv === 'production') await ensureOperationalDefaults(db);
  const { rows } = await db.query('SELECT id FROM staff_users LIMIT 1');
  if (rows.length) return;
  if (config.nodeEnv !== 'production') {
    await seed();
    return;
  }
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12 || password === 'LibraryDemo2026!') {
    throw new Error('Set BOOTSTRAP_ADMIN_EMAIL and a unique BOOTSTRAP_ADMIN_PASSWORD (12+ characters) for the initial administrator.');
  }
  await db.query(
    `INSERT INTO staff_users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO NOTHING`,
    [process.env.BOOTSTRAP_ADMIN_NAME || 'Library Administrator', email, await bcrypt.hash(password, 12)]
  );
}
