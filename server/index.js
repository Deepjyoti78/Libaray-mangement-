import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { migrate } from './db/migrate.js';
import { seed } from './db/seed.js';
import { getDb } from './db/connection.js';

import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import myBookingRoutes from './routes/myBooking.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxies/Vite
app.set('trust proxy', 1);

// Security & Parsing middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, same-origin, server-to-server)
    if (!origin) return callback(null, true);
    // Allow localhost, configured frontendOrigin, and any Vercel deployment
    if (
      origin === config.frontendOrigin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
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

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Server Initialization
export async function startServer() {
  try {
    // 1. Ensure migrations are applied
    await migrate();

    // 2. Check if admin user exists; if not, seed database
    const db = await getDb();
    const adminCheck = await db.query(`SELECT id FROM staff_users LIMIT 1;`);
    if (adminCheck.rows.length === 0) {
      console.log('No staff users found. Seeding initial demo dataset...');
      await seed();
    }

    const server = app.listen(config.port, () => {
      console.log(`─────────────────────────────────────────────────────────────────`);
      console.log(`🚀 Library Backend API running at http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv} | Timezone: ${config.timezone}`);
      console.log(`─────────────────────────────────────────────────────────────────`);
    });

    return { app, server };
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

// Start server if run directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

export default app;
