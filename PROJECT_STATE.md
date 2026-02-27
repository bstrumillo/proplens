# PropForge Project State

**Last updated:** 2026-02-27
**Updated by:** Orchestrator
**Current Phase:** Phase 1 Complete — Phase 2 Next
**Next Milestone:** Phase 2 — Financial Engine (blocked by Stripe credentials)

---

## What's Built
- Next.js 16.1.6 project with TypeScript, Tailwind CSS v4, App Router
- shadcn/ui component library (18 components)
- Drizzle ORM schema: 22 tables with full multi-tenant architecture
- Railway Postgres database connected and seeded with Double Jack Properties data
- Full authentication: email/password login/register, organization onboarding, RBAC
- Dashboard with KPI cards (occupancy, revenue, maintenance, expiring leases)
- Complete CRUD for: Properties, Buildings, Units, Tenants, Leases, Maintenance, Vendors
- REST API v1 for all entities under /api/v1/
- Service layer pattern with organizationId-based multi-tenancy
- Server Actions for UI forms, REST API for external consumption
- DataTable component with sorting, filtering, pagination (reused everywhere)
- Error boundaries, 404 pages, loading skeletons, toast notifications
- CLAUDE.md autonomous agent instructions for cross-session continuity

## What Works
- `npm run dev` — starts the development server with Turbopack
- `npm run build` — builds production app (33 routes, zero errors)
- `npm run typecheck` — zero errors
- `npm run lint` — zero errors (12 warnings: unused imports only)
- Full auth flow: register -> onboard (create org) -> login -> dashboard
- All CRUD operations via UI: properties, buildings, units, tenants, leases, maintenance, vendors
- Dashboard KPIs with real aggregated data from database
- Lease-unit status sync (activate lease -> unit occupied, terminate -> unit vacant)
- Emergency maintenance auto-acknowledge
- REST API endpoints with auth protection
- Middleware auth redirect for unauthenticated users
- Responsive layout (mobile sidebar via Sheet)

## What Does NOT Work Yet
- Google Sign-In (code wired, needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
- Tenant portal (separate portal layout, deferred)
- Lease document upload/management (needs file storage)
- Payment processing (needs Stripe)
- Bank sync (needs Plaid)
- No automated tests yet
- No external integrations (Stripe, Plaid, Twilio, Resend)

## Blockers
| Blocker | Required For | Owner | Status |
|---------|-------------|-------|--------|
| ~~DATABASE_URL~~ | ~~TASK-170~~ | ~~Brian~~ | **RESOLVED** |
| ~~BETTER_AUTH_SECRET~~ | ~~TASK-100~~ | ~~Brian~~ | **RESOLVED** |
| Google OAuth credentials | TASK-180: Google Sign-In | Brian | Pending |
| Stripe account credentials | TASK-200: Payment processing | Brian | Pending (Phase 2) |
| Plaid developer account | TASK-204: Bank sync | Brian | Pending (Phase 2) |
| Domain name registration | TASK-405: Marketing site | Brian | Pending (Phase 4) |

## Decisions Made
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-27 | Next.js 16 (latest) over Next.js 15 | create-next-app installed 16.1.6 as latest stable; better React 19 support |
| 2026-02-27 | Tailwind CSS v4 (already included) | Next.js 16 scaffolding includes Tailwind v4 by default |
| 2026-02-27 | shadcn/ui for component library | Radix UI primitives with accessibility built-in |
| 2026-02-27 | Better Auth over Lucia | Project plan preference; Drizzle adapter, email/password + magic link support |
| 2026-02-27 | UUID primary keys | Better for distributed systems, no sequential ID leaking |
| 2026-02-27 | Service layer pattern | Pure async functions with organizationId as first param. Reused by both Server Actions and API routes. |
| 2026-02-27 | Server Actions for UI, REST API for external | Best DX for forms via Server Actions, REST for agents/integrations |
| 2026-02-27 | @tanstack/react-table for DataTable | Generic, server-side pagination/sorting/filtering, URL param state |
| 2026-02-27 | React Hook Form + Zod for forms | Client + server validation with shared schemas |
| 2026-02-27 | Middleware for auth, RBAC at action level | Lightweight session check in middleware, role checks in actions/APIs |
| 2026-02-27 | Google Sign-In deferred | Code wired but credentials needed; can proceed without it |

## Key Metrics
| Metric | Value |
|--------|-------|
| Schema tables | 22 |
| UI components (shadcn) | 18 |
| Dashboard pages | 8 (fully functional) |
| Auth pages | 3 (login, register, onboarding) |
| API routes | 14 endpoints |
| Build routes | 33 |
| Double Jack units (seeded) | 37 |
| Phase 1 tasks completed | 16/18 (2 deferred) |

## Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.1.6 |
| Language | TypeScript | 5.x |
| Runtime | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui (Radix) | 3.8.5 |
| ORM | Drizzle | 0.45.1 |
| Database | PostgreSQL | Railway |
| Auth | Better Auth | 1.4.19 |
| Forms | React Hook Form | 7.x |
| Tables | @tanstack/react-table | 8.x |
| Payments | Stripe | 20.4.0 |
| Validation | Zod | 4.3.6 |
| Icons | Lucide React | 0.575.0 |
| Dev Server | Turbopack | (built into Next.js) |

## GitHub
- Repo: https://github.com/bstrumillo/propforge (private)
- Branch: main
