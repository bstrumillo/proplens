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

## Phase 2: Financial Engine (Backlog)
- [ ] TASK-200: Stripe Connect integration
  - **Priority:** P1
  - **Blocked by:** Stripe account setup (Brian action item)
- [ ] TASK-201: Tenant payment portal (ACH + card)
- [ ] TASK-202: Auto-pay enrollment
- [ ] TASK-203: Late fee automation
- [ ] TASK-204: Plaid bank sync
  - **Blocked by:** Plaid account setup (Brian action item)
- [ ] TASK-205: Transaction categorization
- [ ] TASK-206: P&L report generation
- [ ] TASK-207: Cash flow dashboard
- [ ] TASK-208: Schedule E report generation

## Phase 3: Agent Layer (Backlog)
- [ ] TASK-300: OpenAPI 3.1 spec generation
- [ ] TASK-301: MCP server (TypeScript)
- [ ] TASK-302: OAuth 2.0 for agent authentication
- [ ] TASK-303: Tool definitions with agent-oriented descriptions
- [ ] TASK-304: Rate limiting per API key
- [ ] TASK-305: Webhook system
- [ ] TASK-306: llms.txt for AI discoverability
- [ ] TASK-307: TypeScript SDK from OpenAPI spec

## Phase 4: Polish & Launch (Backlog)
- [ ] TASK-400: Double Jack parallel run with AppFolio
- [ ] TASK-401: Edge cases (partial payments, proration, mid-month moves)
- [ ] TASK-402: Illinois landlord-tenant law compliance
- [ ] TASK-403: Mobile-responsive tenant portal
- [ ] TASK-404: Onboarding flow for new landlords
- [ ] TASK-405: Marketing site and pricing page
