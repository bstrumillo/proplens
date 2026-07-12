# PropForge Task Board

## Phase 0: Foundation (Complete)
- [x] TASK-001: Initialize Next.js 16 project with TypeScript, Tailwind v4, App Router
  - **Completed:** 2026-02-27
  - **Notes:** Using Next.js 16.1.6, React 19, Tailwind CSS v4, Turbopack

- [x] TASK-002: Install core dependencies
  - **Completed:** 2026-02-27
  - **Notes:** drizzle-orm, pg, better-auth, zod, stripe, resend, shadcn/ui, lucide-react

- [x] TASK-003: Create full directory structure
  - **Completed:** 2026-02-27
  - **Notes:** App Router route groups, API routes, lib, components, docs, scripts

- [x] TASK-004: Define complete Drizzle schema (22 tables)
  - **Completed:** 2026-02-27
  - **Notes:** Multi-tenant with organization_id, PII encryption markers, full relations

- [x] TASK-005: Create dashboard navigation shell
  - **Completed:** 2026-02-27
  - **Notes:** Responsive sidebar, header, 8 page stubs, auth layout + pages

- [x] TASK-006: Create seed script with Double Jack Properties data
  - **Completed:** 2026-02-27
  - **Notes:** 6 buildings, 37 units, ~33 tenants, leases, vendor, 2024 financials

- [x] TASK-007: Configuration files and project documentation
  - **Completed:** 2026-02-27
  - **Notes:** .env.example, drizzle.config.ts, TASKS.md, PROJECT_STATE.md, AGENTS.md

- [x] TASK-008: Git initialization and initial commit
  - **Completed:** 2026-02-27

## Phase 1: Core Property Management (Complete)

### Authentication & Authorization
- [x] TASK-100: Better Auth integration (email/password signup and login)
  - **Completed:** 2026-02-27
  - **Notes:** Login/register forms wired, session cookies, middleware protection, logout

- [x] TASK-101: Organization onboarding flow
  - **Completed:** 2026-02-27
  - **Notes:** /onboarding page creates org + owner membership after registration

- [x] TASK-102: Role-based access control middleware
  - **Completed:** 2026-02-27
  - **Notes:** Role hierarchy (owner > admin > manager > staff > viewer), enforced at action/API level

### Property & Unit Management
- [x] TASK-110: Properties CRUD (list, create, edit, detail view)
  - **Completed:** 2026-02-27
  - **Notes:** DataTable with search, property form dialog, detail page with buildings

- [x] TASK-111: Buildings CRUD
  - **Completed:** 2026-02-27
  - **Notes:** Nested under property detail, building form dialog, building count on property list

- [x] TASK-112: Units CRUD with status management
  - **Completed:** 2026-02-27
  - **Notes:** DataTable with filters (status, building, type), unit form, status badges, detail page

### Tenant Management
- [x] TASK-120: Tenants CRUD (list, create, edit, detail)
  - **Completed:** 2026-02-27
  - **Notes:** DataTable with search, tenant form dialog, detail page with tabs (leases, maintenance)

- [ ] TASK-121: Tenant portal foundation
  - **Priority:** P1
  - **Status:** Deferred to Phase 2+
  - **Notes:** Requires separate portal layout with tenant-specific auth flow

### Lease Management
- [x] TASK-130: Leases CRUD (create, view, edit, status transitions)
  - **Completed:** 2026-02-27
  - **Notes:** DataTable, lease form with unit/tenant selectors, lease-unit status sync (activate/terminate)

- [ ] TASK-131: Lease document management
  - **Priority:** P2
  - **Status:** Deferred to Phase 2+
  - **Notes:** Needs file storage integration (S3/R2)

### Maintenance
- [x] TASK-140: Maintenance request system
  - **Completed:** 2026-02-27
  - **Notes:** DataTable with filters, request form, emergency auto-acknowledge, status timeline, detail page

- [x] TASK-141: Vendor management
  - **Completed:** 2026-02-27
  - **Notes:** Full CRUD under /maintenance/vendors, sidebar sub-navigation

### Dashboard & Reporting
- [x] TASK-150: Dashboard overview with KPI cards
  - **Completed:** 2026-02-27
  - **Notes:** 4 KPI cards (occupancy, revenue, maintenance, expiring leases) + recent/expiring lease cards

- [x] TASK-151: Data tables with sorting, filtering, pagination
  - **Completed:** 2026-02-27
  - **Notes:** Generic DataTable with @tanstack/react-table, reused across all list pages

### API Layer
- [x] TASK-160: REST API routes (v1) for all core entities
  - **Completed:** 2026-02-27
  - **Notes:** Full CRUD endpoints under /api/v1/ for properties, buildings, units, tenants, leases, maintenance, vendors

### Infrastructure
- [x] TASK-170: Database connection and migration setup
  - **Completed:** 2026-02-27
  - **Notes:** Railway Postgres connected, db:push creates tables, seed script works

- [x] TASK-171: Error handling and loading states
  - **Completed:** 2026-02-27
  - **Notes:** Error boundaries (dashboard + auth), 404 pages, loading skeletons, toast notifications

### Deferred Tasks
- [ ] TASK-180: Google Sign-In integration
  - **Priority:** P1
  - **Status:** Code wired but credentials needed
  - **Notes:** Better Auth Google provider configured, UI buttons in place. Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local

---

> **Roadmap revised 2026-07-12** per the approved "Dogfood Double Jack, Then Sell" plan.
> Strategy: run Brian's own ~41 units (Double Jack 37 + 630 DJ LLC 4) end-to-end on
> PropForge including real rent collection, cancel AppFolio (~$300/mo), then sell to
> other small landlords. Old Phase 2–4 tasks are superseded by Phases A–E below.

## Phase A: Trustworthy Foundation (Complete 2026-07-12)
- [x] TASK-A1: Restore real Better Auth authentication
  - **Completed:** 2026-07-12
  - **Notes:** Auth had been silently disabled (hardcoded session, shared-password gate).
    Restored: Better Auth tables in schema, real session resolution + membership lookup,
    real /login, optional HMAC-cookie /gate curtain (GATE_PASSWORD env, no fallback),
    fail-closed ingest route, Zod-validated env (src/lib/env.ts), scripts/link-owner.ts
- [x] TASK-A2: Fix tenant detail tabs (hardcoded empty states)
  - **Completed:** 2026-07-12
  - **Notes:** Leases/Payments/Maintenance tabs now query real data; new payments read service
- [x] TASK-A3: Real settings page
  - **Completed:** 2026-07-12
  - **Notes:** Org profile edit (admin+ gate), members list, Phase B placeholder cards
- [x] TASK-A4: Test harness + CI
  - **Completed:** 2026-07-12
  - **Notes:** Vitest vs real Postgres; 28-test cross-tenant isolation suite (compensating
    control for no-RLS); CSV import round-trip; dashboard SQL tests; 4 Playwright smoke
    tests; GitHub Actions (PR: lint/typecheck/test/build; main: e2e)
- [x] TASK-A5: Migration discipline
  - **Completed:** 2026-07-12
  - **Notes:** Baseline migration (28 tables), db:migrate for fresh envs,
    scripts/mark-migrations-applied.ts for one-time prod adoption

## Phase B: Money In (target: Sept 1 first payment, Oct 1 broad rollout)
- [ ] TASK-B1: Entities + ledger schema
  - **Notes:** `entities` table (one org, per-LLC Stripe Connect), `properties.entityId`,
    `charges` + `payment_allocations` tables, unique index (leaseId, type, periodStart).
    Data entry: create both LLC entities, tag properties, enter 630 DJ's 4 units via UI
- [ ] TASK-B2: Payments/ledger service + UI
  - **Notes:** recordManualPayment (FIFO allocation), createCharge, voidCharge,
    getLeaseLedger, derived balances ONLY (never stored). Heaviest test coverage in repo:
    partial/over-payment, multi-charge allocation, proration (actual-days-in-month), void
- [ ] TASK-B3: Charge engine crons
  - **Notes:** /api/cron/generate-charges (idempotent, prorated) + /api/cron/late-fees
    (grace period from lease), CRON_SECRET bearer auth. Cutover ~Sept 1; legacy imports unallocated
- [ ] TASK-B4: Stripe Connect onboarding
  - **⚠️ BRIAN:** create Stripe platform account first (~1 day incl. verification)
  - **Notes:** Express account per entity (KYC twice — one per LLC), onboarding from
    settings, webhook route with signature verification
- [ ] TASK-B5: Tenant portal + online payments (critical path)
  - **Notes:** Better Auth magic-link plugin (Resend), (portal) route group,
    requireTenantSession, Stripe Checkout on entity's connected account, ACH default,
    webhook state machine (allocate only on completed; de-allocate on failure), isolation tests
- [ ] TASK-B6: Receipts + late notices via Resend
  - **⚠️ BRIAN:** create Resend account + verify sending domain
- [ ] TASK-B7: Autopay (may slip to Phase C)
  - **Notes:** SetupIntent → paymentMethods, due-date off-session PaymentIntent cron

## Phase C: Money Visible (target: AppFolio cancelled ~Nov 1)
- [ ] TASK-C1: Schedule E system categories seed + financials service
- [ ] TASK-C2: Auto-post income transactions from completed payments (+ legacy backfill)
- [ ] TASK-C3: Manual expense entry (fast dialog; optional work-order link)
- [ ] TASK-C4: Real financials page (transaction table, filters, re-categorization)
- [ ] TASK-C5: Reports: P&L per entity + property (Schedule E layout), owner cash flow,
      CSV export + print-styled PDF page
- [ ] TASK-C6: Importer extension: AppFolio expense/GL CSVs → financialTransactions
- [ ] TASK-C7: Plaid bank sync (optional tail — cut if it threatens the cancellation milestone)
  - **⚠️ BRIAN:** Plaid developer account (only if C7 proceeds)

## Phase D: Sellable (only after AppFolio cancelled)
- [ ] TASK-D1: Security pass (remove gate, rate-limit auth endpoints, email verification,
      isolation suite expanded to portal + financials; RLS explicitly deferred)
- [ ] TASK-D2: Self-serve onboarding wedge (guided CSV import wizard: column mapping,
      dry-run preview) — "AppFolio portfolio live in 15 minutes"
- [ ] TASK-D3: SaaS billing (Stripe Billing; free ≤3 units, ~$15–25/mo beyond;
      flip application_fee on external orgs' rent payments)
- [ ] TASK-D4: Marketing site + legal ((marketing) route group, pricing, ToS/privacy
      + one-time lawyer review)
  - **⚠️ BRIAN:** buy domain; lawyer review budget (few hundred $)
- [ ] TASK-D5: Beta cohort — 5–10 local landlords, white-glove imports, weekly feedback
- [ ] TASK-D6: Tenant screening partner (applicant-paid; first to cut if beta redirects)

## Phase E: Explicitly Deferred (revisit ~Feb 2027)
- Agent/MCP layer + real API-key auth (build together when there's a consumer)
- Native mobile apps (responsive web/PWA only)
- Multi-state compliance, lease e-signing, document generation
- Full Postgres RLS (isolation test suite is the compensating control)
- Communications center UI, Twilio SMS, QuickBooks export, trust accounting, vendor portal
- Lease document / maintenance photo upload (needs S3/R2 — small standalone task if needed)

## Superseded task mapping (old → new)
- TASK-121 (tenant portal) → TASK-B5 · TASK-131 (lease docs) → Phase E
- TASK-180 (Google sign-in) → optional Brian TODO (code ready, needs credentials)
- TASK-200→B4 · 201→B5 · 202→B7 · 203→B3 · 204→C7 · 205→C1/C4 · 206→C5 · 207→C5 · 208→C5
- TASK-300–307 (agent layer) → Phase E
- TASK-400 (parallel run) → Phase B/C definition-of-done · 401→B2 tests · 402→D4
- TASK-403→B5 · 404→D2 · 405→D4
