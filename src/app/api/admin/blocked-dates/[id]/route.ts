import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { unblockDate } from '@/lib/db/admin-queries';

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdminToken(request);
    const { id: blockedDateId } = await params;

    const result = await unblockDate(admin.role, admin.branchId, blockedDateId);

    return NextResponse.json(result, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error unblocking date:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error occurred' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}
