# Dome Cafe — PostgreSQL Database Setup & Connection Guide

This document explains the database architecture, connection methods, and environment configurations selected for the **Dome Cafe Digital Management System**. 

---

## 🎯 Architecture Summary

We are using **PostgreSQL** as the core database engine. Because our application consists of two different runtime environments (Serverless Next.js and a Persistent Express backend), we must use **two different database connection methods** to ensure high performance and prevent connection exhaustion.

```mermaid
graph TD
    subgraph Vercel [Vercel Serverless Hosting]
        NextCustomer[Next.js Customer App]
        NextAdmin[Next.js Admin Frontend]
    end

    subgraph VMContainer [VM / Container Hosting]
        ExpressAuth[Express.js Auth Service]
    end

    subgraph CloudDB [Cloud PostgreSQL Database e.g., Supabase / Neon]
        DirectConn[Direct Connection - Port 5432]
        TxPooler[Transaction Pooler - Port 6543]
    end

    NextCustomer -->|Queries| TxPooler
    NextAdmin -->|Queries| TxPooler
    ExpressAuth -->|Persistent Connection Pool| DirectConn
    Migrations[Database Migrations / Seeds] -->|Schema Alterations| DirectConn
```

---

## 🔌 Connection Methods: Why & Where

PostgreSQL handles connections by spawning a heavy operating system process for each client. Cloud databases have strict limits on these processes (e.g., a maximum of 100 concurrent connections). To handle this limit, we split our connections as follows:

### 1. Transaction Pooler (Port 6543)
* **Used By:** 
  * Next.js Customer Frontend (`/`)
  * Next.js Admin Frontend (`/admin-portal/apps/frontend`)
* **How it Works:** The pooler sits between the Next.js app and the database. It only allocates a real database connection when a query is running. The moment a transaction completes, the connection is instantly returned to the pool to be shared by another request.
* **Why:** In a serverless hosting environment like Vercel, your backend code scales horizontally by spinning up hundreds of temporary, short-lived instances in response to traffic. If each instance opened a direct connection, the database limit would be reached instantly, leading to website crashes.

### 2. Direct Connection (Port 5432)
* **Used By:** 
  * Express.js Auth Service (`/admin-portal/apps/auth-service`)
  * Database Schema Migrations (e.g. Prisma Migrate, Drizzle Kit)
* **How it Works:** The application establishes a permanent, 1-to-1 socket connection directly to PostgreSQL and keeps it open.
* **Why:** 
  * **For Auth Service:** The Express server is a long-lived process. It starts once and runs 24/7. It can safely manage its own small connection pool (e.g., 5-10 connections) that it reuses for every authentication request. This avoids the extra network hop of a pooler and supports fast response times.
  * **For Migrations:** Running migrations requires exclusive locks and session-level commands (`SET`, `ALTER`) that transaction poolers do not support.

---

## ⚙️ Environment Configuration

You will need to set up three separate `.env` files in your workspace. 

### 1. Customer Frontend App
Create or edit [`.env.local`](file:///c:/projects/dome/.env.local) in the root directory:

```bash
# PostgreSQL Connection - Transaction Pooler (Port 6543)
DATABASE_URL="postgresql://postgres.gjynx5au:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Note: If using Prisma, you also configure the direct URL for migrations:
DIRECT_URL="postgresql://postgres.gjynx5au:[YOUR-PASSWORD]@db.gjynx5au.supabase.co:5432/postgres"
```

### 2. Admin Frontend App
Create or edit [`.env`](file:///c:/projects/dome/admin-portal/apps/frontend/.env):

```bash
# PostgreSQL Connection - Transaction Pooler (Port 6543)
DATABASE_URL="postgresql://postgres.gjynx5au:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.gjynx5au:[YOUR-PASSWORD]@db.gjynx5au.supabase.co:5432/postgres"
```

### 3. Auth Service App
Create or edit [`.env`](file:///c:/projects/dome/admin-portal/apps/auth-service/.env):

```bash
PORT=5000

# PostgreSQL Connection - Direct Connection (Port 5432)
DATABASE_URL="postgresql://postgres.gjynx5au:[YOUR-PASSWORD]@db.gjynx5au.supabase.co:5432/postgres"
```

---

## 🛠️ Step-by-Step Database Provisioning

To set up the database using a cloud provider like **Supabase** (recommended):

1. **Create a Project:**
   * Go to [Supabase](https://supabase.com) and create a new project named `dome-cafe`.
   * Save the database password securely.

2. **Retrieve Connection Strings:**
   * Go to **Project Settings** > **Database** in the Supabase Dashboard.
   * Scroll down to the **Connection string** section.
   * Under the **URI** tab, toggle between:
     * **Transaction Mode:** Copy this URI for `DATABASE_URL` in your Next.js apps (uses port `6543` and `?pgbouncer=true` or similar pooler configurations).
     * **Session/Direct Mode:** Copy this URI for `DATABASE_URL` in your Express Auth Service, and as `DIRECT_URL` in Next.js (uses port `5432`).

3. **Verify Local Connections:**
   * Double check that your local environment can resolve the database hosts.
   * Note that some network environments block port `5432` or `6543`. If your local setup cannot connect, verify your local firewall or network restrictions.

---

## ⚠️ Important Best Practices

> [!WARNING]
> **Never commit your `.env` files to git.** Make sure they are listed in the corresponding `.gitignore` files of each application.

> [!IMPORTANT]
> **Transaction Pooling Restrictions:**
> When querying through the Transaction Pooler (Next.js apps), do not use raw PostgreSQL session commands like `SET timezone = 'UTC'` or `LISTEN/NOTIFY` channels. Since the pooler switches your physical connection behind the scenes, these session settings will bleed into other users' transactions or fail completely.

> [!TIP]
> **Express.js Connection Pool Limit:**
> In your Express Auth Service, always limit the pool size in your database driver options (e.g. `max: 10`) to ensure it doesn't hog connections that other services or frontend API routes need.
