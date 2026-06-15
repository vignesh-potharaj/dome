# Dome Cafe — Unified Database & Architecture Guide
### A Junior Developer's Guide to PostgreSQL, Drizzle ORM, & Row-Level Security (RLS)

Welcome to the database setup documentation for the Dome Cafe Digital Management System! This guide consolidates everything you need to know about our database structure, connection rules, security policies, and how to execute schema modifications.

---

## 🎯 Section 1: The Core Database Concepts

Before diving into code, let's understand the tools we use and why we use them.

### 1. PostgreSQL (Postgres)
We use **PostgreSQL** as our relational database engine. It acts as our single source of truth for customers, bookings, payments, and admin accounts.
- **Relational**: Data is stored in tables with columns (types) and rows (records), and tables reference each other using **Foreign Keys** (e.g., a Booking has a `customer_id` referencing a Customer).
- **Multi-Tenant**: We store data for both Kokapet and Sainikpuri branches in a **single unified database**, using security rules to separate them.

### 2. Drizzle ORM (Object-Relational Mapping)
Instead of writing raw SQL commands (like `SELECT * FROM bookings`), we use **Drizzle ORM** in our TypeScript code.
- **Why?**: It gives us full type-safety. If you rename a column, TypeScript will show compiler errors everywhere that column is used in the app.
- **Schema Definition**: Our tables are defined in TypeScript inside [schema.ts](file:///c:/projects/dome/src/lib/db/schema.ts).
- **Migrations**: When we modify `schema.ts`, Drizzle Kit compares the TypeScript definitions with the database and automatically generates the `.sql` migration files.

---

## 🔌 Section 2: Database Connection Strategy

We connect to PostgreSQL using **two different methods** depending on the environment. Postgres has connection limits, so we split our connections to prevent crashes.

```
                  ┌─────────────────────────────────────┐
                  │      Vercel Serverless Hosting      │
                  │  (Next.js App & Admin UI Frontend)  │
                  └──────────────────┬──────────────────┘
                                     │
                             Queries (Port 6543)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     Transaction Pooler (PgBouncer)  │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
   ┌─────────────────────────────────┴─────────────────────────────────┐
   │                  Supabase PostgreSQL Cloud Database                │
   └─────────────────────────────────┬─────────────────────────────────┘
                                     ▲
                             Direct (Port 5432)
                                     │
                  ┌──────────────────┴──────────────────┐
                  │       VM / Persistent Container     │
                  │  (Express.js Auth Service & Seeds)  │
                  └─────────────────────────────────────┘
```

### 1. The Transaction Pooler (Port 6543)
- **Used by**: The Next.js frontend apps (Customer website and Admin UI).
- **Why**: Next.js runs in serverless functions that spin up and down instantly. If every serverless function established a direct socket connection, the database would quickly run out of available connection slots. The pooler sits in between, letting hundreds of serverless tasks share a few real database connections.
- **Limitation**: Session-level SQL commands (like `SET timezone`) are **not allowed** through the pooler, because connections are shared dynamically.

### 2. The Direct Connection (Port 5432)
- **Used by**: The Express `auth-service` and database migration commands (like Drizzle Kit).
- **Why**: The Express server is a long-running program that starts once and stays alive 24/7. It can safely manage its own small pool (e.g., 5-10 persistent connections). Drizzle migrations also need direct connections to lock tables during schema updates.

---

## 🔒 Section 3: Row-Level Security (RLS) & Multi-Tenancy

Our system is multi-tenant: branch admins from Kokapet and Sainikpuri share the same database tables. To ensure Kokapet admins **never** see Sainikpuri bookings, we use PostgreSQL **Row-Level Security (RLS)**.

### How RLS Works:
RLS blocks queries at the database engine level. If RLS is enabled, you cannot query rows unless you meet the policy requirements.
We use **Session-Variable RLS** (Option B), which allows us to keep our database portable across any cloud host.

1. The Express backend validates a user's JWT.
2. Inside a database transaction block, the backend sets a temporary parameter:
   ```sql
   SET LOCAL app.current_branch_id = 'kokapet';
   ```
3. When you run a query (e.g., `SELECT * FROM bookings`), Postgres automatically inserts a filter:
   ```sql
   -- Postgres executes this under the hood:
   SELECT * FROM bookings WHERE branch_id = 'kokapet';
   ```
4. The moment the transaction commits or rolls back, the session parameter is cleared.

### Super-Admin Bypass:
Super Admins need to see everything. If the backend sets `app.current_role = 'super_admin'`, the database ignores branch filters and returns all records.

### Configured Table Security Policies:

| Table | RLS Status | Restriction / Filtering Rule |
|---|---|---|
| **`bookings`** | Enforced | Must match `branch_id` OR run as `super_admin`. |
| **`blocked_dates`** | Enforced | Must match `branch_id` OR run as `super_admin`. |
| **`admins`** | Enforced | Admins can only see other admin accounts assigned to their own branch. |
| **`booking_logs`** | Enforced | Scoped through the associated booking: can only view logs if the booking belongs to their branch. |
| **`customers`** | Enforced | Scoped through bookings: can only view customer info if that customer has made a booking at their branch. |
| **`communication_logs`**| Enforced | Scoped through the associated booking: can only view message logs if the booking belongs to their branch. |

---

## 📐 Section 4: Database Schema Reference

The tables and their purposes are outlined below:

### 1. `branches`
Stores cafe locations (e.g., `'kokapet'`, `'sainikpuri'`).
- `id` (Primary Key, varchar) - e.g. `'kokapet'`
- `name` (varchar) - e.g. `'Kokapet Branch'`
- `status` (varchar) - `'active'` or `'disabled'`
- `capacity` (integer) - maximum slots
- `createdAt` (timestamp)

### 2. `admins`
Stores portal users and password hashes.
- `id` (Primary Key, uuid)
- `email` (varchar) - email address (used for login)
- `passwordHash` (varchar) - bcrypt hash of password
- `role` (varchar) - `'super_admin'` or `'branch_admin'`
- `branchId` (varchar, Nullable) - references `branches.id`

### 3. `customers`
Stores customer profile records.
- `id` (Primary Key, uuid)
- `name` (varchar)
- `phone` (varchar) - unique WhatsApp number
- `email` (varchar, Nullable)
- `occasions` (jsonb) - e.g. `{ "birthday": "1995-06-15", "anniversary": "2020-11-20" }`
- `marketingConsent` (boolean) - DPDP Act consent flag

### 4. `bookings`
Core booking transactions.
- `id` (Primary Key, varchar) - booking ID (e.g., `'DC-K1J3H4'`)
- `branchId` (varchar) - references `branches.id`
- `customerId` (uuid) - references `customers.id`
- `date` (date)
- `slot` (varchar) - slot time (e.g., `'5:00 PM – 6:30 PM'`)
- `packageName` (varchar)
- `balloonColor` (varchar, Nullable)
- `cakeOption` (varchar, Nullable)
- `sparklers` (boolean)
- `ledName` (varchar, Nullable)
- `messageOnCake` (varchar, Nullable)
- `addOns` (jsonb) - array of addon IDs
- `celebrantName` (varchar, Nullable)
- `specialNote` (varchar, Nullable)
- `guestCount` (integer)
- `status` (varchar) - `'pending_payment'`, `'confirmed'`, `'cancelled'`, `'rescheduled'`
- `totalPrice` (integer) - total price in rupees
- `advancePaid` (integer) - 50% advance paid online
- `balancePaid` (boolean) - whether remaining balance was paid at the cafe
- `internalNotes` (varchar, Nullable) - admin-only notations
- `razorpayOrderId` / `razorpayPaymentId` (varchar)
- `createdAt` (timestamp)

### 5. `booking_logs`
Timestamped modification history (audit trail) for bookings.
- `id` (Primary Key, uuid)
- `bookingId` (varchar) - references `bookings.id`
- `adminId` (uuid, Nullable) - references `admins.id` (null if customer action)
- `action` (varchar) - e.g., `'created'`, `'status_changed'`, `'rescheduled'`
- `details` (jsonb) - e.g. `{ "oldDate": "2026-06-15", "newDate": "2026-06-18" }`
- `createdAt` (timestamp)

### 6. `blocked_dates`
Private closures or maintenance blocks.
- `id` (Primary Key, uuid)
- `branchId` (varchar) - references `branches.id`
- `date` (date)
- `reason` (varchar) - e.g., `'Maintenance'`
- `createdAt` (timestamp)

### 7. `otp_sessions`
Ephemeral validation tokens.
- `id` (Primary Key, uuid)
- `phone` (varchar)
- `code` (varchar) - 6-digit OTP code
- `expiresAt` (timestamp)
- `verified` (boolean)
- `createdAt` (timestamp)

### 8. `communication_logs`
Delivery logs for WhatsApp/SMS.
- `id` (Primary Key, uuid)
- `customerId` (uuid) - references `customers.id`
- `bookingId` (varchar, Nullable) - references `bookings.id`
- `type` (varchar) - `'otp'`, `'booking_confirmation'`, etc.
- `channel` (varchar) - `'whatsapp'` or `'sms'`
- `recipient` (varchar)
- `status` (varchar) - `'sent'`, `'delivered'`, `'read'`, `'failed'`
- `errorMessage` (varchar, Nullable)
- `createdAt` (timestamp)

---

## 🛠️ Section 5: Junior Developer Cheat Sheet (How-To Guide)

Here are the step-by-step instructions for performing everyday database tasks.

### 1. How to Modify the Database Schema

If you need to add a column, update a field, or create a table:

1. **Edit the Schema**: Open [schema.ts](file:///c:/projects/dome/src/lib/db/schema.ts) and make your updates using Drizzle's helpers.
2. **Generate the SQL Migration**:
   Run the generate command in the root folder:
   ```powershell
   npx drizzle-kit generate
   ```
   This generates a new `.sql` file in the `drizzle/` directory.
3. **Write Custom SQL (If needed)**:
   If your change involves RLS policies, write the RLS SQL commands in a new custom migration file (e.g., `drizzle/xxxx_custom_rls.sql`).
4. **Apply Migrations to the Database**:
   Run this in the root folder (loads credentials from `.env.local`):
   ```powershell
   node --env-file=.env.local node_modules/drizzle-kit/bin.cjs migrate
   ```

### 2. How to Run Database Seeding
To populate default branch configurations and default admin credentials in your environment:
```powershell
npx tsx --env-file=.env.local src/lib/db/seed-admins.ts
```

### 3. How to Write a Database Query with RLS in the Backend
Whenever you query data on behalf of a branch admin, you **must** execute your queries inside a transaction block to enable RLS checks.

Here is an example in Express/Drizzle:
```typescript
import { db } from './db'; // Your drizzle client
import { bookings } from './schema';
import { sql } from 'drizzle-orm';

export async function getBookingsForAdmin(branchId: string) {
  // Wrap queries inside a database transaction block
  return await db.transaction(async (tx) => {
    // 1. Set session parameter (clears automatically after commit)
    await tx.execute(
      sql`SET LOCAL app.current_branch_id = ${branchId}`
    );

    // 2. Query bookings as usual.
    // PostgreSQL will automatically intercept and filter the results!
    const results = await tx.select().from(bookings);
    return results;
  });
}
```

If querying as a Super Admin:
```typescript
export async function getAllBookingsGlobal() {
  return await db.transaction(async (tx) => {
    // Set current_role parameter to super_admin to bypass RLS filters
    await tx.execute(
      sql`SET LOCAL app.current_role = 'super_admin'`
    );

    return await tx.select().from(bookings);
  });
}
```
