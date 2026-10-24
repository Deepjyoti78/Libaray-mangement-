import fs from 'fs';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { config } from '../config.js';

let dbInstance = null;
let pgPool = null;

export async function getDb() {
  if (config.databaseUrl) {
    if (!pgPool) {
      pgPool = new pg.Pool({ connectionString: config.databaseUrl });
    }
    return {
      type: 'postgres',
      async query(sql, params = []) {
        const client = await pgPool.connect();
        try {
          const res = await client.query(sql, params);
          return { rows: res.rows, rowCount: res.rowCount };
        } finally {
          client.release();
        }
      },
      async transaction(fn) {
        const client = await pgPool.connect();
        try {
          await client.query('BEGIN');
          const txObj = {
            async query(sql, params = []) {
              const res = await client.query(sql, params);
              return { rows: res.rows, rowCount: res.rowCount };
            },
          };
          const result = await fn(txObj);
          await client.query('COMMIT');
          return result;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      },
      async close() {
        if (pgPool) await pgPool.end();
      },
    };
  }

  // Use persistent embedded PostgreSQL (PGlite)
  if (!dbInstance) {
    if (!fs.existsSync(config.databaseDir)) {
      fs.mkdirSync(config.databaseDir, { recursive: true });
    }
    dbInstance = new PGlite(config.databaseDir);
    await dbInstance.waitReady;
  }

  return {
    type: 'pglite',
    async query(sql, params = []) {
      const res = await dbInstance.query(sql, params);
      return { rows: res.rows, rowCount: res.rows.length };
    },
    async transaction(fn) {
      return await dbInstance.transaction(async (tx) => {
        const txObj = {
          async query(sql, params = []) {
            const res = await tx.query(sql, params);
            return { rows: res.rows, rowCount: res.rows.length };
          },
        };
        return await fn(txObj);
      });
    },
    async close() {
      if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
      }
    },
  };
}

export async function query(sql, params = []) {
  const db = await getDb();
  return db.query(sql, params);
}

export async function transaction(fn) {
  const db = await getDb();
  return db.transaction(fn);
}
