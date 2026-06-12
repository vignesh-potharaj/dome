# Decoupled Architecture Design Document: Full Frontend & Backend Separation

This document outlines the architectural blueprint to transition the **Dome Cafe Digital Management System** into a completely decoupled architecture, where the **Frontend (User Interface)** is fully separated from the **Backend (Business Logic, Databases, and Integrations)**.

---

## 🎯 Architecture Goals
1. **Separation of Concerns**: The frontend behaves as a pure client (no database connections, direct API keys, or server-side backend operations). The backend handles security, data validation, transactions, and third-party APIs.
2. **Independent Scalability**: Deploy and scale the frontend (e.g., via globally distributed Edge CDNs) and backend (e.g., via auto-scaling container apps or VMs) independently based on load.
3. **Enhanced Security**: Sensitive integrations (like Razorpay secrets, WhatsApp API credentials, and SMS tokens) are hidden entirely behind the backend firewall.
4. **Developer Specialization**: Front-end developers focus purely on UI/UX, animations, and state management, while back-end developers focus on API performance, data integrity, and database schemas.

---

## 📐 System Architecture Diagram

```mermaid
graph TD
    subgraph ClientLayer [Client Layer (Frontend SPA / CDN)]
        NextCustomer[Next.js Client-Only Customer App]
        AdminFrontend[Admin Portal Frontend]
    end

    subgraph ApiGateway [API Gateway / Load Balancer]
        Gateway[Secure HTTPS API Gateway]
    end

    subgraph BackendServices [Backend Services (Railway / Render / AWS)]
        ExpressAuth[Express.js Auth Service]
        ExpressCore[Express.js Core Backend Service]
        CronWorker[Anniversary CRM Cron Worker]
    end

    subgraph ExternalServices [Third-Party Headless / API Services]
        SanityCloud[Sanity Content Lake]
        Razorpay[Razorpay Payment API]
        WhatsApp[WhatsApp Business API]
        SMS[SMS Gateway API]
    end

    subgraph DatabaseLayer [Database Layer]
        SupabasePostgres[(Supabase PostgreSQL Database)]
    end

    %% Client Interactions
    NextCustomer -->|Fetch Content| SanityCloud
    NextCustomer -->|API Requests| Gateway
    AdminFrontend -->|API Requests| Gateway

    %% Gateway Routing
    Gateway -->|/api/auth/*| ExpressAuth
    Gateway -->|/api/booking/*| ExpressCore
    Gateway -->|/api/admin/*| ExpressCore

    %% Backend Operations
    ExpressCore -->|Query/Write| SupabasePostgres
    ExpressAuth -->|Query/Write| SupabasePostgres
    CronWorker -->|Daily Queries| SupabasePostgres
    
    %% Integrations
    ExpressCore -->|Trigger Payments| Razorpay
    ExpressCore -->|Send Alerts/OTPs| WhatsApp
    ExpressCore -->|Fallback OTPs| SMS
    CronWorker -->|Send Reminders| WhatsApp
```

---

## 💻 1. Frontend Architecture (The "Head")

The frontend acts purely as a Consumer. It does not run server-side database scripts or store secrets.

### Key Details
* **Tech Stack**: Next.js (configured as client-only/Static Export) or a React SPA (Vite).
* **Content Source**: Fetches static/marketing content (packages, branch details, balloon options, reviews) directly from the [Sanity Content Lake API](file:///c:/projects/dome/src/sanity/lib/client.ts) via read-only public tokens.
* **State Management**: React state, context, or lightweight stores (e.g., Zustand) to handle the booking wizard.
* **API Calls**: Communicates with the backend exclusively via an HTTPS client (like Axios or Fetch) using a base URL configured via environment variables (e.g., `NEXT_PUBLIC_API_URL`).

---

## ⚙️ 2. Backend Architecture (The "Engine")

The backend acts as the single source of truth, enforcing business logic, security policies, and handling database connections.

### Key Details
* **Tech Stack**: Express.js (matching our existing auth pattern in [auth-service](file:///c:/projects/dome/admin-portal/apps/auth-service)), NestJS, or a Go-based API server.
* **Database Access**: Interacts directly with PostgreSQL (via Prisma or Drizzle ORM) using a secure connection string that is never exposed to the frontend.
* **Security & Auth**:
  * Employs **JSON Web Tokens (JWTs)** or session cookies for authorization.
  * Implements strict **Cross-Origin Resource Sharing (CORS)** policies, allowing API access only from approved frontend domains.
  * Encapsulates authentication logic (e.g., WhatsApp OTP verification) on the backend.
* **Integrations**: Handles payments (Razorpay webhooks), WhatsApp triggers, SMS fallbacks, and triggers the Daily CRM Cron scheduler.

---

## 🔒 3. Communication & Security Protocol

1. **Token-Based Authentication**:
   * When a customer enters their phone number and verifies the OTP, the Backend generates a JWT.
   * This JWT is returned to the client in an **HttpOnly, Secure, SameSite=Strict Cookie**. This protects the application from Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).
2. **CORS Configuration**:
   ```javascript
   const allowedOrigins = ['https://domecafe.in', 'https://admin.domecafe.in'];
   app.use(cors({
     origin: (origin, callback) => {
       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true
   }));
   ```
3. **Data Transfer Objects (DTOs)**: The backend exposes sanitized JSON endpoints. For example, rather than returning user password hashes or raw database transaction states, it returns structured, safe payloads.

---

## 📁 4. Directory & Repository Layout

To cleanly decouple the codebase, the repository should be structured as a monorepo or split into individual repositories:

```text
dome-project/
├── apps/
│   ├── customer-frontend/     # Next.js / React client-only customer app
│   │   ├── src/
│   │   └── package.json
│   └── admin-frontend/        # React / Next.js admin UI portal
│       ├── src/
│       └── package.json
├── packages/                  # Shared configurations (Types, ESLint configs)
│   └── shared-types/
└── services/
    ├── auth-service/          # Express.js Auth Service (already defined)
    ├── core-backend/          # Express.js core API backend (bookings, payments)
    └── crm-worker/            # Background cron job scheduler (Anniversary alerts)
```

---

## 🚀 5. Deployment & Hosting Strategy

| Layer | Environment | Recommended Platform | Notes |
|---|---|---|---|
| **Frontend** | Static/Edge CDN | Vercel / Netlify / Cloudflare | Global distribution, sub-millisecond load times. |
| **Backend API** | VM / Container | Railway / Render / AWS ECS | Always-on services with connection pooling. |
| **Database** | Managed Postgres | Supabase / Neon | Direct and transaction pooled connection options. |
| **Content Lake** | Serverless CMS | Sanity.io Cloud | Global GraphQL/GROQ CDN API. |

---

## 🛠️ 6. Step-by-Step Migration Plan

1. **Isolate Backend Logic from Frontend API Routes**:
   * Migrate the OTP dispatching, Razorpay setup, and booking database write commands from the frontend pages into a separate Express service (e.g., `services/core-backend`).
2. **Update Frontend Calls**:
   * Replace all direct database queries or server actions in the customer app (e.g., checkout and booking pages) with async `fetch()` operations targeting the backend API.
3. **Move CMS Studio**:
   * Move the Sanity Studio configuration [sanity.config.ts](file:///c:/projects/dome/sanity.config.ts) out of the customer app and host it under its own workspace subdomain (e.g., `studio.domecafe.in`) or within the Admin Frontend to optimize bundle size and speed.
4. **Secure Endpoints**:
   * Implement JWT validation middleware on the Express backend and attach authorization headers to all customer and admin requests.
5. **Set up CORS & Environment Variables**:
   * Configure backend environments with secrets (`DATABASE_URL`, `RAZORPAY_SECRET`, `WA_API_KEY`) and set public-facing API URLs (`NEXT_PUBLIC_API_URL`) on the frontends.
