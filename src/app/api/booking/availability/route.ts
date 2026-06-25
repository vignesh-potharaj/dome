import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { checkSlotAvailability } from '@/lib/db/booking-queries';

const allSlots = [
  '5:00 PM – 6:30 PM',
  '7:00 PM – 8:30 PM',
  '9:00 PM – 10:30 PM',
  '11:00 PM – 12:30 AM',
];

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const date = searchParams.get('date');

    if (!branchId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: branchId and date are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Format date correctly (ensure YYYY-MM-DD)
    let dateStr = date;
    if (date.includes('T')) {
      dateStr = date.split('T')[0];
    }

    const excludeBookingId = searchParams.get('excludeBookingId') || undefined;

    const results = await db.transaction(async (tx) => {
      // Bypass RLS for customer-facing flow
      await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);

      const slotsAvailability: Record<string, { available: boolean; reason?: string }> = {};

      for (const slot of allSlots) {
        const status = await checkSlotAvailability(tx, branchId, dateStr, slot, excludeBookingId);
        slotsAvailability[slot] = status;
      }

      return slotsAvailability;
    });

    return NextResponse.json({ success: true, slots: results }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch availability' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
