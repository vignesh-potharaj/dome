import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth-middleware';
import { bulkSendCrmCampaign } from '@/lib/db/admin-queries';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const admin = verifyAdminToken(request);
    const payload = await request.json();

    if (!payload.customerIds || !payload.templateId || !payload.templateBody) {
      return NextResponse.json({ success: false, error: 'Missing required payload parameters' }, { status: 400, headers: corsHeaders() });
    }

    const result = await bulkSendCrmCampaign(admin.adminId, admin.role, admin.branchId, payload);

    return NextResponse.json(result, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('Error sending CRM bulk campaign:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: error.message?.includes('token') || error.message?.includes('header') ? 401 : 500, headers: corsHeaders() }
    );
  }
}
