import { eq, and, sql, desc, inArray } from 'drizzle-orm';
import { db } from './index';
import { bookings, bookingLogs, blockedDates, branches, customers, communicationLogs } from './schema';
import { generateBookingId, checkSlotAvailability } from './booking-queries';

// Helper to set RLS session variables inside a transaction block
async function setRlsContext(tx: any, role: string, branchId: string | null) {
  if (role === 'super_admin') {
    await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);
  } else if (branchId) {
    await tx.execute(sql`SELECT set_config('app.current_role', 'branch_admin', true)`);
    await tx.execute(sql`SELECT set_config('app.current_branch_id', ${branchId}, true)`);
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
    
    // Validate slot availability if rescheduling (date or slot changes) or activating from cancelled
    const currentDateStr = (current.date as any) instanceof Date
      ? (current.date as any).toISOString().split('T')[0]
      : String(current.date).split('T')[0];

    const isActiveStatus = (status: string) => ['confirmed', 'pending_payment', 'rescheduled'].includes(status);

    const isRescheduling =
      (updates.date !== undefined && updates.date !== currentDateStr) ||
      (updates.slot !== undefined && updates.slot !== current.slot);

    const isActivating =
      updates.status !== undefined &&
      isActiveStatus(updates.status) &&
      current.status === 'cancelled';

    if (isRescheduling || isActivating) {
      const targetDate = updates.date !== undefined ? updates.date : currentDateStr;
      const targetSlot = updates.slot !== undefined ? updates.slot : current.slot;
      const availability = await checkSlotAvailability(tx, current.branchId, targetDate, targetSlot);
      if (!availability.available) {
        throw new Error(`Cannot reschedule: ${availability.reason || 'Slot is unavailable'}`);
      }
    }

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

// 7. Get Customers list with booking counts and spend metrics
export async function getCustomersWithMetrics(role: string, branchId: string | null) {
  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);

    // Aggregates bookings per customer under RLS constraints
    const list = await tx.select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      occasions: customers.occasions,
      marketingConsent: customers.marketingConsent,
      createdAt: customers.createdAt,
      bookingsCount: sql<number>`count(${bookings.id})::int`,
      totalSpend: sql<number>`coalesce(sum(case when ${bookings.status} in ('confirmed', 'rescheduled') then ${bookings.totalPrice} else 0 end), 0)::int`,
      lastVisitedBranch: sql<string | null>`(
        select branch_id from bookings 
        where customer_id = customers.id and status = 'confirmed' 
        order by date desc, created_at desc limit 1
      )`
    })
    .from(customers)
    .leftJoin(bookings, eq(bookings.customerId, customers.id))
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt));

    return list;
  });
}

// 8. Bulk send manual campaign template logging (with DPDP consent checks)
export async function bulkSendCrmCampaign(
  adminId: string,
  role: string,
  branchId: string | null,
  payload: {
    customerIds: string[];
    templateId: string;
    templateBody: string;
  }
) {
  if (payload.customerIds.length === 0) {
    return { success: true, count: 0 };
  }

  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);

    // Retrieve requested customers who explicitly consented to marketing messages
    const targets = await tx.select()
      .from(customers)
      .where(
        and(
          inArray(customers.id, payload.customerIds),
          eq(customers.marketingConsent, true)
        )
      );

    const logEntries = [];
    const campaignType = payload.templateId.includes('birthday') ? 'crm_birthday' : 'crm_anniversary';

    for (const customer of targets) {
      const [log] = await tx.insert(communicationLogs)
        .values({
          customerId: customer.id,
          type: campaignType,
          channel: 'whatsapp',
          recipient: customer.phone,
          status: 'sent',
          createdAt: new Date(),
        })
        .returning();

      logEntries.push(log);
      console.log(`[WhatsApp API Simulator] Sent template '${payload.templateId}' to '${customer.name}' (${customer.phone})`);
    }

    return { success: true, count: targets.length, logs: logEntries };
  });
}

// 9. Cron trigger: fetch customer occasions 7 days out and send automated reminders
export async function cronTriggerCrmReminders() {
  return await db.transaction(async (tx) => {
    // Run as super-admin globally (bypasses RLS filters)
    await tx.execute(sql`SELECT set_config('app.current_role', 'super_admin', true)`);

    // Target day calculation (today + 7 days)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
    const targetDay = String(targetDate.getDate()).padStart(2, '0');
    const targetMonthDay = `${targetMonth}-${targetDay}`;

    // Get all consented customers
    const candidates = await tx.select()
      .from(customers)
      .where(eq(customers.marketingConsent, true));

    const matches: { customer: typeof customers.$inferSelect; type: string }[] = [];

    // Filter candidates for matching month-day birthday or anniversary dates
    for (const c of candidates) {
      const occasions = c.occasions as Record<string, string> || {};
      for (const [type, dateStr] of Object.entries(occasions)) {
        if (dateStr && dateStr.length >= 10 && dateStr.substring(5, 10) === targetMonthDay) {
          matches.push({ customer: c, type });
        }
      }
    }

    const logEntries = [];

    for (const match of matches) {
      const c = match.customer;
      const campaignType = match.type === 'birthday' ? 'crm_birthday' : 'crm_anniversary';

      const [log] = await tx.insert(communicationLogs)
        .values({
          customerId: c.id,
          type: campaignType,
          channel: 'whatsapp',
          recipient: c.phone,
          status: 'sent',
          createdAt: new Date(),
        })
        .returning();

      logEntries.push(log);
      console.log(`[Cron CRM Dispatcher] Sent automated 7-day ${match.type} reminder to '${c.name}' (${c.phone})`);
    }

    return { success: true, processedCount: matches.length, logs: logEntries };
  });
}

// 9. Block a Specific Time Slot (by creating a placeholder block booking)
export async function blockSlot(
  adminId: string,
  role: string,
  branchId: string | null,
  dateStr: string,
  slot: string,
  reason: string
) {
  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);

    // If branch admin, force the branch_id to be their own branch
    const targetBranch = role === 'super_admin' ? (branchId || 'kokapet') : (branchId as string);

    // Find or create 'Admin Block' customer
    let customer = await tx.query.customers.findFirst({
      where: (customers: any, { eq }: any) => eq(customers.phone, '0000000000')
    });

    if (!customer) {
      const [inserted] = await tx.insert(customers)
        .values({
          name: 'Admin Block',
          phone: '0000000000',
          marketingConsent: false
        })
        .returning();
      customer = inserted;
    }

    const bookingId = generateBookingId(targetBranch);
    const [blocked] = await tx.insert(bookings)
      .values({
        id: bookingId,
        branchId: targetBranch,
        customerId: customer.id,
        date: dateStr,
        slot,
        packageName: 'Block',
        balloonColor: null,
        cakeOption: null,
        sparklers: false,
        ledName: null,
        messageOnCake: reason || 'Blocked by Admin',
        addOns: [],
        celebrantName: null,
        specialNote: null,
        guestCount: 0,
        status: 'confirmed',
        totalPrice: 0,
        advancePaid: 0,
      })
      .returning();

    // Log the action
    await tx.insert(bookingLogs)
      .values({
        bookingId: blocked.id,
        adminId,
        action: 'slot_blocked',
        details: { date: dateStr, slot, reason }
      });

    return blocked;
  });
}

// 10. Unblock a Specific Time Slot (by deleting the placeholder block booking)
export async function unblockSlot(
  role: string,
  branchId: string | null,
  bookingId: string
) {
  return await db.transaction(async (tx) => {
    await setRlsContext(tx, role, branchId);

    // Verify booking is indeed a Block booking
    const existing = await tx.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (existing.length === 0) {
      throw new Error(`Booking record ${bookingId} not found or access denied.`);
    }

    if (existing[0].packageName !== 'Block') {
      throw new Error('Only Admin Block bookings can be deleted using unblock.');
    }

    await tx.delete(bookings).where(eq(bookings.id, bookingId));
    return { success: true };
  });
}

