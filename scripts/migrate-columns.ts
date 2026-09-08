import postgres from 'postgres';

async function migrate() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL is missing in environment variables');
  }

  console.log('Connecting to database...');
  const sql = postgres(connectionString, {
    max: 1,
    connect_timeout: 10,
  });

  try {
    console.log('Running ALTER TABLE statements on bookings table...');
    await sql`
      ALTER TABLE "bookings" 
      ADD COLUMN IF NOT EXISTS "phone_verified" boolean DEFAULT false NOT NULL;
    `;
    console.log('✓ Added phone_verified');

    await sql`
      ALTER TABLE "bookings" 
      ADD COLUMN IF NOT EXISTS "phone_verified_at" timestamp;
    `;
    console.log('✓ Added phone_verified_at');

    await sql`
      ALTER TABLE "bookings" 
      ADD COLUMN IF NOT EXISTS "phone_verified_number" varchar(20);
    `;
    console.log('✓ Added phone_verified_number');

    console.log('Verifying columns in bookings table:');
    const cols = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'bookings'
        AND column_name IN ('phone_verified', 'phone_verified_at', 'phone_verified_number');
    `;
    console.log(cols);

    // Also run a test query matching the user's failed query
    console.log('Testing the query that failed...');
    const testResult = await sql`
      SELECT "id", "phone_verified", "phone_verified_at", "phone_verified_number"
      FROM "bookings"
      LIMIT 1;
    `;
    console.log('Test query result:', testResult);
    console.log('Migration completed successfully!');
  } finally {
    await sql.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
