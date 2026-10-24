import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  databaseDir: path.resolve(__dirname, '../../', process.env.DATABASE_DIR || './data/postgres'),
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-for-demo-purposes-only-32ch',
  cookieSecret: process.env.COOKIE_SECRET || 'fallback-cookie-secret-for-demo-32ch',
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
