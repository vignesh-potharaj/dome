import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error(
    '❌ [DATABASE ERROR]: DATABASE_URL is missing in environment variables! Database queries will fail.'
  );
}

// Prevent multiple connections in development due to Next.js hot reloading
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const queryClient = globalForDb.conn ?? postgres(connectionString, {
  max: 10, // Max connection limit to prevent pooler exhaustion
  connect_timeout: 10, // Timeout connection attempts after 10 seconds
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = queryClient;
}

export const db = drizzle(queryClient, { schema });

