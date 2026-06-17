import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Missing username or password' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Query admin by email (username represents email in the admin portal)
    const result = await db.select().from(admins).where(eq(admins.email, username)).limit(1);
    if (result.length === 0) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const admin = result[0];

    // Compare password with bcrypt hash
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Generate JWT token containing roles and branch isolation context
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        branchId: admin.branchId,
      },
      process.env.JWT_SECRET || 'fallback-secret-key-2026',
      { expiresIn: '24h' }
    );

    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          branchId: admin.branchId,
        },
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
