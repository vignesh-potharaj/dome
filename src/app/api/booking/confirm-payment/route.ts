import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { confirmBookingPayment } from '@/lib/db/booking-queries';
import { handleApiError } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay secret key missing on server' }, { status: 500 });
    }

    const body = await request.json();
    const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    if (!bookingId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing required transaction fields or signature.' }, { status: 400 });
    }

    // Signature verification algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      console.warn(`Payment signature mismatch for booking ${bookingId}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid payment signature. Payment verification failed.' 
      }, { status: 400 });
    }

    const updatedBooking = await db.transaction(async (tx) => {
      // 1. Bypass RLS for customer-facing flow
      await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);

      // 2. Confirm payment
      const booking = await confirmBookingPayment(tx, bookingId, razorpayPaymentId, razorpayOrderId);
      return booking;
    });

    return NextResponse.json({
      success: true,
      bookingId: updatedBooking.id,
      status: updatedBooking.status,
      razorpayPaymentId: updatedBooking.razorpayPaymentId
    });

  } catch (error: any) {
    return handleApiError('confirm-payment', error, 500);
  }
}


