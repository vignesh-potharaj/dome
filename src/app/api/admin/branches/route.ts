import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { getAdminBranches, bulkToggleBranchBookings } from '@/lib/db/admin-queries';

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

// GET all branches for the admin dashboard
export async function GET(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    const branches = await getAdminBranches(admin.role, admin.branchId);

    return NextResponse.json({ success: true, branches }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error fetching admin branches:', error);
    const isAuth = error.message?.includes('token') || error.message?.includes('header');
    const status = isAuth ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error occurred' },
      { status, headers: corsHeaders() }
    );
  }
}

// PATCH to bulk-toggle online booking intake for all branches (Super Admin only)
export async function PATCH(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    
    if (admin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only super admins can update all branches simultaneously.' },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { allowOnlineBookings } = await request.json();
    if (typeof allowOnlineBookings !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: allowOnlineBookings boolean is required.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const updated = await bulkToggleBranchBookings(admin.role, allowOnlineBookings);

    return NextResponse.json({ success: true, branches: updated }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error bulk updating branches:', error);
    const isAuth = error.message?.includes('token') || error.message?.includes('header');
    const isForbidden = error.message?.includes('Unauthorized');
    const status = isAuth ? 401 : isForbidden ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Error occurred' },
      { status, headers: corsHeaders() }
    );
  }
}
