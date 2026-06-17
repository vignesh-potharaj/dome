import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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
    const { username, password, role, branchId } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Missing email (username) or password' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check if user already exists
    const existing = await db.select().from(admins).where(eq(admins.email, username)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Admin with this email already exists' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Hash the password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new admin user
    const [newUser] = await db.insert(admins).values({
      email: username,
      passwordHash,
      role: role || 'branch_admin',
      branchId: branchId || null,
    }).returning();

    return NextResponse.json(
      {
        message: 'Admin registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          branchId: newUser.branchId,
        },
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
