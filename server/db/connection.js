import fs from 'fs';

import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { config } from '../config.js';

let dbInstance = null;
let pgPool = null;
let initialization = null;

// Fail closed: an unreadable database must never be erased or replaced with
// temporary storage. Keep the original files available for manual recovery.
export async function initializeEmbeddedDatabase(directory, createDatabase = (dir) => new PGlite(dir)) {
  fs.mkdirSync(directory, { recursive: true });
  const instance = createDatabase(directory);
  try {
    await instance.waitReady;
    return instance;
  } catch (cause) {
    try { await instance.close(); } catch { /* Preserve the original initialization error. */ }
    throw new Error(`Cannot open database at ${directory}. Existing data was preserved.`, { cause });
  }
}

export async function getDb() {
  if (config.databaseUrl) {
    if (!pgPool) {
      pg.types.setTypeParser(1082, (value) => value);
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
        pgPool = null;
      },
    };
  }

  // Use persistent embedded PostgreSQL (PGlite)
  if (!initialization) {
    initialization = initializeEmbeddedDatabase(config.databaseDir)
      .then((instance) => { dbInstance = instance; })
      .catch((error) => { initialization = null; throw error; });
  }
  await initialization;

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
        initialization = null;
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
