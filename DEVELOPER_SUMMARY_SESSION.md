# Developer Guide: Offline Bookings & 30-Minute Temporary Slot Holds

Welcome! This guide breaks down all the features, code changes, and database updates implemented during this session. It is written to be clear and approachable for developers of all experience levels.

---

## 📋 Summary of Work Completed

Here is a quick overview of what we accomplished:
1. **Offline Admin Booking Workflow**: Allowed cafe admins to manually book slots for walk-in or phone customers without going through an online payment gateway.
2. **Default Marketing Opt-In**: Ensured marketing consent defaults to `true` (opt-in) across all booking channels, while allowing customers to uncheck (opt-out).
3. **Clean Appointments UI**: Improved the Admin Portal's appointment manager to use a clean table view with pop-up detail modals.
4. **30-Minute Temporary Slot Hold**: Implemented a real-time reservation hold so when a customer picks a date and slot, it is locked for 30 minutes while they customize their experience.
5. **Database Sync & Migration**: Pushed schema updates to the live Supabase PostgreSQL database to support slot hold expiration timestamps.

---

## 📁 Feature 1: Offline Booking Workflow (Admin Portal)

### The Goal
Sometimes customers call the cafe or walk in directly. Branch admins needed a way to reserve slots immediately without requiring an online payment gateway (like Razorpay).

### Key Files Created & Modified
- 📄 **`src/app/api/admin/bookings/create-offline/route.ts`** (Backend API)
  - Accepts booking details from an admin.
  - Automatically verifies admin permissions (branch admin vs. super admin).
  - Skips payment processing and inserts the booking with `status: 'confirmed'`.
  - Creates an audit log entry (`created_offline`).

- 📄 **`admin-portal/apps/frontend/src/components/OfflineBookingForm.tsx`** (Frontend Form)
  - A clean, single-page form inside the admin dashboard.
  - Allows admins to pick branch, date, time slot, packages, cake flavors, balloon palettes, and add-ons.
  - Calculates the total price live on the screen.

- 📄 **`admin-portal/apps/frontend/src/components/Layout.tsx` & `dashboard.tsx`**
  - Added a **"New Booking"** tab to the sidebar navigation.

---

## 📱 Feature 2: Default Marketing Consent (Opt-In)

### The Goal
To build customer communication lists while complying with privacy principles, marketing consent should default to **Opt-In** for everyone, while providing a clear checkbox to **Opt-Out** if desired.

### Key Changes
- Modified `schema.ts`: `marketingConsent` column defaults to `true`.
- Updated `Step7Details.tsx` (Website) & `OfflineBookingForm.tsx` (Admin Portal): Added a checkbox pre-checked by default (`"I agree to receive booking confirmations, updates and promotional offers..."`).
- Updated backend API routes (`create-pending` and `create-offline`) to store the customer's choice accurately.

---

## ⏱️ Feature 3: 30-Minute Temporary Slot Hold (Customer Website)

### The Problem
If two customers select the same popularity slot on Saturday night at the exact same time, both might spend 5 minutes customizing cakes and balloons, only to clash at the checkout screen.

### The Solution: 30-Minute Database Hold
When a user selects a date and slot on **Step 2** and clicks **"Continue"**:
1. The backend locks that slot for **30 minutes** in PostgreSQL (`hold_expires_at = NOW() + 30 minutes`).
2. Other users browsing the website will see that slot marked as **`BOOKED`** / **`UNAVAILABLE`**.
3. A sticky banner appears on steps 3 through 8 for the user: **`SLOT HELD FOR YOU: 29:59`**.
4. If the user completes payment within 30 minutes, status becomes `confirmed`.
5. If the timer hits `00:00` or the session is abandoned, the hold automatically expires and the slot opens back up for the public!

### Key Files Created & Modified
- 📄 **`src/lib/db/schema.ts`**
  - Added `holdExpiresAt: timestamp('hold_expires_at')` to the `bookings` table.
  - Relaxed initial `NOT NULL` constraints so a temporary hold record can be created on Step 2 before customer name/phone are entered.

- 📄 **`src/lib/db/booking-queries.ts`**
  - **`checkSlotAvailability()`**: Updated logic so that active holds (`hold_expires_at > NOW()`) count towards slot capacity, while expired holds (`hold_expires_at <= NOW()`) are safely ignored.
  - **`createOrUpdateSlotHold()`**: Helper function that creates or refreshes the 30-minute reservation record.
  - **`createPendingBooking()`**: Updated so when the customer reaches final checkout, it updates their existing held record instead of creating duplicates.

- 📄 **`src/app/api/booking/hold/route.ts`** (NEW Endpoint)
  - Endpoint called when clicking "Continue" on Step 2 to lock the slot.

- 📄 **`src/app/(website)/booking/components/HoldCountdownBanner.tsx`** (NEW UI Component)
  - Sticky header badge displaying the dynamic MM:SS countdown.
  - Triggers an automatic alert and redirects the user back to Step 2 if the time expires.

---

## 🛠️ Feature 4: Database Sync & Troubleshooting

### What Happened?
When testing locally, a browser popup showed an error: `Failed query: select ... "hold_expires_at" ... column does not exist`.

### Why Did It Happen?
We updated the TypeScript schema code in `schema.ts`, but the live PostgreSQL database running in the cloud (Supabase) did not physically have the new `"hold_expires_at"` column yet.

### How We Fixed It
We ran `drizzle-kit push` using the connection credentials in `.env.local`:
```bash
cmd.exe /c "set DIRECT_URL=... && set DATABASE_URL=... && npx drizzle-kit push"
```
Drizzle Kit connected to Supabase PostgreSQL, executed the SQL `ALTER TABLE` commands, and brought the live database table in 100% sync with our TypeScript models!

---

## 🧪 Verification & Testing

- **Main Website Build (`npm run build`)**: Compiled cleanly with zero TypeScript or route errors. All 24 static & server routes generated properly.
- **Database Query Verification**: Verified via script that `{ id: '...', holdExpiresAt: null }` returns successfully from Supabase.

---

*Document generated for team onboarding and reference.*
