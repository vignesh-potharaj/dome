import { NextResponse } from 'next/server';
import { sendOtp } from '@/lib/message-central';
import { otpRateLimiter } from '@/lib/otp-rate-limiter';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const phone = body?.phone;

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    // Check rate limit per phone number
    const rateCheck = otpRateLimiter.check(phone);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateCheck.reason || 'Too many requests. Please wait before trying again.',
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    // Call Message Central VerifyNow
    const result = await sendOtp(phone);

    if (!result.success) {
      const statusCode = result.code === 'INVALID_PHONE_NUMBER' ? 400 : 502;
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send verification code.',
          code: result.code,
        },
        { status: statusCode }
      );
    }

    // Record rate limit send event
    otpRateLimiter.record(phone);

    // Return ONLY the verification session identifier to client
    return NextResponse.json({
      success: true,
      verificationId: result.verificationId,
      cooldownSeconds: 45,
      timeoutSeconds: result.timeoutSeconds || 60,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/otp/send:', error?.message || error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
