import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { getCustomersWithMetrics } from '@/lib/db/admin-queries';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    const list = await getCustomersWithMetrics(admin.role, admin.branchId);

    return NextResponse.json({ success: true, customers: list }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error fetching CRM customers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}
