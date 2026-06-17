import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { updateBranchSettings } from '@/lib/db/admin-queries';

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdminToken(request);
    const { id: targetBranchId } = await params;
    const { status, capacity } = await request.json();

    const updated = await updateBranchSettings(
      admin.role,
      admin.branchId,
      targetBranchId,
      { status, capacity }
    );

    return NextResponse.json({ success: true, branch: updated }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error updating branch settings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error occurred' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}
