import bcrypt from 'bcryptjs';
import { db } from '../db';
import { admins } from '../../../../src/lib/db/schema';
import { eq } from 'drizzle-orm';

export class UserService {
    async authenticate(email: string, password: string) {
        // Query admin by email
        const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
        if (result.length === 0) {
            return null;
        }

        const admin = result[0];
        
        // Compare bcrypt password hash
        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
            return null;
        }

        // Return sanitized admin details
        return {
            id: admin.id,
            email: admin.email,
            role: admin.role,
            branchId: admin.branchId,
            createdAt: admin.createdAt,
        };
    }

    async getAdminByEmail(email: string) {
        const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
        return result[0] || null;
    }

    async createAdmin(email: string, passwordHash: string, role: string, branchId: string | null) {
        const result = await db.insert(admins).values({
            email,
            passwordHash,
            role,
            branchId,
        }).returning();
        return result[0];
    }
}