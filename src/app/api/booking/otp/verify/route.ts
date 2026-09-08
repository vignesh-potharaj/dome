import { NextResponse } from 'next/server';
import { validateOtp } from '@/lib/message-central';
import { db } from '@/lib/db';
import { sql, eq } from 'drizzle-orm';
import { customers } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const { verificationId, code, phone } = await request.json();

    if (!verificationId || !code) {
      return NextResponse.json(
        { success: false, error: 'Verification session identifier and verification code are required' },
        { status: 400 }
      );
    }

    const validation = await validateOtp(verificationId, code);

    if (!validation.verified) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: validation.error || 'Invalid or expired verification code',
          code: validation.code,
        },
        { status: 400 }
      );
    }

    let customerProfile = null;
    if (phone) {
      try {
        const result = await db.transaction(async (tx) => {
          await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);
          const existingCustomers = await tx
            .select()
            .from(customers)
            .where(eq(customers.phone, phone))
            .limit(1);

          return existingCustomers[0] || null;
        });

        if (result) {
          customerProfile = {
            name: result.name,
            email: result.email,
            occasions: result.occasions,
          };
        }
      } catch (dbErr) {
        console.warn('Could not query customer profile during OTP verify:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      customer: customerProfile,
    });
  } catch (error: any) {
    console.error('Error verifying OTP in booking route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
