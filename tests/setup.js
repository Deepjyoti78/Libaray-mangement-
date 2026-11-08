import { mkdtempSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

// Set environment synchronously before sibling imports evaluate config.js.
const directory = mkdtempSync(path.join(tmpdir(), 'library-tests-'));
const externalUrl = process.env.TEST_DATABASE_URL;
let schema;
if (externalUrl) {
  schema = `library_test_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(externalUrl);
  url.searchParams.set('options', `-c search_path=${schema}`);
  process.env.DATABASE_URL = url.toString();
} else {
  process.env.DATABASE_URL = '';
}
Object.assign(process.env, {
  DATABASE_DIR: directory, PORT: '0', NODE_ENV: 'test', SMTP_HOST: '', VERCEL: '',
  DEMO_ADMIN_EMAIL: 'admin@library.delhi', DEMO_ADMIN_PASSWORD: 'LibraryDemo2026!',
  FRONTEND_ORIGIN: 'http://localhost:5174',
});

export const databaseReady = externalUrl ? (async () => {
  const pool = new pg.Pool({ connectionString: externalUrl });
  try { await pool.query(`CREATE SCHEMA ${schema}`); } finally { await pool.end(); }
})() : Promise.resolve();

export async function cleanupTestDatabase() {
  if (schema) {
    const pool = new pg.Pool({ connectionString: externalUrl });
    try { await pool.query(`DROP SCHEMA ${schema} CASCADE`); } finally { await pool.end(); }
  }
  // This absolute directory comes directly from mkdtemp, never from user config.
  await rm(directory, { recursive: true, force: true });
}
