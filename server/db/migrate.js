import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './connection.js';
import { SCHEMA_SQL } from './schemaSql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrate() {
  console.log('Running database migrations...');
  let schemaSql;
  try {
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    schemaSql = fs.readFileSync(schemaPath, 'utf8');
  } catch (_) {
    schemaSql = SCHEMA_SQL;
  }

  const db = await getDb();
  // Split on statement ends to execute clean statements
  const statements = schemaSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await db.query(statement);
    } catch (err) {
      console.error(`Error executing statement: ${statement.slice(0, 60)}...`);
      throw err;
    }
  }

  console.log('Database migrations applied successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(async () => {
      const db = await getDb();
      await db.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
