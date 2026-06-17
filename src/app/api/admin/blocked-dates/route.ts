import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { getBlockedDates, blockDate } from '@/lib/db/admin-queries';

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

export async function GET(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    const list = await getBlockedDates(admin.role, admin.branchId);

    return NextResponse.json({ success: true, blockedDates: list }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error fetching blocked dates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    const { date, reason } = await request.json();

    if (!date) {
      return NextResponse.json({ success: false, error: 'Missing date field' }, { status: 400, headers: corsHeaders() });
    }

    const blocked = await blockDate(admin.adminId, admin.role, admin.branchId, date, reason);

    return NextResponse.json({ success: true, blockedDate: blocked }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error blocking date:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}
