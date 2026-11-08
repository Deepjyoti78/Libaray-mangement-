import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { getDb } from './connection.js';
import { migrate } from './migrate.js';
import { seed } from './seed.js';
import { ensureOperationalDefaults } from './defaults.js';

export async function initializeDatabase() {
  await migrate();
  const db = await getDb();

  // If using an external production database, enforce operational defaults
  if (config.nodeEnv === 'production' && config.databaseUrl && !process.env.VERCEL) {
    await ensureOperationalDefaults(db);
  }

  const { rows } = await db.query('SELECT id FROM staff_users LIMIT 1');
  if (rows.length) {
    // If staff exist, check if facilities are present
    const facRes = await db.query('SELECT id FROM facilities LIMIT 1');
    if (!facRes.rows.length) {
      await seed();
    }
    return;
  }

  // Check for custom bootstrap administrator credentials
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (email && password && password.length >= 12 && password !== 'LibraryDemo2026!') {
    await db.query(
      `INSERT INTO staff_users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO NOTHING`,
      [process.env.BOOTSTRAP_ADMIN_NAME || 'Library Administrator', email, await bcrypt.hash(password, 12)]
    );
    // Ensure facilities exist so visits can be reserved
    const facRes = await db.query('SELECT id FROM facilities LIMIT 1');
    if (!facRes.rows.length) {
      await seed();
    }
    return;
  }

  // Otherwise, seed the database with demo facilities, capacities, sessions & default admin
  await seed();
}
