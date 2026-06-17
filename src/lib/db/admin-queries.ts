import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from './index';
import { bookings, bookingLogs, blockedDates, branches, customers } from './schema';

// Helper to set RLS session variables inside a transaction block
async function setRlsContext(tx: any, role: string, branchId: string | null) {
  if (role === 'super_admin') {
    await tx.execute(sql`SET LOCAL app.current_role = 'super_admin'`);
  } else if (branchId) {
    await tx.execute(sql`SET LOCAL app.current_role = 'branch_admin'`);
    await tx.execute(sql`SET LOCAL app.current_branch_id = ${branchId}`);
  } else {
    throw new Error('Unauthorized: No valid role or branch scope provided.');
  }
}

// 1. Get RLS-filtered Bookings for Admin Dashboard
export async function getAdminBookings(role: string, branchId: string | null) {
  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);

    // Queries bookings joined with customer profile and modification logs
    const results = await tx.query.bookings.findMany({
      with: {
        customer: true,
        logs: {
          orderBy: [desc(bookingLogs.createdAt)]
        }
      },
      orderBy: [desc(bookings.date), desc(bookings.createdAt)]
    });

    return results;
  });
}

// 2. Update Booking with automated audit trail logging
export async function updateBookingByAdmin(
  adminId: string,
  role: string,
  branchId: string | null,
  bookingId: string,
  updates: {
    date?: string;
    slot?: string;
    packageName?: string;
    balloonColor?: string | null;
    cakeOption?: string | null;
    sparklers?: boolean;
    ledName?: string | null;
    messageOnCake?: string | null;
    guestCount?: number;
    status?: 'pending_payment' | 'confirmed' | 'cancelled' | 'rescheduled';
    internalNotes?: string | null;
    balancePaid?: boolean;
  }
) {
  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);

    // Fetch existing booking to calculate diff
    const existingList = await tx.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (existingList.length === 0) {
      throw new Error(`Booking ${bookingId} not found or access denied.`);
    }

    const current = existingList[0];
    const diff: Record<string, { old: any; new: any }> = {};
    const setValues: Record<string, any> = {};

    // Compare fields and compute differences
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key as keyof typeof current;
      if (value !== undefined && current[dbKey] !== value) {
        diff[key] = { old: current[dbKey], new: value };
        setValues[dbKey] = value;
      }
    }

    if (Object.keys(setValues).length === 0) {
      return current; // No changes
    }

    // Apply the update
    const [updated] = await tx.update(bookings)
      .set(setValues)
      .where(eq(bookings.id, bookingId))
      .returning();

    // Determine the type of action to log
    let action = 'modified';
    if (setValues.status && diff.status) {
      action = 'status_changed';
    } else if (setValues.date || setValues.slot) {
      action = 'rescheduled';
    } else if (setValues.cakeOption || setValues.messageOnCake) {
      action = 'cake_updated';
    } else if (setValues.balloonColor) {
      action = 'palette_updated';
    } else if (setValues.balancePaid !== undefined) {
      action = 'balance_paid_updated';
    }

    // Insert audit log
    await tx.insert(bookingLogs)
      .values({
        bookingId,
        adminId,
        action,
        details: {
          changes: diff,
          updatedFields: Object.keys(setValues)
        }
      });

    return updated;
  });
}

// 3. Get Blocked Dates
export async function getBlockedDates(role: string, branchId: string | null) {
  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);
    return await tx.select().from(blockedDates).orderBy(desc(blockedDates.date));
  });
}

// 4. Block a Date
export async function blockDate(
  adminId: string,
  role: string,
  branchId: string | null,
  dateStr: string,
  reason: string
) {
  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);

    // If branch admin, force the branch_id to be their own branch
    const targetBranch = role === 'super_admin' ? (branchId || 'kokapet') : (branchId as string);

    const [blocked] = await tx.insert(blockedDates)
      .values({
        branchId: targetBranch,
        date: dateStr,
        reason: reason || 'Blocked',
      })
      .returning();

    return blocked;
  });
}

// 5. Unblock a Date
export async function unblockDate(
  role: string,
  branchId: string | null,
  blockedDateId: string
) {
  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);

    // Verify ownership or role
    const existing = await tx.select().from(blockedDates).where(eq(blockedDates.id, blockedDateId)).limit(1);
    if (existing.length === 0) {
      throw new Error(`Blocked date record ${blockedDateId} not found or access denied.`);
    }

    await tx.delete(blockedDates).where(eq(blockedDates.id, blockedDateId));
    return { success: true };
  });
}

// 6. Update Branch Settings
export async function updateBranchSettings(
  role: string,
  branchId: string | null,
  targetBranchId: string,
  updates: {
    status?: 'active' | 'disabled';
    capacity?: number;
  }
) {
  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);

    // Check if authorized (branch admin can only modify their own branch)
    if (role === 'branch_admin' && branchId !== targetBranchId) {
      throw new Error('Unauthorized: Cannot modify settings for other branch.');
    }

    const [updated] = await tx.update(branches)
      .set(updates)
      .where(eq(branches.id, targetBranchId))
      .returning();

    return updated;
  });
}
