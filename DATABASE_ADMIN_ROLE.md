# Dome Cafe — Admin Users & Roles Database Schema

This document details the schema design, roles, Row-Level Security (RLS) integration, and authorization rules for the **Admin Users & Roles Table** in the Dome Cafe Digital Management System.

---

## 🎯 Purpose

The `admins` table stores administrative accounts, credentials, and role assignments (e.g., Kokapet Admin vs. Sainikpuri Admin vs. Super Admin). The Express `auth-service` uses this table to:
1. Authenticate admins via username/email and hashed passwords.
2. Sign JSON Web Tokens (JWTs) containing the admin's `role` and assigned `branch_id`.
3. Provide the database-level isolation variables (`app.current_role` and `app.current_branch_id`) to enforce multi-tenant separation.

---

## 📐 Table Schema

The table is defined as `admins` and maps directly to the following columns:

| Column Name | Data Type | Constraints / Properties | Description |
|---|---|---|---|
| **id** | `uuid` | Primary Key, `defaultRandom()` | Unique identifier for each admin account. |
| **email** | `varchar(255)` | Unique, Not Null | The username/email used for logging into the admin portal. |
| **password_hash** | `varchar(255)` | Not Null | Hashed password (e.g., bcrypt) to verify login credentials. |
| **role** | `varchar(50)` | Not Null | Assigns the admin's role. Allowed values: `'super_admin'`, `'branch_admin'`. |
| **branch_id** | `varchar(50)` | Nullable, References `branches.id` | The physical branch this admin is assigned to. Must be `null` for `super_admin`. |
| **created_at** | `timestamp` | `defaultNow()`, Not Null | Audit timestamp when the admin record was created. |

### Drizzle ORM Schema Definition

```typescript
export const admins = pgTable('admins', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'super_admin', 'branch_admin'
  branchId: varchar('branch_id', { length: 50 }).references(() => branches.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 🔒 Row-Level Security (RLS) & Role Integration

The system enforces multi-tenant isolation based on the admin's role and branch assignment:

### 1. Super Admin Role (`super_admin`)
* **Scope**: Global dashboard.
* **Database Connection**: Can either bypass RLS entirely by running queries as the database owner, or bypass policies by setting `app.current_role = 'super_admin'` within a transaction block.
* **Constraint**: `branch_id` is set to `NULL`.

### 2. Branch Admin Role (`branch_admin`)
* **Scope**: Restricted strictly to their assigned branch (e.g., `'kokapet'` or `'sainikpuri'`).
* **Database Connection**: Must set `app.current_branch_id` to their respective `branch_id` before querying tables.
* **RLS Isolation Policy**:
  ```sql
  CREATE POLICY bookings_branch_isolation_policy ON "bookings"
    FOR ALL
    USING (
      current_setting('app.current_role', true) = 'super_admin'
      OR branch_id = current_setting('app.current_branch_id', true)
    );
  ```

---

## 🛠️ Usage in Express Auth Service

When a login request is received:
1. **Query Account**: Fetch the record from `admins` where `email = inputEmail`.
2. **Verify Password**: Use `bcryptjs.compare()` to check if the input password matches the `password_hash`.
3. **Generate JWT Token**: If valid, sign a JWT payload containing:
   ```json
   {
     "adminId": "uuid-value",
     "email": "admin@domecafe.in",
     "role": "branch_admin",
     "branchId": "kokapet"
   }
   ```
4. **API Requests**: The admin frontend includes this JWT in authorization headers or HttpOnly cookies for subsequent API requests, which are processed inside scoped Postgres database transactions.
