# PropForge Task Board

## ✅ Phase 0: Foundation (Complete)
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

## 🔴 Phase 1: Core Property Management (In Progress)

### Authentication & Authorization
- [ ] TASK-100: Better Auth integration (email/password signup and login)
  - **Priority:** P0
  - **Depends on:** None
  - **Acceptance criteria:**
    - Login and register forms functional
    - Session management with HTTP-only cookies
    - Protected routes via middleware
    - Logout functionality

- [ ] TASK-101: Organization onboarding flow
  - **Priority:** P0
  - **Depends on:** TASK-100
  - **Acceptance criteria:**
    - New users create an organization during signup
    - Organization members table populated
    - Default owner role assigned

- [ ] TASK-102: Role-based access control middleware
  - **Priority:** P1
  - **Depends on:** TASK-100, TASK-101
  - **Acceptance criteria:**
    - Route protection by role (owner, manager, staff, viewer)
    - API routes check permissions
    - Tenant portal routes isolated from dashboard

### Property & Unit Management
- [ ] TASK-110: Properties CRUD (list, create, edit, detail view)
  - **Priority:** P0
  - **Depends on:** TASK-100
  - **Acceptance criteria:**
    - Properties list page with search/filter
    - Create property form with address validation
    - Property detail page showing buildings and units
    - Edit property details

- [ ] TASK-111: Buildings CRUD
  - **Priority:** P0
  - **Depends on:** TASK-110
  - **Acceptance criteria:**
    - Buildings nested under properties
    - Create/edit building with unit count
    - Building detail showing units

- [ ] TASK-112: Units CRUD with status management
  - **Priority:** P0
  - **Depends on:** TASK-111
  - **Acceptance criteria:**
    - Units list with filters (status, building, type)
    - Create/edit unit with all fields
    - Status transitions (vacant -> occupied, etc.)
    - Unit detail page with current tenant/lease info

### Tenant Management
- [ ] TASK-120: Tenants CRUD (list, create, edit, detail)
  - **Priority:** P0
  - **Depends on:** TASK-100
  - **Acceptance criteria:**
    - Tenant list with search
    - Create tenant with PII fields
    - Tenant detail showing leases, payments, maintenance requests
    - PII encryption at application level

- [ ] TASK-121: Tenant portal foundation
  - **Priority:** P1
  - **Depends on:** TASK-100, TASK-120
  - **Acceptance criteria:**
    - Separate tenant portal layout
    - Tenant can view their lease details
    - Tenant can view payment history
    - Tenant can submit maintenance requests

### Lease Management
- [ ] TASK-130: Leases CRUD (create, view, edit, status transitions)
  - **Priority:** P0
  - **Depends on:** TASK-112, TASK-120
  - **Acceptance criteria:**
    - Create lease linking unit + tenant
    - Lease detail page with all terms
    - Status transitions (draft -> active -> expired/terminated)
    - Lease expiration tracking (90/60/30 day alerts)

- [ ] TASK-131: Lease document management
  - **Priority:** P2
  - **Depends on:** TASK-130
  - **Acceptance criteria:**
    - Upload lease PDFs
    - Associate documents with leases
    - Download/view documents

### Maintenance
- [ ] TASK-140: Maintenance request system
  - **Priority:** P0
  - **Depends on:** TASK-112, TASK-120
  - **Acceptance criteria:**
    - Create request (with category, priority, description)
    - Auto-triage emergency requests
    - Status workflow (submitted -> acknowledged -> in_progress -> completed)
    - Assign to vendor
    - Photo upload support

- [ ] TASK-141: Vendor management
  - **Priority:** P1
  - **Depends on:** TASK-140
  - **Acceptance criteria:**
    - Vendor CRUD
    - Vendor performance metrics
    - Work order tracking
    - Annual spend tracking

### Dashboard & Reporting
- [ ] TASK-150: Dashboard overview with KPI cards
  - **Priority:** P1
  - **Depends on:** TASK-112, TASK-130
  - **Acceptance criteria:**
    - Occupancy rate
    - Total revenue (current month)
    - Open maintenance requests
    - Upcoming lease expirations
    - Recent activity feed

- [ ] TASK-151: Data tables with sorting, filtering, pagination
  - **Priority:** P0
  - **Depends on:** None (shared component)
  - **Acceptance criteria:**
    - Reusable DataTable component
    - Server-side sorting and filtering
    - Pagination
    - Column visibility toggles

### API Layer
- [ ] TASK-160: REST API routes (v1) for all core entities
  - **Priority:** P1
  - **Depends on:** TASK-110 through TASK-141
  - **Acceptance criteria:**
    - GET/POST/PATCH/DELETE for properties, units, tenants, leases, maintenance
    - Consistent error handling
    - Zod request validation
    - Paginated list endpoints
    - OpenAPI-compatible responses

### Infrastructure
- [ ] TASK-170: Database connection and migration setup
  - **Priority:** P0
  - **Depends on:** None
  - **Blocked by:** DATABASE_URL (Brian needs to set up Railway Postgres)
  - **Acceptance criteria:**
    - Database connection works
    - `db:push` creates all tables
    - `db:seed` populates Double Jack data
    - Migrations can be generated

- [ ] TASK-171: Error handling and loading states
  - **Priority:** P1
  - **Depends on:** None
  - **Acceptance criteria:**
    - Global error boundary
    - Loading skeletons for pages
    - Toast notifications for actions (sonner)
    - Form validation error display

## 🔵 Phase 2: Financial Engine (Backlog)
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

## 🔵 Phase 3: Agent Layer (Backlog)
- [ ] TASK-300: OpenAPI 3.1 spec generation
- [ ] TASK-301: MCP server (TypeScript)
- [ ] TASK-302: OAuth 2.0 for agent authentication
- [ ] TASK-303: Tool definitions with agent-oriented descriptions
- [ ] TASK-304: Rate limiting per API key
- [ ] TASK-305: Webhook system
- [ ] TASK-306: llms.txt for AI discoverability
- [ ] TASK-307: TypeScript SDK from OpenAPI spec

## 🔵 Phase 4: Polish & Launch (Backlog)
- [ ] TASK-400: Double Jack parallel run with AppFolio
- [ ] TASK-401: Edge cases (partial payments, proration, mid-month moves)
- [ ] TASK-402: Illinois landlord-tenant law compliance
- [ ] TASK-403: Mobile-responsive tenant portal
- [ ] TASK-404: Onboarding flow for new landlords
- [ ] TASK-405: Marketing site and pricing page
