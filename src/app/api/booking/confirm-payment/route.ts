import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { confirmBookingPayment } from '@/lib/db/booking-queries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, razorpayPaymentId, razorpayOrderId } = body;

    if (!bookingId || !razorpayPaymentId || !razorpayOrderId) {
      return NextResponse.json({ error: 'Missing transaction details' }, { status: 400 });
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
    console.error('Error in confirm-payment route:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'An error occurred during payment confirmation.' 
    }, { status: 500 });
  }
}
