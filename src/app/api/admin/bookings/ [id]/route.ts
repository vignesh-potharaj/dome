import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { updateBookingByAdmin } from '@/lib/db/admin-queries';

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
    // 1. Verify token
    const admin = verifyAdminToken(request);

    // 2. Await dynamic parameters (Next.js v15+ rule)
    const { id: bookingId } = await params;

    // 3. Extract request body updates
    const updates = await request.json();

    // 4. Update booking via RLS context query
    const updatedBooking = await updateBookingByAdmin(
      admin.adminId,
      admin.role,
      admin.branchId,
      bookingId,
      updates
    );

    return NextResponse.json({ success: true, booking: updatedBooking }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error(`Error updating booking:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error occurred' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}
