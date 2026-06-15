import { pgTable, varchar, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

// Branches Table (referenced as foreign key)
export const branches = pgTable('branches', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  capacity: integer('capacity').default(6).notNull(),
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
