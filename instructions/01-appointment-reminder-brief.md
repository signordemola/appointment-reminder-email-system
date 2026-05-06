# Appointment Reminder Email System — Full Build Brief

> Status: **Already built** — Turborepo (NestJS + Next.js)  
> Stack: Next.js · NestJS · Neon (PostgreSQL) · Prisma · Resend · @nestjs/schedule  
> Deployment: Vercel (frontend) · Render (backend) · Neon (database)  
> Research baseline: April 2026

---

## Table of Contents

1. [What This Project Is Really Selling](#1-what-this-project-is-really-selling)
2. [Marketplace Demand Signal](#2-marketplace-demand-signal)
3. [Foreign Market Expectations](#3-foreign-market-expectations)
4. [Business & Customer Pain Points](#4-business--customer-pain-points)
5. [Product Definition & MVP Scope](#5-product-definition--mvp-scope)
6. [Core Data Model](#6-core-data-model)
7. [Confirmed Stack](#7-confirmed-stack)
8. [Backend Architecture (NestJS)](#8-backend-architecture-nestjs)
9. [Frontend Architecture (Next.js)](#9-frontend-architecture-nextjs)
10. [Pages Reference](#10-pages-reference)
11. [Components Reference](#11-components-reference)
12. [Frontend Patterns](#12-frontend-patterns)
13. [Build Order](#13-build-order)
14. [AI Integration](#14-ai-integration)
15. [Email Templates](#15-email-templates)
16. [Security Rules](#16-security-rules)
17. [Demo Deployment Notes](#17-demo-deployment-notes)

---

## 1. What This Project Is Really Selling

This is not "an email reminder tool."

It is a small appointment operations system that helps a business answer:
- Did every client receive their reminder?
- Who has confirmed and who has not?
- When something changes — reschedule, cancellation — did the old reminders stop firing?
- What is the no-show rate this week?

**The gap this fills:** Generic tools like Calendly send one reminder per booking. If the client reschedules, the old reminder keeps firing. If the appointment is canceled, the confirmation still goes out. Your system has a proper state machine — status transitions cancel or regenerate reminders automatically. That is what you are selling.

**Positioning statement:**  
*"A coded reminder and confirmation system that reduces no-shows, captures confirmations, and gives service businesses a clear view of every reminder sent — without the ghost messages and broken sequences of generic tools."*

**Best-fit buyers:**
- Independent salons and beauty studios
- Private clinics and therapy practices
- Coaches and consultants
- Any service business with 5–30 appointments per day and a manual reminder process

---

## 2. Marketplace Demand Signal

**Fiverr:** Active demand for appointment reminder automation, no-show reduction systems, and clinic communication workflows. Most competition is Zapier/GoHighLevel setups — no state machine, no dashboard, no reschedule handling.

**Upwork:** Buyers post specifically for "appointment reminder systems that handle reschedules," "confirmation tracking," and "reminder workflow with dashboard." These buyers have tried basic tools and outgrown them.

**Contra:** Case studies framing this as "the system that recovered $15,000 per year in no-show revenue and eliminated the 45 minutes of daily reminder calls" outperform feature-list presentations.

**Winning angle:**  
Not: *"I send reminder emails."*  
Yes: *"I build a reminder workflow that knows the state of every appointment and acts correctly at every stage — including when something changes."*

---

## 3. Foreign Market Expectations

Target markets: USA, UK, Canada, Australia.

What Square Appointments, SimplePractice, and Calendly all treat as standard:
- Reminder at configurable lead time (24h, 1h)
- Confirmation request separate from reminder
- Reschedule path that regenerates future reminders
- Status visibility — confirmed vs unconfirmed vs no-show
- Delivery tracking — sent, delivered, failed

**Minimum believable standard:**
- Confirmation request sent on appointment creation
- Reminder at 24h before
- Reminder at 1h before
- Reschedule request form
- Dashboard showing status of every reminder

---

## 4. Business & Customer Pain Points

**Business:**
- Staff spend 30–45 minutes per day making manual reminder calls
- No-show rate of 10–20% without automated reminders
- When an appointment is rescheduled, old reminders continue firing — clients get confused
- No single view of who has confirmed and who has not
- Failed or bounced reminders are invisible until the client complains

**Customer:**
- Forgets the appointment — the single most fixable cause of no-shows (37.6% of no-shows are simply forgotten — UC Davis Health)
- Receives a reminder after they already rescheduled — destroys trust
- Cannot confirm or reschedule without calling during business hours

---

## 5. Product Definition & MVP Scope

### V1 promise
- Create or import appointments
- System sends confirmation + 2 reminders automatically
- Client can confirm or request reschedule via link
- Admin sees what happened in a dashboard

### MVP includes

**Client-facing:**
- Confirmation email with confirm and reschedule links
- Reminder email at 24h before
- Reminder email at 1h before
- Reschedule request form (preferred time + note)
- Confirmation success page

**Admin side:**
- Create appointment manually
- CSV import
- Appointment list with status and confirmation status
- Dashboard — confirmed count, pending, failures, reschedule requests
- Reschedule request inbox
- Reminder event log per appointment

**System behavior:**
- Cron polls for due reminder events every minute
- On cancel: pending reminders marked `canceled`
- On reschedule approval: old reminders canceled, new ones generated
- Token-based confirm and reschedule links — expire after 7 days, single use

### MVP does NOT include
- SMS or WhatsApp (email only)
- Full booking engine
- Payment collection
- Marketing emails
- Multi-tenant enterprise controls

### Default workflow
1. Appointment created
2. Confirmation request sent immediately
3. Reminder sent 24h before
4. Reminder sent 1h before
5. Optional: post-visit follow-up

---

## 6. Core Data Model

### `contacts`
| Field | Type |
|-------|------|
| id | uuid |
| full_name | string |
| email | string |
| phone | string (nullable) |
| timezone | IANA string |
| email_opt_out | boolean |

### `appointments`
| Field | Type |
|-------|------|
| id | uuid |
| contact_id | uuid |
| title | string |
| location_name | string (nullable) |
| starts_at_utc | timestamp |
| ends_at_utc | timestamp (nullable) |
| display_timezone | IANA string |
| status | enum |
| confirmation_status | enum |
| external_reference | string (nullable) |
| created_at | timestamp |

**`status`:** `scheduled` · `confirmed` · `reschedule_requested` · `canceled` · `completed` · `no_show`  
**`confirmation_status`:** `pending` · `confirmed` · `expired` · `skipped`

### `reminder_rules`
| Field | Type |
|-------|------|
| id | uuid |
| name | string |
| event_type | enum |
| offset_minutes | integer |
| active | boolean |

**`event_type`:** `confirmation_request` · `reminder` · `follow_up`

**Default rules (seeded):**
- confirmation_request at offset 0 (fires on create)
- reminder at -1440 (24h before)
- reminder at -60 (1h before)

### `reminder_events`
| Field | Type |
|-------|------|
| id | uuid |
| appointment_id | uuid |
| rule_id | uuid |
| event_type | enum |
| scheduled_for_utc | timestamp |
| status | enum |
| provider_message_id | string (nullable) |
| processed_at | timestamp (nullable) |
| error_message | string (nullable) |

**`status`:** `pending` · `sent` · `delivered` · `failed` · `canceled` · `skipped`

### `appointment_action_tokens`
| Field | Type |
|-------|------|
| id | uuid |
| appointment_id | uuid |
| action_type | enum |
| token_hash | string |
| expires_at | timestamp |
| used_at | timestamp (nullable) |

**`action_type`:** `confirm` · `reschedule`

### `reschedule_requests`
| Field | Type |
|-------|------|
| id | uuid |
| appointment_id | uuid |
| preferred_start_at_utc | timestamp |
| preferred_timezone | IANA string |
| message | string (nullable) |
| status | enum |
| reviewed_at | timestamp (nullable) |

---

## 7. Confirmed Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Frontend | Next.js 15 (App Router) | Vercel free tier |
| Backend | NestJS latest | Render free tier — spins down after inactivity, acceptable for demo |
| Database | Neon (PostgreSQL) | Serverless Postgres, free tier |
| ORM | Prisma 6 | Neon-compatible, use `@prisma/adapter-neon` for edge if needed |
| Email | Resend Node SDK | Transactional only |
| Scheduling | @nestjs/schedule | Cron — no Redis, no BullMQ |
| Validation | class-validator + class-transformer | NestJS DTOs |
| UI | shadcn/ui + Tailwind CSS v4 | Copied into project |
| Forms | React Hook Form + Zod | |
| Tables | TanStack Table v8 | |
| Data fetching | TanStack Query v5 | |
| URL state | nuqs | Filters, pagination |
| Dates | Luxon | Timezone-aware display |

**Neon + Prisma connection note:**  
Use connection pooling via Neon's pooled connection string in production. Set `DATABASE_URL` to the pooled URL, `DIRECT_URL` to the direct URL in `schema.prisma`. Add `?pgbouncer=true&connection_limit=1` to the pooled URL.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 8. Backend Architecture (NestJS)

### Modules
- `contacts`
- `appointments`
- `reminders`
- `actions` (confirm + reschedule token handling)
- `dashboard`
- `auth`

### Services

| Service | Responsibility |
|---------|----------------|
| `AppointmentsService` | CRUD, status transitions |
| `ReminderPlannerService` | Generate reminder_events from active rules on appointment create/update |
| `ReminderSchedulerService` | Cron — poll due events, send via Resend, update status |
| `ConfirmationService` | Validate token, update appointment confirmation_status |
| `RescheduleService` | Create reschedule_request, cancel old reminders, generate new ones on approval |
| `DashboardService` | Aggregate metrics query |

### Reminder scheduling — NO BullMQ

**Pattern:** `@nestjs/schedule` cron runs every 60 seconds. Simple, works on Render free tier, no Redis required.

```typescript
@Cron('*/1 * * * *')
async processReminders() {
  const due = await this.prisma.reminderEvent.findMany({
    where: {
      status: 'pending',
      scheduled_for_utc: { lte: new Date() },
    },
    take: 10, // process in small batches
    include: { appointment: { include: { contact: true } } },
  });

  for (const event of due) {
    await this.prisma.reminderEvent.update({
      where: { id: event.id },
      data: { status: 'sent', processed_at: new Date() },
    });
    
    try {
      await resend.emails.send({ ... });
      await this.prisma.reminderEvent.update({
        where: { id: event.id },
        data: { status: 'sent', provider_message_id: result.id },
      });
    } catch (err) {
      await this.prisma.reminderEvent.update({
        where: { id: event.id },
        data: { status: 'failed', error_message: err.message },
      });
    }
  }
}
```

**Why this works for a demo:** Processing 10 events per minute is more than enough for any demo scenario. The locking problem that BullMQ solves (concurrent workers double-processing) does not exist with a single Render instance.

### API routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/appointments` | Create appointment — generates reminder_events |
| POST | `/appointments/import` | CSV bulk import |
| GET | `/appointments` | List with filters |
| GET | `/appointments/:id` | Detail with reminder events |
| PATCH | `/appointments/:id` | Update — regenerates reminders on time change |
| POST | `/actions/confirm/:token` | Client confirms attendance |
| POST | `/actions/reschedule/:token` | Client submits reschedule request |
| GET | `/reschedule-requests` | List open requests |
| PATCH | `/reschedule-requests/:id` | Admin reviews request |
| GET | `/dashboard/summary` | Aggregated metrics |

### CSV import rules
**Required columns:** `customer_name` · `customer_email` · `appointment_title` · `starts_at` · `timezone`  
**Optional:** `ends_at` · `location_name` · `phone` · `external_reference`  
**Validation:** Reject invalid email, invalid datetime, missing timezone. Return summary: imported count, skipped count, per-row errors.

---

## 9. Frontend Architecture (Next.js)

```
src/
├── app/
│   ├── layout.tsx
│   ├── (admin)/
│   │   ├── layout.tsx                   # Sidebar + header
│   │   ├── dashboard/page.tsx
│   │   ├── appointments/
│   │   │   ├── page.tsx                 # List
│   │   │   ├── new/page.tsx             # Create form
│   │   │   ├── import/page.tsx          # CSV upload
│   │   │   └── [id]/page.tsx            # Detail + reminder log
│   │   └── reschedule-requests/page.tsx
│   └── (public)/
│       ├── confirm/[token]/page.tsx
│       └── reschedule/[token]/page.tsx
├── components/
│   ├── ui/                              # shadcn/ui
│   └── shared/
│       ├── sidebar.tsx
│       ├── status-badge.tsx
│       └── confirmation-badge.tsx
├── features/
│   ├── appointments/
│   │   ├── appointment-table.tsx
│   │   ├── appointment-columns.tsx
│   │   ├── appointment-form.tsx
│   │   └── csv-import-form.tsx
│   ├── dashboard/
│   │   ├── metric-card.tsx
│   │   ├── stats-grid.tsx
│   │   └── reminder-chart.tsx
│   └── reschedule/
│       ├── reschedule-table.tsx
│       └── reschedule-review-modal.tsx
├── lib/
│   ├── api.ts                           # Typed fetch wrapper to NestJS
│   ├── utils.ts
│   └── date.ts                          # Luxon helpers
├── hooks/
│   ├── use-appointments.ts
│   └── use-dashboard.ts
└── types/index.ts
```

---

## 10. Pages Reference

**`/dashboard`** — Server Component. Prefetches `GET /dashboard/summary`. Stats grid: appointments today, confirmed, pending confirmations, reschedule requests, reminders sent today, delivery failures. Recharts bar chart — reminders sent vs failed per day (last 7 days).

**`/appointments`** — Server Component prefetch + TanStack Query client cache. TanStack Table with columns: name, title, datetime (Luxon + display timezone), status badge, confirmation badge, row actions. nuqs handles search, status filter, pagination.

**`/appointments/new`** — Client Component. React Hook Form + Zod. Fields: contact name, email, timezone (IANA searchable select), appointment title, location, start datetime, end datetime. On submit: `POST /appointments`. On success: redirect to detail page.

**`/appointments/import`** — Client Component. File input → papaparse parses in browser → preview row count → POST to `/appointments/import` → result table with imported/skipped/errors.

**`/appointments/[id]`** — Server Component. Shows: contact info, status timeline, reminder event log (type, scheduled time, status, provider message ID), reschedule request if present.

**`/reschedule-requests`** — Server Component prefetch. Table of open requests with preferred time, message, and review button that opens a modal.

**`/confirm/[token]`** — Server Component. Calls NestJS confirm handler server-side, renders success or error state. No client JS needed.

**`/reschedule/[token]`** — Mixed. Server Component validates token, passes appointment data down. Client Component handles the form: preferred date/time, timezone, note. Submits to `POST /actions/reschedule/:token`.

---

## 11. Components Reference

**`status-badge.tsx`** — `'use client'`. shadcn `Badge` with status → color mapping. Single source of truth.

| Status | Color |
|--------|-------|
| `scheduled` | blue |
| `confirmed` | green |
| `reschedule_requested` | amber |
| `canceled` | red |
| `completed` | gray |
| `no_show` | red/dark |

**`confirmation-badge.tsx`** — Same pattern for `confirmation_status`: pending → blue, confirmed → green, expired → red, skipped → gray.

**`appointment-table.tsx`** — `'use client'`. TanStack Table v8. Column defs in `appointment-columns.tsx`. Sorting, pagination via nuqs, status filter.

**`appointment-form.tsx`** — `'use client'`. React Hook Form + Zod resolver. Timezone: shadcn `Command` inside `Popover`. Datetime: shadcn `Calendar` + time input.

**`csv-import-form.tsx`** — `'use client'`. File → papaparse → row count preview → POST → result summary (imported, skipped, errors list).

**`metric-card.tsx`** — Server-safe. shadcn `Card` with number, label, optional trend indicator.

**`reminder-chart.tsx`** — `'use client'`. Recharts `BarChart`. Data as props from server component.

**`reschedule-review-modal.tsx`** — `'use client'`. shadcn `Dialog`. Accept (patches appointment + regenerates reminders) or Dismiss. Invalidates TanStack Query cache on success.

---

## 12. Frontend Patterns

- **Server Components fetch, Client Components interact.** Pages are async server components. Interactive pieces are client components receiving data as props or using TanStack Query.
- **nuqs for all URL state.** Filters, search, page number live in the URL.
- **Zod schemas are the single source of truth.** One schema per form. Type inferred from schema.
- **Typed fetch wrapper.** One `lib/api.ts` with base URL, headers, typed generics. Never raw fetch scattered across files.
- **Push `'use client'` to leaf level.** Page layouts stay server components. Only interactive children get `'use client'`.

---

## 13. Build Order

### Step 1 — Schema
Full Prisma schema. Seed default reminder rules (confirmation at 0, reminder at -1440, reminder at -60).  
**Done when:** Tables exist, rules are seeded, Prisma Studio shows correct relations.

### Step 2 — Appointment CRUD
`POST`, `GET`, `PATCH` on appointments and contacts. DTOs with class-validator.  
**Done when:** Create, list, and update an appointment via Swagger or REST client.

### Step 3 — Reminder planner
`ReminderPlannerService` — on appointment create, read active rules, generate `reminder_events` with correct `scheduled_for_utc`.  
**Done when:** Creating an appointment produces 3 `reminder_events` rows.

### Step 4 — Cron scheduler + Resend
`@nestjs/schedule` cron every 60 seconds. Query pending due events, send via Resend, update status.  
**Done when:** A real email lands in a test inbox. Event row shows `sent` with a Resend message ID.

### Step 5 — Token flow
Generate tokens on appointment create. Hash at rest with Node `crypto`. Build confirm and reschedule handlers. Build public Next.js pages. Enforce expiry.  
**Done when:** Clicking a confirm link in the test email updates `confirmation_status` to `confirmed`.

### Step 6 — Dashboard
`GET /dashboard/summary` — single aggregation query. Wire to dashboard page.  
**Done when:** Dashboard shows accurate counts that change with appointment and reminder data.

### Step 7 — CSV import
`POST /appointments/import`. Parse with `csv-parse` on server. Return structured summary.  
**Done when:** Upload a CSV with good and bad rows — good ones import, bad ones report errors per row.

### Step 8 — Reschedule flow
`RescheduleService` — create request, cancel old pending reminders, generate new ones on approval.  
**Done when:** Approving a reschedule request cancels old reminder events and creates new ones for the updated time.

---

## 14. AI Integration

### Validated feature: Intelligent reschedule parsing

**The problem:** Client fills in a reschedule request note — "I need to move to sometime next week, preferably mornings, Tuesday or Thursday." The admin reads this as raw text and has to interpret it manually.

**The AI feature:** When a reschedule request is submitted, one Claude API call reads the note and returns a structured object: `{ preferred_days: ['Tuesday', 'Thursday'], time_preference: 'morning', urgency: 'flexible' }`. This appears in the admin's reschedule inbox as an actionable card instead of a text block.

**Where it lives:** `POST /actions/reschedule/:token` handler. Background call to Claude after the request is saved. One API call, 3–4 seconds. No workflow change required.

**Why this is unique:** No Calendly setup, no Zapier flow, and no SaaS reminder tool does this. It is only possible in a custom-coded system with an LLM integration.

**Implementation note for demo:** Gate the AI call behind an environment variable — `AI_ENABLED=true`. When disabled, the raw text is displayed as-is. This means the demo works without an API key and the AI feature is a bonus layer, not a dependency.

---

## 15. Email Templates

### Confirmation request
- Contact name, appointment title, date/time (display timezone), location
- Confirm attendance button → `/confirm/[token]`
- Reschedule button → `/reschedule/[token]`
- No marketing copy, no promotional language

### Reminder (24h and 1h)
- Same fields as confirmation
- "Your appointment is tomorrow/today" heading
- Same confirm and reschedule buttons
- Brief and transactional — no noise

### Reschedule confirmation (to client)
- "We received your reschedule request"
- Their preferred time as submitted
- "We'll be in touch to confirm the new time"
- Business contact details

---

## 16. Security Rules

| Rule | Implementation |
|------|----------------|
| Action links expire | `expires_at` enforced on every token validation — not just stored |
| Tokens hashed at rest | Node `crypto.createHash('sha256')` on raw token |
| Tokens single-use | `used_at` set on first valid use — reuse returns clear error |
| Admin routes require auth | Auth guard on all admin API routes |
| Duplicate reminder prevention | Query includes `status: 'pending'` filter — already-sent events are not re-queued |
| CSV validation | Per-row validation — bad rows rejected with specific error, good rows imported |

---

## 17. Demo Deployment Notes

### Render free tier
- Web services spin down after 15 minutes of inactivity
- First request after spin-down: 30–50 seconds cold start
- The `@nestjs/schedule` cron **will not run** during spin-down — this is acceptable for a demo
- If the demo needs the cron running continuously: upgrade to Render's $7/month instance, or use a free uptime monitor (UptimeRobot pings the service every 5 minutes to keep it alive)

### Neon free tier
- Compute pauses after 5 minutes of inactivity
- First query after pause: 1–3 seconds
- Storage limit: 512MB — more than enough for a demo database
- Use pooled connection string for backend: prevents connection exhaustion on Render

### Vercel free tier
- 100GB bandwidth, no function timeout issues for Next.js frontend
- Environment variables: `NEXT_PUBLIC_API_URL` pointing to your Render backend URL

### Environment variables needed
```
# Backend (Render)
DATABASE_URL=           # Neon pooled connection string
DIRECT_URL=             # Neon direct connection string
RESEND_API_KEY=
TOKEN_SECRET=           # Random string for token generation
FRONTEND_URL=           # Vercel frontend URL (for action links)

# Frontend (Vercel)
NEXT_PUBLIC_API_URL=    # Render backend URL
```
