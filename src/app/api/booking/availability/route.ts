import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { checkSlotAvailability } from '@/lib/db/booking-queries';
import { handleApiError } from '@/lib/api-response';

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

      // 1. Check if branch has online bookings paused
      const branchInfo = await tx.query.branches.findFirst({
        where: (branches: any, { eq }: any) => eq(branches.id, branchId),
      });

      if (branchInfo && branchInfo.allowOnlineBookings === false) {
        return {
          allowOnlineBookings: false,
          branchName: branchInfo.name,
          phone: branchInfo.phone,
          error: `Online bookings are currently paused for ${branchInfo.name}. Please call us at ${branchInfo.phone || 'our branch'} to reserve.`,
          slots: {},
        };
      }

      const slotsAvailability: Record<string, { available: boolean; reason?: string }> = {};

      for (const slot of allSlots) {
        const status = await checkSlotAvailability(tx, branchId, dateStr, slot, excludeBookingId);
        slotsAvailability[slot] = status;
      }

      return {
        allowOnlineBookings: true,
        branchName: branchInfo?.name,
        phone: branchInfo?.phone,
        slots: slotsAvailability,
      };
    });

    return NextResponse.json({ success: true, ...results }, { headers: corsHeaders() });
  } catch (error: any) {
    return handleApiError('fetching availability', error, 500, corsHeaders());
  }
}

