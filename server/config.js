import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export function validateProductionConfig(env) {
  if (env.NODE_ENV !== 'production') return;
  for (const key of ['JWT_SECRET', 'COOKIE_SECRET']) {
    if (!env[key] || env[key].length < 32 || /demo|fallback|change.in.production|development.only/i.test(env[key])) {
      throw new Error(`${key} must be a unique production secret of at least 32 characters.`);
    }
  }
  const origin = new URL(env.FRONTEND_ORIGIN || 'http://localhost');
  if (origin.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(origin.hostname)) {
    throw new Error('FRONTEND_ORIGIN must be the HTTPS URL of your production frontend.');
  }
  if (env.VERCEL && !env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required on Vercel to keep data persistent.');
  }
}

validateProductionConfig(process.env);

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5174',
  databaseUrl: process.env.DATABASE_URL || '',
  databaseDir: process.env.VERCEL
    ? path.join('/tmp', 'postgres')
    : path.resolve(__dirname, '../', process.env.DATABASE_DIR || './data/postgres'),
  jwtSecret: process.env.JWT_SECRET || randomBytes(48).toString('hex'),
  cookieSecret: process.env.COOKIE_SECRET || randomBytes(48).toString('hex'),
  tokenExpiry: process.env.TOKEN_EXPIRY || '8h',
  timezone: process.env.APP_TIMEZONE || 'Asia/Kolkata',
  demoAdmin: {
    name: process.env.DEMO_ADMIN_NAME || 'Staff Administrator',
    email: (process.env.DEMO_ADMIN_EMAIL || 'admin@library.delhi').toLowerCase().trim(),
    password: process.env.DEMO_ADMIN_PASSWORD || 'LibraryDemo2026!',
  },
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'The Library <noreply@library.delhi>',
  },
};
