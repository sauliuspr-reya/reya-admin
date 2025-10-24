'use server';

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/** Execute SQL queries using the shared pool */
export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}
