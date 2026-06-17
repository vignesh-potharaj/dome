# Dome Cafe — Admin Portal & API Integration Guide
### A Junior Developer's Guide to Layouts, RLS API Routes, and Audit Trails

Welcome! This guide explains what we built for the **Admin Dashboard & APIs**, why we chose this decoupled design, and how the frontend UI panels communicate securely with the PostgreSQL database.

---

## 🎯 Section 1: The "What" and "Why"

### 1. What did we build?
We implemented a complete **Admin Dashboard** containing three core views:
- **Calendar Grid**: A live monthly view showing bookings and slot locks, enabling managers to block off holiday/maintenance dates.
- **Appointments Panel**: A card-based manager displaying customer details, customized options (balloons, cakes, lights), payment status, and custom internal notes.
- **Settings Screen**: Control panels for branch admins to adjust maximum slot capacities and toggle location status (active vs. disabled/emergency shutdown).
- **Backend API Endpoints**: A set of secure Next.js API routes under `/api/admin/*` that query the database under strict security rules.

### 2. Why did we build it this way?
We followed our **Decoupled Architecture** guidelines:
- **Pure Client Frontend**: The admin frontend (`admin-portal/apps/frontend`) is a pure client-side React SPA. It contains **no database connection keys** and cannot query the database directly. This prevents credentials leakage.
- **Shared API Gateway**: The frontend communicates exclusively via HTTP requests to the backend API hosted in the root Next.js customer application.
- **Unified Security (RLS)**: The database contains data for both cafe locations (Kokapet and Sainikpuri). By routing all dashboard queries through RLS-aware API endpoints, we guarantee that a Kokapet manager cannot view or edit Sainikpuri customer records.

---

## 📐 Section 2: How It Works under the Hood

The communication pipeline works in four steps:

```
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│  Admin Frontend  │               │ Root API Gateway │               │  Postgres Cloud  │
│  (React Pages)   │               │ (Next.js Routes) │               │  (Supabase DB)   │
└────────┬─────────┘               └────────┬─────────┘               └────────┬─────────┘
         │                                  │                                  │
         │ 1. GET /api/admin/bookings       │                                  │
         ├─────────────────────────────────>│                                  │
         │    (Authorization: Bearer JWT)   │ 2. Verify JWT & extract branchId │
         │                                  ├─────────────────────────────────>│
         │                                  │ 3. SET LOCAL app.current_branch  │
         │                                  ├─────────────────────────────────>│
         │                                  │ 4. SELECT * FROM bookings        │
         │                                  ├─────────────────────────────────>│
         │                                  │    (Database filters automatically)
         │                                  │                                  │
         │ 5. Returns filtered JSON list    │                                  │
         │<─────────────────────────────────┤                                  │
         │                                  │                                  │
```

---

## 🛠️ Section 3: Key Files & Code Walkthrough

### 1. Token Verification (`src/lib/auth-middleware.ts`)
When an admin logs in, they receive a JSON Web Token (JWT) from our authentication microservice. For subsequent requests, the admin frontend sends this token in the `Authorization` header.
The backend middleware extracts and verifies the token:
```typescript
const decoded = jwt.verify(token, secret) as AdminPayload;
return decoded; // returns { adminId, role, branchId }
```

### 2. RLS Scoped Queries (`src/lib/db/admin-queries.ts`)
To enforce multi-branch security, all queries are wrapped inside a database **transaction block**. Inside this transaction, we set Postgres session variables before querying:
```typescript
export async function getAdminBookings(role: string, branchId: string | null) {
  return await db.transaction(async (tx) => {
    // 1. Set variables for this transaction only
    if (role === 'super_admin') {
      await tx.execute(sql`SET LOCAL app.current_role = 'super_admin'`);
    } else {
      await tx.execute(sql`SET LOCAL app.current_role = 'branch_admin'`);
      await tx.execute(sql`SET LOCAL app.current_branch_id = ${branchId}`);
    }

    // 2. Query bookings. Postgres RLS intercepts and filters rows automatically!
    const results = await tx.query.bookings.findMany({
      with: { customer: true, logs: true }
    });
    return results;
  });
}
```

### 3. Auditing & Audit Trails (`booking_logs`)
Every time an admin updates a booking (rescheduling, updating cakes, toggling payment status), we must record who did it, when, and what changed.
In `updateBookingByAdmin`, we calculate the difference (diff) between the old data and the new data, apply the update, and insert a record into the `booking_logs` table:
```typescript
// Insert audit log
await tx.insert(bookingLogs)
  .values({
    bookingId,
    adminId,
    action: 'rescheduled', // or status_changed, cake_updated
    details: {
      changes: {
        date: { old: '2026-06-15', new: '2026-06-18' }
      }
    }
  });
```

---

## 🚀 Section 4: Cheat Sheet for Junior Developers

Here is how you can perform common operations in the admin codebase:

### 1. Adding a New Admin API Route
If you need to expose a new endpoint under `/api/admin/my-feature`:
1. Create the file `src/app/api/admin/my-feature/route.ts`.
2. Verify authorization at the start of your handler:
   ```typescript
   import { verifyAdminToken } from '@/lib/auth-middleware';
   
   export async function GET(request: Request) {
     try {
       const admin = verifyAdminToken(request); // Throws if invalid
       // your DB query code here
     } catch (e) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
   }
   ```
3. Always return the CORS headers so the frontend on Port 3001 can query it:
   ```typescript
   return NextResponse.json({ data }, { headers: corsHeaders() });
   ```

### 2. Modifying the Admin Dashboard Theme & Styles
All dark mode styles are located in [globals.css](file:///c:/projects/dome/admin-portal/apps/frontend/src/styles/globals.css).
- We use HSL variables for dark colors (e.g. `--bg-primary: #0b0f19` for slate dark).
- Avoid inline styles in React components. If you create a new element, add a class name and declare its styling inside `globals.css` using modern flexbox/grid tokens.
