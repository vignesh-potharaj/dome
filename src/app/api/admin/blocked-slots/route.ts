import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { blockSlot } from '@/lib/db/admin-queries';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    const { date, slot, reason } = await request.json();

    if (!date || !slot) {
      return NextResponse.json(
        { success: false, error: 'Missing date or slot field' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const blocked = await blockSlot(
      admin.adminId,
      admin.role,
      admin.branchId,
      date,
      slot,
      reason
    );

    return NextResponse.json({ success: true, blockedSlot: blocked }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error blocking slot:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}
