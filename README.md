# Dome Cafe — Digital Management System (v2.0)

This is the unified codebase for the Dome Cafe Digital Management System, which includes the customer-facing booking wizard, backend transactional APIs, and the admin dashboard portal.

---

## 🏗️ Project Architecture

The project is structured to run as a unified serverless application that can be deployed entirely on Vercel:

1. **Root Next.js Application (Port 3000)**:
   - **Customer Website**: Home page & dynamic step-by-step booking journey wizard.
   - **Backend API Routes**: Configured under `/api` for booking transactions, payment confirmations, blocked dates, CRM aggregates, WhatsApp campaign dispatches, and daily cron schedulers.
   - **Serverless Authentication**: Handler routes at `/api/auth/login` and `/api/auth/register` to support admin token issuance.

2. **Admin Portal Frontend (Port 3001)**:
   - A client-only Next.js SPA located in `admin-portal/apps/frontend` providing Calendar views, Appointment Management grids, Settings toggles, and the CRM panel.

---

## 🚀 How to Run Locally

### Prerequisites
1. Create a `.env.local` file in the root directory and add:
   ```env
   DATABASE_URL="your-supabase-pooled-or-direct-url"
   JWT_SECRET="your-jwt-auth-secret-key"
   CRON_SECRET="your-secure-cron-webhook-secret"
   ```

2. Populate the database migrations and seed default branch and admin users:
   ```powershell
   # Apply database schema migrations
   node --env-file=.env.local node_modules/drizzle-kit/bin.cjs migrate

   # Run admin accounts & branch parameters seeding
   npx tsx --env-file=.env.local src/lib/db/seed-admins.ts
   ```

---

### Start the Applications

You must run **both** the Root Next.js backend and the Admin Frontend. Because they are both Next.js apps, they must run on different ports to prevent port conflicts:

#### 1. Start the Customer App & API Server (Port 3000)
Run this command from the **root directory**:
```powershell
npm run dev
```
- Customer App URL: `http://localhost:3000`
- API Base Endpoint: `http://localhost:3000/api`

#### 2. Start the Admin Portal Frontend (Port 3001)
Open a new terminal window, navigate to the **`admin-portal`** folder, and start Next.js on port 3001:
```powershell
cd admin-portal
npm run dev -- -p 3001
```
- Admin Portal URL: `http://localhost:3001`
- It is pre-configured to communicate with the API server running on `http://localhost:3000`.

---

## 🧪 Testing the Endpoints

### 1. Test Admin Login
- Open `http://localhost:3001/login`.
- Log in using seeded credentials (e.g. `superadmin@domecafe.in` / `adminpassword123`).

### 2. Test Booking Flow
- Go to `http://localhost:3000/booking` and complete steps 1–8.
- Choose marketing opt-in consent in Step 7.
- Complete the booking to write transactional records to the database.

### 3. Test Daily Cron Scheduler
You can trigger the 7-day marketing campaigns cron runner locally:
- Send a `GET` request to `http://localhost:3000/api/cron/crm-reminders`
- Include the request header: `Authorization: Bearer <your_cron_secret>`
- Observe terminal logs to verify occasion date calculations and simulated WhatsApp campaign logs.
