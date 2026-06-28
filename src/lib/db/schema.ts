import { pgTable, varchar, integer, boolean, timestamp, date, jsonb, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Branches Table
export const branches = pgTable('branches', {
  id: varchar('id', { length: 50 }).primaryKey(), // e.g. 'kokapet', 'sainikpuri'
  name: varchar('name', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'disabled'
  capacity: integer('capacity').default(6).notNull(), // capacity per slot
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customers Table
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).unique().notNull(), // WhatsApp number
  email: varchar('email', { length: 100 }),
  occasions: jsonb('occasions').default({}).notNull(), // stores occasion dates: { birthday: '1995-06-15', anniversary: '2020-11-20' }
  marketingConsent: boolean('marketing_consent').default(true).notNull(), // Default opt-in; customers can opt out
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings Table
export const bookings = pgTable('bookings', {
  id: varchar('id', { length: 50 }).primaryKey(), // e.g. 'DC-K1J3H4'
  branchId: varchar('branch_id', { length: 50 }).references(() => branches.id).notNull(),
  customerId: uuid('customer_id').references(() => customers.id),
  date: date('date').notNull(),
  slot: varchar('slot', { length: 50 }).notNull(), // e.g. '12:00 PM - 02:00 PM'
  packageName: varchar('package_name', { length: 50 }), // 'classic', 'premium', 'grand'
  balloonColor: varchar('balloon_color', { length: 50 }),
  cakeOption: varchar('cake_option', { length: 100 }), // flavor/dietary option or 'none'
  sparklers: boolean('sparklers').default(false).notNull(),
  ledName: varchar('led_name', { length: 100 }),
  messageOnCake: varchar('message_on_cake', { length: 255 }),
  addOns: jsonb('add_ons').default([]).notNull(), // array of addon ids: ['photography', 'banner']
  celebrantName: varchar('celebrant_name', { length: 100 }),
  specialNote: varchar('special_note', { length: 500 }),
  guestCount: integer('guest_count').default(2),
  status: varchar('status', { length: 50 }).default('pending_payment').notNull(), // 'temporary_hold', 'pending_payment', 'confirmed', 'cancelled', 'rescheduled'
  totalPrice: integer('total_price').default(0),
  advancePaid: integer('advance_paid').default(0),
  razorpayOrderId: varchar('razorpay_order_id', { length: 100 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
  internalNotes: varchar('internal_notes', { length: 1000 }),
  balancePaid: boolean('balance_paid').default(false).notNull(),
  holdExpiresAt: timestamp('hold_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// OTP Sessions Table (for login/verification)
export const otpSessions = pgTable('otp_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(), // 6-digit OTP code
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admins Table
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'super_admin', 'branch_admin'
  branchId: varchar('branch_id', { length: 50 }).references(() => branches.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Blocked Dates Table (For Private Events & Closures)
export const blockedDates = pgTable('blocked_dates', {
  id: uuid('id').primaryKey().defaultRandom(),
  branchId: varchar('branch_id', { length: 50 }).references(() => branches.id).notNull(),
  date: date('date').notNull(),
  reason: varchar('reason', { length: 255 }), // e.g. 'Private Event', 'Maintenance'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Communication Logs Table (For WhatsApp & SMS Tracking)
export const communicationLogs = pgTable('communication_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id),
  bookingId: varchar('booking_id', { length: 50 }).references(() => bookings.id),
  type: varchar('type', { length: 50 }).notNull(), // 'otp', 'booking_confirmation', 'crm_anniversary', 'crm_birthday'
  channel: varchar('channel', { length: 20 }).notNull(), // 'whatsapp', 'sms'
  recipient: varchar('recipient', { length: 20 }).notNull(), // phone number
  status: varchar('status', { length: 20 }).default('sent').notNull(), // 'sent', 'delivered', 'read', 'failed'
  errorMessage: varchar('error_message', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Booking Logs Table (For Timestamped Modifications / History)
export const bookingLogs = pgTable('booking_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: varchar('booking_id', { length: 50 }).references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  adminId: uuid('admin_id').references(() => admins.id), // Nullable if triggered by customer action
  action: varchar('action', { length: 100 }).notNull(), // e.g. 'created', 'status_changed', 'rescheduled', 'cake_updated', etc.
  details: jsonb('details').default({}).notNull(), // stores details of change: { oldDate: '2026-06-12', newDate: '2026-06-15' }
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relationships
export const branchesRelations = relations(branches, ({ many }) => ({
  bookings: many(bookings),
  admins: many(admins),
  blockedDates: many(blockedDates),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
  communicationLogs: many(communicationLogs),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  branch: one(branches, {
    fields: [bookings.branchId],
    references: [branches.id],
  }),
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
  communicationLogs: many(communicationLogs),
  logs: many(bookingLogs),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  branch: one(branches, {
    fields: [admins.branchId],
    references: [branches.id],
  }),
}));

export const blockedDatesRelations = relations(blockedDates, ({ one }) => ({
  branch: one(branches, {
    fields: [blockedDates.branchId],
    references: [branches.id],
  }),
}));

export const communicationLogsRelations = relations(communicationLogs, ({ one }) => ({
  customer: one(customers, {
    fields: [communicationLogs.customerId],
    references: [customers.id],
  }),
  booking: one(bookings, {
    fields: [communicationLogs.bookingId],
    references: [bookings.id],
  }),
}));

export const bookingLogsRelations = relations(bookingLogs, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingLogs.bookingId],
    references: [bookings.id],
  }),
  admin: one(admins, {
    fields: [bookingLogs.adminId],
    references: [admins.id],
  }),
}));
