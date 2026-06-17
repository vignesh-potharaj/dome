import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { branches } from '@/lib/db/schema';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  try {
    // 1. Try querying the branches table to check if it exists and what's in it
    const existingBranches = await db.select().from(branches);
    
    let seeded = false;
    
    // 2. If the table exists but is empty, seed the default Kokapet and Sainikpuri branches
    if (existingBranches.length === 0) {
      await db.insert(branches).values([
        {
          id: 'kokapet',
          name: 'Kokapet Branch',
          status: 'active',
          capacity: 6,
        },
        {
          id: 'sainikpuri',
          name: 'Sainikpuri Branch',
          status: 'active',
          capacity: 6,
        },
      ]);
      seeded = true;
    }
    
    // 3. Re-query after potential seeding
    const currentBranches = seeded 
      ? await db.select().from(branches) 
      : existingBranches;

    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Supabase database!',
      tablesChecked: ['branches'],
      branchesCount: currentBranches.length,
      branches: currentBranches,
      seededDefaultData: seeded,
    }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Database connection test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to the database or find the required tables.',
      error: error.message || String(error),
      suggestion: error.message?.includes('relation "branches" does not exist')
        ? 'The "branches" table does not exist in Supabase yet. We need to run Drizzle Kit migration to create the tables.'
        : 'Please verify that your database credentials in .env.local are correct and your Supabase instance is active.',
    }, { status: 500, headers: corsHeaders() });
  }
}
