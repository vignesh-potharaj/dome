<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

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
