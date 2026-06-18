import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql, eq } from 'drizzle-orm';
import { otpSessions } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.transaction(async (tx) => {
      // Bypass RLS
      await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);

      // Delete existing OTP sessions for this phone to prevent database bloat
      await tx.delete(otpSessions).where(eq(otpSessions.phone, phone));

      // Insert new session
      await tx.insert(otpSessions).values({
        phone,
        code,
        expiresAt,
      });
    });

    // Log code in server console for development and local testing
    console.log(`[OTP] Generated verification code for ${phone}: ${code}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
