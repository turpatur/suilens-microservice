import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://inventory:inventory@localhost:5436/inventory',
});

export const db = drizzle(pool);