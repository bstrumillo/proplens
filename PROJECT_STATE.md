# PropForge Project State

**Last updated:** 2026-02-27
**Updated by:** Orchestrator
**Current Phase:** Phase 0 — Foundation (Complete)
**Next Phase:** Phase 1 — Core Property Management

---

## What's Built
- Next.js 16.1.6 project with TypeScript, Tailwind CSS v4, App Router
- shadcn/ui component library (16 components: button, card, input, label, separator, sheet, avatar, badge, dropdown-menu, scroll-area, tooltip, dialog, select, table, tabs, textarea)
- Drizzle ORM schema: 22 tables with full multi-tenant architecture
- Dashboard navigation shell (responsive sidebar + header + 8 page stubs)
- Auth layout with login/register page stubs
- Better Auth configuration stub (not yet functional)
- Double Jack Properties seed script (6 buildings, 37 units, ~33 tenants, leases, vendor, 2024 financials)
- Configuration: .env.example, drizzle.config.ts, package.json scripts
- Project documentation: TASKS.md, PROJECT_STATE.md, AGENTS.md

## What Works
- `npm run dev` — starts the development server with Turbopack
- `npm run build` — builds the production app
- `npm run lint` — runs ESLint
- Dashboard sidebar navigation between all sections
- Responsive layout (mobile sidebar via Sheet)

## What Does NOT Work Yet
- No database connection (needs DATABASE_URL environment variable)
- No authentication (Better Auth configured but login/register not wired up)
- No CRUD operations (page stubs with placeholders only)
- No API routes (directory structure only)
- No external integrations (Stripe, Plaid, Twilio, Resend)
- No tests

## Blockers
| Blocker | Required For | Owner |
|---------|-------------|-------|
| DATABASE_URL (Railway Postgres) | TASK-170: DB connection | Brian |
| BETTER_AUTH_SECRET | TASK-100: Authentication | Brian |
| Stripe account credentials | TASK-200: Payment processing | Brian |
| Plaid developer account | TASK-204: Bank sync | Brian |
| Domain name registration | TASK-405: Marketing site | Brian |

## Decisions Made
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-27 | Next.js 16 (latest) over Next.js 15 | create-next-app installed 16.1.6 as latest stable; better React 19 support |
| 2026-02-27 | Tailwind CSS v4 (already included) | Next.js 16 scaffolding includes Tailwind v4 by default |
| 2026-02-27 | shadcn/ui for component library | Radix UI primitives with accessibility built-in, as specified in project plan |
| 2026-02-27 | Better Auth over Lucia | Project plan preference; Drizzle adapter, email/password + magic link support |
| 2026-02-27 | UUID primary keys | Better for distributed systems, no sequential ID leaking |
| 2026-02-27 | Deferred Twilio/Plaid/S3 package installs | Not needed in Phase 0; avoid unused dependencies |

## Key Metrics
| Metric | Value |
|--------|-------|
| Schema tables | 22 |
| UI components (shadcn) | 16 |
| Dashboard pages | 8 stubs |
| Auth pages | 2 stubs |
| npm scripts | 10 |
| Double Jack units in seed | 37 |
| Phase 1 tasks | ~18 |

## Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.1.6 |
| Language | TypeScript | 5.x |
| Runtime | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui (Radix) | 3.8.5 |
| ORM | Drizzle | 0.45.1 |
| Database | PostgreSQL | (via Railway) |
| Auth | Better Auth | 1.4.19 |
| Payments | Stripe | 20.4.0 |
| Validation | Zod | 4.3.6 |
| Icons | Lucide React | 0.575.0 |
| Dev Server | Turbopack | (built into Next.js) |
