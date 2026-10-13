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
    console.log('Running ALTER TABLE statements on branches table...');
    
    // Add phone column
    await sql`
      ALTER TABLE "branches" 
      ADD COLUMN IF NOT EXISTS "phone" varchar(20);
    `;
    console.log('✓ Added or verified column: phone');

    // Add allow_online_bookings column
    await sql`
      ALTER TABLE "branches" 
      ADD COLUMN IF NOT EXISTS "allow_online_bookings" boolean DEFAULT true NOT NULL;
    `;
    console.log('✓ Added or verified column: allow_online_bookings');

    // Seed/update placeholder numbers if empty
    console.log('Setting placeholder phone numbers for default branches if not already set...');
    await sql`
      UPDATE "branches"
      SET "phone" = '+91 98765 43210'
      WHERE "id" = 'kokapet' AND ("phone" IS NULL OR "phone" = '');
    `;

    await sql`
      UPDATE "branches"
      SET "phone" = '+91 98765 43211'
      WHERE "id" = 'sainikpuri' AND ("phone" IS NULL OR "phone" = '');
    `;

    console.log('Verifying branches table structure and values:');
    const branchRows = await sql`
      SELECT id, name, status, capacity, phone, allow_online_bookings
      FROM "branches"
      ORDER BY id;
    `;
    console.log('Current branches in database:');
    console.table(branchRows);

    console.log('🎉 Step 1 Migration completed successfully!');
  } finally {
    await sql.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
