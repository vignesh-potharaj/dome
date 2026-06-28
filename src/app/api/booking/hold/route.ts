import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { createOrUpdateSlotHold } from '@/lib/db/booking-queries';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { branchId, date, slot, bookingId } = body;

    if (!branchId || !date || !slot) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: branchId, date, slot' },
        { status: 400, headers: corsHeaders() }
      );
    }

    let dateStr = date;
    if (typeof date === 'string' && date.includes('T')) {
      dateStr = date.split('T')[0];
    }

    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);
      return await createOrUpdateSlotHold(tx, {
        branchId,
        date: dateStr,
        slot,
        existingBookingId: bookingId || null,
      });
    });

    return NextResponse.json(
      {
        success: true,
        bookingId: result.id,
        holdExpiresAt: result.holdExpiresAt,
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error holding slot:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to hold slot' },
      { status: 400, headers: corsHeaders() }
    );
  }
}
