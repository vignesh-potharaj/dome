import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../../src/lib/db/schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in environment variables');
}

const client = postgres(connectionString, {
  max: 5, // Small connection pool size for Express 24/7 service to prevent connection exhaustion
});

export const db = drizzle(client, { schema });
