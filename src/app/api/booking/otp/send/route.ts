import { NextResponse } from 'next/server';
import { POST as sendHandler } from '@/app/api/otp/send/route';

export async function POST(request: Request) {
  return sendHandler(request);
}
