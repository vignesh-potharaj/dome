import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql, eq, and, gt } from 'drizzle-orm';
import { otpSessions, customers } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone number and verification code are required' }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      // Bypass RLS
      await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);

      // Find an unverified, unexpired session for this phone and code
      const sessions = await tx.select()
        .from(otpSessions)
        .where(
          and(
            eq(otpSessions.phone, phone),
            eq(otpSessions.code, code),
            eq(otpSessions.verified, false),
            gt(otpSessions.expiresAt, new Date())
          )
        )
        .limit(1);

      if (sessions.length === 0) {
        return { success: false, error: 'Invalid or expired verification code' };
      }

      const session = sessions[0];

      // Mark the OTP session as verified
      await tx.update(otpSessions)
        .set({ verified: true })
        .where(eq(otpSessions.id, session.id));

      // Retrieve customer profile if they exist in the DB
      const existingCustomers = await tx.select()
        .from(customers)
        .where(eq(customers.phone, phone))
        .limit(1);

      if (existingCustomers.length > 0) {
        const customer = existingCustomers[0];
        return {
          success: true,
          customer: {
            name: customer.name,
            email: customer.email,
            occasions: customer.occasions,
          }
        };
      }

      return {
        success: true,
        customer: null
      };
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
