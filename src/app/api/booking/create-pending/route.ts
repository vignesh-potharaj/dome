import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { getOrCreateCustomer, createPendingBooking, calculateTotalPrice } from '@/lib/db/booking-queries';
import { handleApiError } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay credentials missing on server' }, { status: 500 });
    }

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

    // Calculate advance price and validate >= 100 paise (₹1)
    const totalPrice = calculateTotalPrice({
      packageName,
      cakeOption,
      eggless: !!eggless,
      sparklers: !!sparklers,
      addOns: addOns || [],
      ledName
    });
    const advancePaid = Math.floor(totalPrice / 2);
    const amountInPaise = Math.round(advancePaid * 100);

    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'Order amount must be at least ₹1 (100 paise).' }, { status: 400 });
    }

    // Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create real Razorpay Order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now().toString(36)}`,
        notes: {
          location,
          packageName,
          customerName: customer.name,
          customerPhone: customer.phone,
        },
      });
    } catch (rzpErr: any) {
      console.error('Razorpay Order Creation Failed:', rzpErr);
      if (rzpErr.statusCode === 401 || rzpErr.status === 401) {
        return NextResponse.json({ error: 'Razorpay authentication failed. Invalid API keys.' }, { status: 401 });
      }
      return NextResponse.json({ 
        error: rzpErr.description || rzpErr.message || 'Failed to create payment order with Razorpay.' 
      }, { status: 500 });
    }

    const razorpayOrderId = razorpayOrder.id;

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

      // 4. Create pending booking record with real razorpayOrderId
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
    return handleApiError('create-pending booking', error, 500);
  }
}


