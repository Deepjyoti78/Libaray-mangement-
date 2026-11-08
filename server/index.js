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

// Root welcome / status page for browser visitors
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Library System · Backend API</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F8F5EE; color: #2C1810; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #FFFFFF; border-radius: 16px; padding: 36px 32px; max-width: 480px; width: 100%; box-shadow: 0 10px 30px rgba(44, 24, 16, 0.08); text-align: center; border: 1px solid rgba(44, 24, 16, 0.08); }
    .pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(74, 222, 128, 0.15); color: #15803D; font-size: 0.78rem; font-weight: 600; padding: 5px 12px; border-radius: 9999px; margin-bottom: 16px; }
    .pill-dot { width: 8px; height: 8px; border-radius: 50%; background: #22C55E; }
    h1 { margin: 0 0 10px; font-size: 1.5rem; font-weight: 600; color: #2C1810; }
    p { margin: 0 0 24px; color: #6C5A4E; font-size: 0.92rem; line-height: 1.5; }
    .btn { display: inline-flex; align-items: center; justify-content: center; background: #2C1810; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 500; font-size: 0.9rem; transition: background 0.2s; }
    .btn:hover { background: #452619; }
    .api-link { display: block; margin-top: 18px; font-size: 0.8rem; color: #8C7B70; text-decoration: none; }
    .api-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="pill"><span class="pill-dot"></span> Backend API Running</div>
    <h1>Library Management Server</h1>
    <p>This is the Express backend API. To view and interact with the library website, open the frontend application:</p>
    <a class="btn" href="http://localhost:5174">Open Frontend App (localhost:5174) &rarr;</a>
    <a class="api-link" href="/api/health">Check API Health Status (/api/health)</a>
  </div>
</body>
</html>`);
  } else {
    res.json({
      service: 'library-booking-system-api',
      status: 'ok',
      frontend: 'http://localhost:5174',
      health: '/api/health',
    });
  }
});

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
