# Project Manual & Agent Guidelines

## Memory & Context Vault
This project uses an Obsidian-Mind memory vault located in [./.brain/](file:///c:/projects/dome/.brain/).
Before starting any implementation:
1. Read the project vision and goals in [.brain/brain/North Star.md](file:///c:/projects/dome/.brain/brain/North%20Star.md).
2. Scan architectural choices in [.brain/brain/Key Decisions.md](file:///c:/projects/dome/.brain/brain/Key%20Decisions.md).
3. Review known limitations and errors in [.brain/brain/Gotchas.md](file:///c:/projects/dome/.brain/brain/Gotchas.md).

## Code Style & Guidelines
- See [AGENTS.md](file:///c:/projects/dome/AGENTS.md) for breaking framework changes (Next.js v15 rules).
- Backend database actions should use Drizzle ORM in TypeScript (`src/lib/db/schema.ts`).
- Styling: Use Vanilla CSS for UI elements.

## Session Wrap-up Protocol
Before ending your turn or finishing a major milestone, you MUST:
1. Update [.brain/brain/Key Decisions.md](file:///c:/projects/dome/.brain/brain/Key%20Decisions.md) if any design decisions were made.
2. If you encountered and resolved a hard-to-debug issue or configuration quirk, document it in [.brain/brain/Gotchas.md](file:///c:/projects/dome/.brain/brain/Gotchas.md).
3. Log task completion status in the active tracker or vault workspace files.
