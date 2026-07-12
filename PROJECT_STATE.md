# PropForge Project State

**Last updated:** 2026-07-12
**Updated by:** Orchestrator
**Current Phase:** Phase A (Trustworthy Foundation) Complete — Phase B (Money In) Next
**Next Milestone:** First real rent payment collected through PropForge (target: Sept 1 cycle)

---

## Strategy (approved 2026-07-12)

**Dogfood first, then sell.** Brian's real portfolio — Double Jack Properties (37 units,
6 buildings) plus the newly acquired 630 DJ LLC building (4 units) — runs entirely on
PropForge including rent collection, replacing AppFolio (~$300/mo → ~$3,600/yr saved).
Two clean rent cycles + accountant-verified financials gate the AppFolio cancellation
(~Nov 1). Only then does Phase D (selling to other small landlords) begin.

**Revenue model:** free-to-start SaaS (free ≤3 units, ~$1.50–2/unit/mo after, no
minimums) + payment economics (ACH default with tenant-paid convenience fee via Stripe
Connect; card fees passed through) + applicant-paid tenant screening (Phase D). The
Innago/TurboTenant playbook, not AppFolio per-unit minimums.

## What's Built
- Next.js 16.1.6, TypeScript, Tailwind v4, App Router; shadcn/ui (18 components)
- Drizzle schema: 28 tables (24 domain + 4 Better Auth) with organizationId multi-tenancy
- **Real authentication (restored 2026-07-12):** Better Auth email/password + optional
  Google, real session resolution with org membership lookup, optional HMAC-cookie
  pre-launch gate (GATE_PASSWORD env), Zod-validated env schema
- Full CRUD: Properties, Buildings, Units, Tenants, Leases, Maintenance, Vendors
- Dashboard with KPI cards + charts from real aggregated SQL
- Tenant detail tabs show real leases/payments/maintenance (bug fixed 2026-07-12)
- Real settings page: org profile edit (admin+ gate), members list
- AppFolio CSV importer (rent roll, receipts, occupancy) + Gmail ingest webhook —
  the future customer-migration wedge
- REST API v1 (session-auth; API-key auth deferred to Phase E)
- **Test harness:** Vitest vs real Postgres — 38 tests including a 28-test cross-tenant
  isolation suite (the compensating control for service-layer-only tenancy, no RLS);
  CSV import round-trips; dashboard SQL. 4 Playwright smoke tests (register→onboard→
  dashboard, sign-in, property create, auth redirect)
- **CI:** GitHub Actions — lint/typecheck/vitest/build on PRs; Playwright e2e on main
- **Migrations:** baseline generated; fresh envs use db:migrate;
  scripts/mark-migrations-applied.ts adopts the existing prod DB one-time

## What Works (verified 2026-07-12)
- `npm run typecheck` — zero errors; `npm run lint` — zero errors (13 pre-existing warnings)
- `npm run build` — compiles clean, 34 routes
- `npm test` — 38/38 passing; `npm run test:e2e` — 4/4 passing against live dev server
- Full real auth flow: register → onboard (create org) → login → dashboard → logout
- Unauthenticated requests redirect to /login (middleware) and 401 on /api/v1

## What Does NOT Work Yet
- **No money features:** no charges/ledger, no record-payment flow, no Stripe code,
  no invoicing (payments rows only come from CSV import) — Phase B
- Financials page is a stub — Phase C
- Tenant portal — Phase B5 (magic-link auth via Resend)
- Google Sign-In wired but needs credentials (optional)
- Lease documents / maintenance photos (needs S3/R2) — Phase E
- Prod deploy steps pending after this merge (see Deploy Checklist)

## Deploy Checklist (next deploy of this branch)
1. Set env vars: `BETTER_AUTH_SECRET` (32+ chars), optionally `GATE_PASSWORD` (8+ chars),
   `DEFAULT_ORG_ID` (for Gmail ingest), `CRON_SECRET` (existing), `BETTER_AUTH_URL` /
   `NEXT_PUBLIC_APP_URL` (prod URL)
2. Run `npm run db:push` once against prod (adds the 4 Better Auth tables)
3. Run `npx tsx scripts/mark-migrations-applied.ts` once (adopts migration discipline)
4. Brian registers his account in the app, then run
   `npx tsx scripts/link-owner.ts <his-email>` to link him to the Double Jack org as owner
5. Future schema changes ship as migration files via `npm run db:migrate`

## Brian's TODO (external accounts — nothing blocks Phase B1–B3 work)
| Item | Needed for | When |
|------|-----------|------|
| Stripe platform account | TASK-B4 Connect onboarding | Before ~week 3 of Phase B |
| Resend account + domain verify | TASK-B5/B6 magic-link + receipts | Before ~week 4 of Phase B |
| Google OAuth credentials | Optional Google sign-in | Whenever |
| Plaid developer account | TASK-C7 (optional) | Only if C7 proceeds |
| Domain purchase + lawyer review | TASK-D4 | Phase D |

## Decisions Made
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-27 | Next.js 16, Tailwind v4, shadcn/ui, Better Auth, UUID PKs, service layer, Server Actions + REST, react-table, RHF+Zod | (see git history for details) |
| 2026-07-12 | **Dogfood-first strategy** | Replace AppFolio on Brian's 41 units before selling; the parallel-run validation is our own operation |
| 2026-07-12 | **Revenue: free-to-start + payment economics + tenant-paid fees** | Small landlords won't pay AppFolio-style minimums; headline "free" wins the segment |
| 2026-07-12 | **Two LLCs = one org + `entities` table** (not two orgs) | Org = tenancy boundary, entity = accounting/payout boundary; per-LLC Stripe Connect + P&L; "multiple LLCs, one login" is also the target customer's shape |
| 2026-07-12 | **Ledger = charges + payment_allocations, derived balances only** | Partial payments/proration/late fees need a charges side; stored running balances are where bugs live; idempotent charge gen via unique (leaseId, type, periodStart) |
| 2026-07-12 | **Tenant portal = same Better Auth + magic-link plugin, (portal) route group** | One session store; tenants never enter organizationMembers; zero-password UX |
| 2026-07-12 | **RLS deferred; cross-tenant isolation test suite is the compensating control** | Solo-founder velocity; revisit at >25 orgs or second engineer |
| 2026-07-12 | **Auth restored as first task** | Login had been silently reduced to a shared-password gate with a hardcoded owner session — unacceptable before handling money/PII |
| 2026-07-12 | Vitest against real Postgres (not PGlite/mocks) | db singleton + ~370 lines of raw SQL in dashboard service; test the real dialect |
| 2026-07-12 | Migration files from now on (was: db:push only) | Required before real payment data exists; baseline + adoption script committed |

## Key Metrics
| Metric | Value |
|--------|-------|
| Schema tables | 28 (24 domain + 4 auth) |
| Build routes | 34 |
| Automated tests | 38 Vitest + 4 Playwright |
| Real units to manage | 41 (Double Jack 37 + 630 DJ 4) |
| AppFolio bill to eliminate | ~$300/mo |
| Phase A tasks | 5/5 complete |

## Tech Stack
(unchanged: Next.js 16.1.6, React 19, TS 5, Tailwind 4, shadcn/ui, Drizzle 0.45,
Railway Postgres, Better Auth 1.4, RHF 7, react-table 8, Stripe 20 (unused until B4),
Zod 4, Resend 6 (unused until B5), Vitest 4, Playwright 1.x)

## GitHub
- Repo: https://github.com/bstrumillo/proplens (private)
- Default branch: main
- Current work: claude/codebase-overview-91bro1 (Phase A)
