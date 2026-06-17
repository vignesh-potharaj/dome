import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { getAdminBookings } from '@/lib/db/admin-queries';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Or restrict to the admin portal origin
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  try {
    // 1. Verify authentication
    const admin = verifyAdminToken(request);

    // 2. Fetch filtered bookings under RLS
    const list = await getAdminBookings(admin.role, admin.branchId);

    return NextResponse.json({ success: true, bookings: list }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}
