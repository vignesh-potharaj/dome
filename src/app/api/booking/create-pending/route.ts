import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { getOrCreateCustomer, createPendingBooking } from '@/lib/db/booking-queries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking } = body;

    if (!booking) {
      return NextResponse.json({ error: 'Missing booking details' }, { status: 400 });
    }

    const { 
      location, 
      date, 
      slot, 
      package: packageName, 
      balloonColor, 
      cakeOption, 
      sparklers, 
      eggless, 
      addOns, 
      ledName, 
      customer 
    } = booking;

    if (!location || !date || !slot || !packageName || !customer || !customer.phone || !customer.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Format date correctly (handle Date object strings like "2026-06-16T12:00:00.000Z" or similar)
    let dateStr = date;
    if (typeof date === 'string') {
      dateStr = date.split('T')[0]; // Ensure it is YYYY-MM-DD
    } else if (date instanceof Date) {
      dateStr = date.toISOString().split('T')[0];
    }

    // Run within database transaction to enforce atomicity and bypass RLS
    const result = await db.transaction(async (tx) => {
      // 1. Bypass RLS for customer-facing flow
      await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);

      // 2. Get or create customer
      const occasions: Record<string, string> = {};
      if (customer.occasion) {
        const key = customer.occasion.toLowerCase();
        occasions[key] = dateStr; // Store this occasion date
      }

      // Default opt-in: customers are opted in unless they explicitly opt out
      const rawConsent = customer.marketingConsent ?? booking.marketingConsent ?? booking.customer.marketingConsent;
      const marketingConsent = rawConsent !== false;

      const dbCustomer = await getOrCreateCustomer(tx, {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || undefined,
        occasions,
        marketingConsent
      });

      // 3. Prepare cake message and special requests
      const messageOnCake = customer.cakeMessage || null;
      const specialNote = customer.specialNote || null;

      // 4. Create pending booking record
      // We generate the razorpayOrderId here
      const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

      const dbBooking = await createPendingBooking(tx, {
        branchId: location,
        customerId: dbCustomer.id,
        date: dateStr,
        slot,
        packageName,
        balloonColor,
        cakeOption,
        sparklers: !!sparklers,
        eggless: !!eggless,
        ledName,
        messageOnCake,
        addOns: addOns || [],
        celebrantName: customer.celebrantName || null,
        specialNote,
        guestCount: parseInt(customer.guestCount, 10) || 2,
        razorpayOrderId,
        existingBookingId: booking.bookingId || null,
      });

      return {
        bookingId: dbBooking.id,
        totalPrice: dbBooking.totalPrice,
        advancePaid: dbBooking.advancePaid,
        razorpayOrderId: dbBooking.razorpayOrderId,
        customerName: dbCustomer.name,
        customerPhone: dbCustomer.phone
      };
    });

    return NextResponse.json({ success: true, ...result });

  } catch (error: any) {
    console.error('Error in create-pending route:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An error occurred during booking creation.' 
    }, { status: 500 });
  }
}
