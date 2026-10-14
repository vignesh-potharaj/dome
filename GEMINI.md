# Agent Guidelines & Persistent Memory Protocol

## 🧠 Memory & Context Vault (`.brain/`)
This project maintains persistent memory across agent sessions in the [`.brain/`](file:///c:/projects/dome/.brain/) vault.

### Session Start Protocol (Before Planning or Writing Code):
1. **Goals & Focus**: Read [`.brain/brain/North Star.md`](file:///c:/projects/dome/.brain/brain/North%20Star.md) to understand current milestones, goals, and anti-goals.
2. **Architecture & Decisions**: Read [`.brain/brain/Key Decisions.md`](file:///c:/projects/dome/.brain/brain/Key%20Decisions.md) to adhere to existing architectural choices (e.g. decoupled API architecture, Drizzle ORM models, auth conventions, styling choices).
3. **Pitfalls & Known Gotchas**: Read [`.brain/brain/Gotchas.md`](file:///c:/projects/dome/.brain/brain/Gotchas.md) to avoid repeating past bugs (e.g. Next.js hydration gates, PostgreSQL `SET LOCAL` quirks, Fast Refresh OTP lifecycle issues).

### Session Wrap-up Protocol (After Implementing Solutions):
Whenever completing a feature, bugfix, or architectural task:
1. **Log Architectural Changes**: If you introduced or altered system design, flow, or libraries, record a concise bullet in [`.brain/brain/Key Decisions.md`](file:///c:/projects/dome/.brain/brain/Key%20Decisions.md).
2. **Log Gotchas & Traps**: If you solved an unexpected error, environment quirk, or difficult bug, record a concise explanation and solution in [`.brain/brain/Gotchas.md`](file:///c:/projects/dome/.brain/brain/Gotchas.md).
3. **Update North Star**: If project milestones or focus shifts, update [`.brain/brain/North Star.md`](file:///c:/projects/dome/.brain/brain/North%20Star.md).

## 🛠️ Tech Stack & Conventions
- **Framework**: Next.js (App Router) + React 19. Consult `AGENTS.md` for framework rules.
- **Database / ORM**: PostgreSQL via Drizzle ORM (`src/lib/db/schema.ts`).
- **Architecture**: Decoupled backend and frontend; keep DB operations in `src/lib/db/` or route handlers.
- **Client Safety**: Wrap client-only and browser-storage dependent components in hydration mounting gates (`mounted` state check).
