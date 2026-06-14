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
  marketingConsent: boolean('marketing_consent').default(false).notNull(), // DPDP Act compliance flag
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookings Table
export const bookings = pgTable('bookings', {
  id: varchar('id', { length: 50 }).primaryKey(), // e.g. 'DC-K1J3H4'
  branchId: varchar('branch_id', { length: 50 }).references(() => branches.id).notNull(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  date: date('date').notNull(),
  slot: varchar('slot', { length: 50 }).notNull(), // e.g. '12:00 PM - 02:00 PM'
  packageName: varchar('package_name', { length: 50 }).notNull(), // 'classic', 'premium', 'grand'
  balloonColor: varchar('balloon_color', { length: 50 }),
  cakeOption: varchar('cake_option', { length: 100 }), // flavor/dietary option or 'none'
  sparklers: boolean('sparklers').default(false).notNull(),
  addOns: jsonb('add_ons').default([]).notNull(), // array of addon ids: ['photography', 'banner']
  celebrantName: varchar('celebrant_name', { length: 100 }),
  specialNote: varchar('special_note', { length: 500 }),
  guestCount: integer('guest_count').notNull(),
  status: varchar('status', { length: 50 }).default('pending_payment').notNull(), // 'pending_payment', 'confirmed', 'cancelled', 'rescheduled'
  totalPrice: integer('total_price').notNull(),
  advancePaid: integer('advance_paid').notNull(),
  razorpayOrderId: varchar('razorpay_order_id', { length: 100 }),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
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

// Relationships
export const branchesRelations = relations(branches, ({ many }) => ({
  bookings: many(bookings),
  admins: many(admins),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  branch: one(branches, {
    fields: [bookings.branchId],
    references: [branches.id],
  }),
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  branch: one(branches, {
    fields: [admins.branchId],
    references: [branches.id],
  }),
}));
