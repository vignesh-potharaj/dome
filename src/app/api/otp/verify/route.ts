import { NextResponse } from 'next/server';
import { validateOtp } from '@/lib/message-central';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const verificationId = body?.verificationId;
    const code = body?.code;

    if (!verificationId || typeof verificationId !== 'string') {
      return NextResponse.json(
        { verified: false, error: 'Verification session identifier is required.', code: 'MISSING_VERIFICATION_ID' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { verified: false, error: 'Verification code is required.', code: 'MISSING_CODE' },
        { status: 400 }
      );
    }

    // Call Message Central Validate endpoint
    const result = await validateOtp(verificationId, code);

    if (result.verified) {
      return NextResponse.json({
        verified: true,
      });
    }

    // Surface distinct error states
    const statusCode = result.code === 'PROVIDER_ERROR' ? 502 : 400;
    return NextResponse.json(
      {
        verified: false,
        error: result.error || 'Verification failed. Please check the code and try again.',
        code: result.code || 'VERIFICATION_FAILED',
      },
      { status: statusCode }
    );
  } catch (error: any) {
    console.error('Unexpected error in /api/otp/verify:', error?.message || error);
    return NextResponse.json(
      { verified: false, error: 'An unexpected server error occurred. Please try again.', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
