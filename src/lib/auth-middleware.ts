import jwt from 'jsonwebtoken';

export interface AdminPayload {
  adminId: string;
  email: string;
  role: 'super_admin' | 'branch_admin';
  branchId: string | null;
}

export function verifyAdminToken(request: Request): AdminPayload {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Authorization header is missing');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    throw new Error('Invalid authorization header format (use Bearer <token>)');
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-2026';

  try {
    const decoded = jwt.verify(token, secret) as AdminPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired authentication token');
  }
}
