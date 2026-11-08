import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { initializeDatabase } from './db/initialize.js';

import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import myBookingRoutes from './routes/myBooking.js';
import managementRoutes from './routes/management.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxies/Vite
app.set('trust proxy', 1);

// Security & Parsing middlewares
export function isAllowedOrigin(origin) {
  if (!origin) return true;
  const allowed = new Set([config.frontendOrigin]);
  if (config.nodeEnv !== 'production') {
    allowed.add('http://localhost:5174');
    allowed.add('http://127.0.0.1:5174');
  }
  if (process.env.VERCEL) {
    if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) allowed.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
    allowed.add('https://libaray-mangement.vercel.app');
  }
  try {
    const u = new URL(origin);
    if (u.hostname === 'libaray-mangement.vercel.app') return true;
    if (process.env.VERCEL_URL && u.hostname === process.env.VERCEL_URL) return true;
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL && u.hostname === process.env.VERCEL_PROJECT_PRODUCTION_URL) return true;
  } catch {}
  return allowed.has(origin);
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(Object.assign(new Error('Origin is not allowed.'), { status: 403 }));
  },
  credentials: true,
}));

app.use(cookieParser(config.cookieSecret));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'library-booking-system',
    timestamp: new Date().toISOString(),
    timezone: config.timezone,
  });
});

// API Routes
app.use('/api', publicRoutes);
app.use('/api/my-booking', myBookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', managementRoutes);

// Centralized error handler
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error('Unhandled server error:', err);
  res.status(status).json({
    error: status >= 500 && config.nodeEnv === 'production' ? 'Internal Server Error' : err.message || 'Internal Server Error',
  });
});

// Server Initialization
export async function startServer() {
  try {
    // 1. Ensure migrations are applied
    await initializeDatabase();

    const server = await new Promise((resolve, reject) => {
      const listener = app.listen(config.port);
      listener.once('error', reject);
      listener.once('listening', () => resolve(listener));
    });
    console.log(`─────────────────────────────────────────────────────────────────`);
    console.log(`🚀 Library Backend API running at http://localhost:${server.address().port}`);
    console.log(`🌍 Environment: ${config.nodeEnv} | Timezone: ${config.timezone}`);
    console.log(`─────────────────────────────────────────────────────────────────`);
    return { app, server };
  } catch (err) {
    console.error('Fatal initialization error:', err);
    throw err;
  }
}

// Start server if run directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer().catch(() => { process.exitCode = 1; });
}

export default app;
