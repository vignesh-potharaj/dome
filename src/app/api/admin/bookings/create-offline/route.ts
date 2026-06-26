import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { bookings, bookingLogs } from '@/lib/db/schema';
import { getOrCreateCustomer, generateBookingId, calculateTotalPrice, checkSlotAvailability } from '@/lib/db/booking-queries';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const admin = verifyAdminToken(request);

    const body = await request.json();
    const { booking } = body;

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Missing booking data' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { date, slot, packageName, balloonColor, cakeOption, sparklers, eggless, addOns, ledName, customer } = booking;

    if (!date || !slot || !packageName || !customer?.name || !customer?.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: date, slot, packageName, customer.name, customer.phone' },
        { status: 400, headers: corsHeaders() }
      );
    }

    let targetBranch: string;
    if (admin.role === 'branch_admin') {
      targetBranch = admin.branchId as string;
    } else {
      if (!booking.branchId) {
        return NextResponse.json(
          { success: false, error: 'branchId is required for super_admin' },
          { status: 400, headers: corsHeaders() }
        );
      }
      targetBranch = booking.branchId;
    }

    const dateStr = typeof date === 'string' && date.includes('T') ? date.split('T')[0] : date;

    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);

      const availability = await checkSlotAvailability(tx, targetBranch, dateStr, slot);
      if (!availability.available) {
        throw new Error(availability.reason || 'Slot not available');
      }

      const customerRecord = await getOrCreateCustomer(tx, {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        occasions: customer.occasion && customer.celebrantName
          ? { [customer.occasion]: '' }
          : undefined,
        marketingConsent: customer.marketingConsent !== false,
      });

      const totalPrice = calculateTotalPrice({
        packageName,
        cakeOption,
        eggless,
        sparklers,
        addOns,
        ledName,
      });

      const bookingId = generateBookingId(targetBranch);

      const [newBooking] = await tx.insert(bookings)
        .values({
          id: bookingId,
          branchId: targetBranch,
          customerId: customerRecord.id,
          date: dateStr,
          slot,
          packageName,
          balloonColor: balloonColor || null,
          cakeOption: cakeOption || null,
          sparklers: sparklers ?? false,
          ledName: ledName || null,
          messageOnCake: customer.cakeMessage || null,
          addOns: addOns || [],
          celebrantName: customer.celebrantName || null,
          specialNote: customer.specialNote || null,
          guestCount: customer.guestCount || 1,
          status: 'confirmed',
          totalPrice,
          advancePaid: 0,
          razorpayOrderId: null,
          balancePaid: false,
        })
        .returning();

      await tx.insert(bookingLogs)
        .values({
          bookingId: newBooking.id,
          adminId: admin.adminId,
          action: 'created_offline',
          details: {
            totalPrice,
            createdBy: admin.adminId,
            branchId: targetBranch,
          },
        });

      return {
        bookingId: newBooking.id,
        totalPrice,
        customerName: customerRecord.name,
        customerPhone: customerRecord.phone,
      };
    });

    return NextResponse.json({ success: true, ...result }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error creating offline booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error occurred' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}
