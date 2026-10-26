import app from '../server/index.js';
import { migrate } from '../server/db/migrate.js';
import { seed } from '../server/db/seed.js';
import { getDb } from '../server/db/connection.js';

let initPromise = null;

async function ensureInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        console.log('[Vercel Serverless] Initializing database...');
        await migrate();
        const db = await getDb();
        const adminCheck = await db.query('SELECT id FROM staff_users LIMIT 1;');
        if (adminCheck.rows.length === 0) {
          console.log('[Vercel Serverless] Seeding initial dataset...');
          await seed();
        }
        console.log('[Vercel Serverless] Database ready.');
      } catch (err) {
        console.error('[Vercel Serverless] Initialization error:', err);
        initPromise = null;
        throw err;
      }
    })();
  }
  return initPromise;
}

export default async function handler(req, res) {
  try {
    await ensureInitialized();
  } catch (err) {
    console.error('Fatal initialization error in API handler:', err);
    return res.status(500).json({
      error: 'Backend initialization error',
      message: err.message,
    });
  }

  // Ensure req.url starts with /api so Express routes match correctly
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
}
