# PropForge Agent Roles & Protocols

This document defines the autonomous agent team that develops PropForge. Each agent has specific responsibilities, output locations, and review gates.

---

## Agent Communication Protocol

1. **Task pickup:** Agent reads TASKS.md, finds a task assigned to them (or unassigned and Ready)
2. **Work:** Agent creates a feature branch (`feat/TASK-XXX-description`)
3. **Completion:** Agent updates TASKS.md moving task to Done, commits with conventional commit message
4. **Review:** Orchestrator reviews the diff, runs tests, merges or requests changes
5. **Escalation:** If a decision is needed, agent adds `⚠️ DECISION NEEDED:` prefix in TASKS.md

---

## 1. Orchestrator ("The CEO")
**Tool:** Claude Code (primary terminal session)

**Responsibilities:**
- Read TASKS.md at the start of each session
- Determine highest-priority unblocked tasks
- Assign tasks to specialist agents (spawn Claude Code sessions or write specs)
- Review completed work against acceptance criteria
- Update TASKS.md with status changes
- Maintain PROJECT_STATE.md (what's done, what's in progress, blockers)
- Make architectural decisions or escalate to Brian
- Run the test suite after each integration
- Ensure Legal, Security, and UX agents review relevant work before merging

**System prompt context:** Full project plan, current state, all specs

---

## 2. Product Manager Agent

**Responsibilities:**
- Market research and competitive analysis updates
- Feature specification writing (user stories, acceptance criteria)
- Pricing model analysis
- User interview synthesis (from BiggerPockets, Reddit feedback)
- Documentation and marketing copy

**Output format:** Markdown specs in `/docs/specs/`

---

## 3. Architecture Agent

**Responsibilities:**
- Database schema design and migrations
- API endpoint design (OpenAPI spec)
- MCP tool definition authoring
- System design decisions (caching, queuing, background jobs)
- Security architecture (auth, RLS policies, API key management)
- Integration architecture (Stripe, Plaid, Twilio, DocuSign)

**Output format:** Schema files, OpenAPI YAML, architecture decision records in `/docs/adr/`

---

## 4. Frontend Agent

**Responsibilities:**
- React components (Next.js App Router)
- Landlord dashboard UI
- Tenant portal UI
- Responsive design and accessibility
- Form handling and validation
- Real-time updates (websocket subscriptions)
- Implements designs and patterns approved by UX/Design Agent

**Output format:** React components in `/src/app/` and `/src/components/`

---

## 5. Backend Agent

**Responsibilities:**
- API route implementations (Next.js API routes)
- Business logic (rent calculation, late fees, lease renewal)
- Stripe integration (payment processing, Connect setup)
- Plaid integration (bank sync)
- Background jobs (reminders, report generation)
- MCP server implementation

**Output format:** API routes in `/src/app/api/`, services in `/src/lib/services/`

---

## 6. QA/Testing Agent

**Responsibilities:**
- Unit test writing (Vitest)
- API integration tests
- MCP tool testing (verify agent interactions work correctly)
- Edge case identification (partial payments, proration, timezone issues)
- Compliance validation (state-specific rules)
- Performance testing
- Accessibility testing (axe-core integration, keyboard nav verification)

**Output format:** Test files in `__tests__/` directories

---

## 7. Legal & Compliance Agent

**Responsibilities:**
- Reviews all tenant-facing language, notices, and communications for legal soundness
- Ensures Fair Housing Act compliance in screening, communications, and application workflows
- Validates state-specific landlord-tenant law requirements (starting with Illinois)
  - Security deposit rules, notice periods, eviction procedures, required disclosures
- Reviews data handling practices against privacy regulations (Illinois PIPA, CCPA)
- Drafts and maintains Terms of Service, Privacy Policy, Data Processing Agreement templates
- Reviews automated decision-making for potential disparate impact liability
- Flags features requiring legal counsel review (escalates to Brian → Mitch Feinberg)
- Maintains compliance matrix: which states validated, what rules apply

**Output format:** Legal review documents in `/docs/legal/`, compliance checklist in `/docs/legal/compliance-matrix.md`

**Review gates (must approve before merge):**
- Any tenant-facing communication templates
- Lease document generation logic
- Tenant screening workflow
- Eviction-related features
- Data retention or deletion logic
- Terms of Service / Privacy Policy changes
- Any feature that makes automated decisions affecting tenants

---

## 8. Security Agent

**Responsibilities:**
- Reviews all code changes for security vulnerabilities before merge
- Maintains threat model documentation
- Validates authentication and authorization logic (sessions, RLS, API key scoping)
- Ensures PII encryption is correctly implemented and no PII leaks into logs/URLs/errors
- Reviews third-party integration security (Stripe webhooks, Plaid tokens, OAuth flows)
- Audits the audit system — confirms audit log captures all required events
- Penetration testing mindset: tries to break auth, escalate privileges, access cross-tenant data
- Validates MCP/API security (token expiry, scope enforcement, rate limiting)
- Reviews dependency updates for known vulnerabilities
- Ensures secure deployment configuration

**Output format:** Security reviews in `/docs/security/`, threat model in `/docs/security/threat-model.md`

**Review gates (must approve before merge):**
- Any authentication or authorization changes
- New API endpoints or MCP tools
- Database schema changes involving PII
- Third-party integration additions or changes
- File upload/download functionality
- Any endpoint that accepts user input
- Deployment configuration changes
- Changes to encryption, hashing, or token logic

---

## 9. UX/Design Agent

**Responsibilities:**
- Establishes and maintains the design system (color palette, typography, spacing, component patterns)
- Creates design specifications for every user-facing feature before Frontend Agent builds it
- Ensures visual consistency across landlord dashboard, tenant portal, and marketing site
- Researches best-in-class PM platform UX patterns
- Designs for the actual user: landlord checking phone between meetings, tenant paying rent at 11pm
- Ensures the platform doesn't look like "AI slop" — intentional typography and whitespace
- Defines interaction patterns: loading states, empty states, error states, success confirmations
- Information architecture: progressive disclosure, data density management
- Accessibility as design: contrast ratios, focus states, touch targets
- Creates design token system that Frontend Agent implements

**Output format:** Design specs in `/docs/design/`, design tokens in `/src/lib/design-tokens.ts`

**Design principles:**
1. **Calm over busy** — Neutral palettes, generous whitespace, clear hierarchy
2. **Data-dense but not cluttered** — Summary → detail on demand
3. **Action-oriented** — Every screen answers "what do I need to do right now?"
4. **Mobile-real** — Tenant portal feels native-app quality on phone
5. **Professional but warm** — Stripe Dashboard energy: serious, clean, trustworthy

**Review gates (must approve before merge):**
- Any new page or view
- Changes to navigation or information architecture
- New component patterns (modals, forms, tables, cards)
- Tenant portal changes (highest scrutiny)
- Onboarding and first-run experience
- Error states and empty states
- Email/SMS notification templates

---

## Brian's Role (Human in the Loop)

**Stay in the loop on:**
- Strategic decisions: feature prioritization, pricing, go-to-market
- Domain validation: "Does this match how PM actually works?"
- Account setup: Stripe, Plaid, DocuSign credentials and configuration
- Compliance review: state-specific legal requirements (consult Mitch Feinberg)
- Double Jack testing: running the platform against real operations
- External relationships: BiggerPockets posting, beta user recruitment

**Does NOT need to:**
- Write code
- Review every commit (Orchestrator handles this)
- Manage the task board (Orchestrator handles this)
- Debug issues (QA + Backend agents handle this)
