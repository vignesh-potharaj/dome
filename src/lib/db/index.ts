import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// Prevent multiple connections in development due to Next.js hot reloading
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const queryClient = globalForDb.conn ?? postgres(connectionString, {
  max: 10, // Max connection limit to prevent pooler exhaustion
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = queryClient;
}

export const db = drizzle(queryClient, { schema });
