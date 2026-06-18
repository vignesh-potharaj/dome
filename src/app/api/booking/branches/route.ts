import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { branches } from '@/lib/db/schema';

export async function GET() {
  try {
    const list = await db.transaction(async (tx) => {
      // Bypass RLS for customer-facing flow
      await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);
      return await tx.select().from(branches);
    });

    return NextResponse.json({ success: true, branches: list });
  } catch (error: any) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}
