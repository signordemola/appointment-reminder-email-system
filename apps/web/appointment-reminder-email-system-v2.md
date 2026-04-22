# Appointment Reminder Email System — Project Brief & Build Reference

> Research baseline: April 17, 2026  
> This document merges the original project brief with confirmed stack research, frontend architecture, component breakdown, and annotated build order.

---

## Table of Contents

1. [What This Project Is Really Selling](#1-what-this-project-is-really-selling)
2. [Marketplace Demand Signal](#2-marketplace-demand-signal)
3. [Foreign Market Expectations](#3-foreign-market-expectations)
4. [Business & Customer Pain Points](#4-business--customer-pain-points)
5. [Product Definition & MVP Scope](#5-product-definition--mvp-scope)
6. [Core Data Model](#6-core-data-model)
7. [Confirmed Stack & Package Versions](#7-confirmed-stack--package-versions)
8. [Backend Architecture (NestJS)](#8-backend-architecture-nestjs)
9. [Frontend Architecture (Next.js)](#9-frontend-architecture-nextjs)
10. [Pages Reference](#10-pages-reference)
11. [Components Reference](#11-components-reference)
12. [Frontend Patterns to Follow](#12-frontend-patterns-to-follow)
13. [Annotated Build Order](#13-annotated-build-order)
14. [Email Template Requirements](#14-email-template-requirements)
15. [Security Rules](#15-security-rules)
16. [Official Sources](#16-official-sources)

---

## 1. What This Project Is Really Selling

This is not "an email reminder tool."

It is a small appointment operations system that helps businesses:

- reduce no-shows
- stop manual reminder chasing
- get confirmation signals before the appointment
- catch reschedules earlier
- see reminder outcomes in one place

**Good positioning line:**  
*"A coded reminder and confirmation system for appointment businesses that reduces no-shows, captures confirmations, and gives staff a clear operations dashboard."*

**Best-fit buyers:**
- Salons and beauty studios
- Clinics and private practices
- Therapists and coaches
- Consultants and agencies
- Any service business with booked appointments and repeat no-show pain

---

## 2. Marketplace Demand Signal

### Fiverr

Buyers are already paying for:
- Appointment reminder systems that send automated emails 24 hours before appointments
- Salon and spa booking systems with email notifications
- Simple Google Sheets or Brevo based reminder automations
- Clinic automation bundles with reminders + intake workflow

**Key insight:** Most Fiverr competition is setup-oriented or low-code. A custom coded demo stands out if it looks productized and reliable.

### Upwork

Demand for:
- "Book, confirm, remind automatically" systems
- Appointment reminders connected to CRM systems
- Calendar and customer data synchronization
- Ongoing operational automation, not one-off websites

**Key insight:** Upwork buyers think in workflows, not pages. They care about data sync, preferences, and reliable execution.

### Contra

Higher-trust freelancers on Contra frame work around:
- Reduced phone call volume
- Faster booking and rescheduling
- Multi-channel communication
- Patient or client satisfaction
- Secure data handling
- Clear business outcomes

**Key insight:** The demo should read like a workflow case study, not a feature list.

### Winning angle

Not: *"I can send reminder emails."*  
Yes: *"I can build a reminder and confirmation workflow that reduces missed appointments and removes admin work."*

---

## 3. Foreign Market Expectations

Target markets: United States, United Kingdom, Canada, Australia.

These markets already use salon scheduling, clinic reminders, meeting scheduling workflows, and customer communication automation. The buyer standard is not zero.

### What Square Appointments documents as standard

- Send reminders by email and/or text
- Send reminders between 1 hour and 3 days before appointments
- Send confirmation requests between 2 hours and 1 week before
- See confirmed vs unconfirmed appointments distinctly
- Notifications are transactional only — no promotions mixed in

### What SimplePractice documents as standard

- Reminders by email, text, or voice
- Lead-time options: 24, 36, 48, or 72 hours
- Reminders localized to the client timezone
- Reminder settings at both practice and client level

### What Calendly documents as standard

- Reminders and follow-ups as workflow automation
- Triggers on: booked, before start, rescheduled, canceled, ended, no-show
- Reconfirmation to reduce no-shows
- Post-no-show reschedule flows

### What Vagaro documents as standard

- Confirmations, reminders, and cancellation handling as one connected experience

### Minimum believable standard for this demo

- Reminders ✓
- Confirmations ✓
- Reschedule path ✓
- Status visibility ✓
- Timezone awareness ✓
- Delivery awareness ✓

---

## 4. Business & Customer Pain Points

### Business — Operational

- No-shows waste appointment slots and revenue
- Staff spend time calling or emailing manually
- Reminder timing is inconsistent
- No single view of who confirmed and who did not
- Reschedules happen too late
- Canceled appointments still trigger outdated communications

### Business — Administrative

- Customer data sits across calendars, spreadsheets, inboxes, CRMs
- Appointment changes create messaging confusion
- No reliable log of what was sent
- Failed or bounced reminders are invisible until the customer complains

### Business — Commercial

- Missed appointments reduce revenue
- Empty time slots are hard to refill late
- Staff time wasted on follow-up instead of service delivery
- Poor communication makes the business look disorganized

### Customer — Before the appointment

- They forget the date or time
- Unsure whether the appointment is still active
- Cannot quickly confirm attendance
- Don't know how to reschedule without calling
- Miss messages because email lands in spam

### Customer — During schedule changes

- Rescheduling is too slow
- Reminder messages continue after appointment changed
- Timezone confusion leads to missed events
- Cannot tell whether the business received their reply

### Customer — Experience

- Too many manual calls feel annoying
- Vague reminder messages create friction
- Promotional or noisy reminders reduce trust
- Healthcare appointments require privacy-aware messaging

---

## 5. Product Definition & MVP Scope

### Narrow v1 promise

- Import or create appointments
- Send confirmation and reminder emails automatically
- Let clients confirm or request a reschedule
- Show the business what happened

### MVP includes

**Admin side:**
- Create appointment manually
- Import appointments by CSV
- Define reminder rules
- Appointment list with statuses
- Dashboard with confirmation and delivery metrics
- Reschedule request inbox

**Client side:**
- Confirmation email
- Reminder email
- Confirm attendance link
- Reschedule request form

**System behavior:**
- Timezone-aware scheduling
- Expired secure action links
- Reminder cancellation when appointment is canceled or moved
- Provider delivery status capture

### MVP does NOT include

- Full booking website
- Payment collection
- SMS and WhatsApp
- Full CRM
- Marketing campaigns
- Multi-tenant enterprise controls

### Product rules

**Reminder and confirmation are not the same thing.**  
A reminder tells the client the appointment is coming. A confirmation asks the client to explicitly signal attendance.

**Reminder messages must stay transactional.**  
No promotions mixed into the workflow.

**Timezone handling is mandatory.**  
If the appointment is in London and the client is in New York, the system needs a clear rule. Store everything in UTC, display in the relevant timezone.

**Rescheduling must regenerate future reminders.**  
Otherwise the app behaves like a toy and creates user frustration.

**Delivery tracking matters.**  
The business needs to know whether the message was sent, delivered, bounced, or failed.

### Default workflow sequence

1. Appointment created
2. Confirmation request sent immediately
3. Reminder sent 24 hours before
4. Reminder sent 1 hour before
5. Optional follow-up after the appointment

---

## 6. Core Data Model

### `contacts`

| Field | Type |
|-------|------|
| id | uuid |
| full_name | string |
| email | string |
| phone | string (nullable) |
| timezone | IANA timezone string |
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
| display_timezone | IANA timezone string |
| status | enum |
| confirmation_status | enum |
| external_reference | string (nullable) |
| created_at | timestamp |
| updated_at | timestamp |

**`status` values:** `scheduled` · `confirmed` · `reschedule_requested` · `canceled` · `completed` · `no_show`

**`confirmation_status` values:** `pending` · `confirmed` · `expired` · `skipped`

### `reminder_rules`

| Field | Type |
|-------|------|
| id | uuid |
| name | string |
| channel | string |
| event_type | enum |
| offset_minutes | integer (negative = before, 0 = immediate) |
| active | boolean |

**`event_type` values:** `confirmation_request` · `reminder` · `follow_up`

### `reminder_events`

| Field | Type |
|-------|------|
| id | uuid |
| appointment_id | uuid |
| rule_id | uuid |
| channel | string |
| event_type | enum |
| scheduled_for_utc | timestamp |
| status | enum |
| provider | string |
| provider_message_id | string (nullable) |
| locked_at | timestamp (nullable) |
| processed_at | timestamp (nullable) |
| error_message | string (nullable) |

**`status` values:** `pending` · `locked` · `sent` · `delivered` · `opened` · `clicked` · `bounced` · `failed` · `canceled` · `skipped`

### `appointment_action_tokens`

| Field | Type |
|-------|------|
| id | uuid |
| appointment_id | uuid |
| action_type | enum |
| token_hash | string |
| expires_at | timestamp |
| used_at | timestamp (nullable) |

**`action_type` values:** `confirm` · `reschedule`

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
| reviewed_by | string (nullable) |

### `email_webhook_events`

| Field | Type |
|-------|------|
| id | uuid |
| provider | string |
| provider_message_id | string |
| event_type | string |
| payload_json | json |
| received_at | timestamp |

---

## 7. Confirmed Stack & Package Versions

> Verified against official docs and npm as of April 17, 2026.

### Frontend

| Tool | Version / Notes |
|------|----------------|
| Next.js | 16 (App Router, React 19) |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | v4 |
| shadcn/ui | Copied into project — not a package dependency |
| TanStack Table | v8 — appointment and reschedule tables |
| TanStack Query | v5 — server prefetch + client cache |
| Recharts | 3 — dashboard metric charts |
| React Hook Form | latest — all form handling |
| Zod | latest — form validation and schema source of truth |
| nuqs | latest — URL state for filters, search, pagination |
| Luxon | latest — timezone-aware date display (preferred over date-fns for this use case) |
| next-themes | latest — dark/light mode |
| papaparse | latest — browser-side CSV parsing before upload |

### Backend

| Tool | Version / Notes |
|------|----------------|
| NestJS | 11 (current stable) |
| TypeScript | 5 |
| Prisma | 7 (pure TypeScript, Rust engine removed — simpler deploys) |
| PostgreSQL | 16 |
| Redis | 7 |
| BullMQ | latest |
| @nestjs/bullmq | official NestJS BullMQ module |
| @nestjs/schedule | cron polling for due reminder events |
| Resend Node SDK | latest — transactional email |
| class-validator + class-transformer | latest — DTO validation |
| @nestjs/config | env management |
| @nestjs/swagger | API docs during build |
| crypto | Node built-in — token generation and hashing |
| csv-parse | CSV import parsing on the server |

### ORM decision: Prisma 7

Drizzle is faster and more SQL-native, but Prisma's migration tooling, relation handling, and DX save more time than Drizzle's performance gains are worth at this project size. Drizzle is the better pick for serverless/edge deployments — this project is neither.

---

## 8. Backend Architecture (NestJS)

### Modules

- `appointments`
- `contacts`
- `reminders`
- `notifications`
- `dashboard`
- `auth`

### Services

| Service | Responsibility |
|---------|----------------|
| `AppointmentsService` | CRUD, status transitions |
| `ReminderRulesService` | Rule config and seeding |
| `ReminderPlannerService` | Generate reminder events from rules when appointment is created/updated |
| `ReminderQueueService` | Enqueue jobs for due events |
| `ReminderProcessorService` | Consume queue jobs, call Resend, update event status |
| `ConfirmationService` | Validate tokens, update appointment confirmation status |
| `RescheduleService` | Create reschedule requests, cancel old events, regenerate new ones |
| `EmailWebhookService` | Store raw Resend webhook payloads, enqueue reconcile jobs |
| `DashboardService` | Aggregate metrics query |

### Queues

- `reminder-dispatch`
- `webhook-reconcile`

### Job types

- `send-confirmation-email`
- `send-reminder-email`
- `cancel-reminder-event`
- `process-delivery-webhook`

### API routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/appointments` | Create appointment |
| POST | `/appointments/import` | CSV bulk import |
| GET | `/appointments` | List with filters |
| GET | `/appointments/:id` | Detail with reminder events |
| PATCH | `/appointments/:id` | Update appointment |
| POST | `/actions/confirm/:token` | Client confirms attendance |
| POST | `/actions/reschedule/:token` | Client submits reschedule request |
| GET | `/reschedule-requests` | List open requests |
| PATCH | `/reschedule-requests/:id` | Admin reviews request |
| GET | `/dashboard/summary` | Aggregated metrics |
| POST | `/webhooks/resend` | Delivery status webhook |

### How the system works

**Create appointment:**
1. Admin creates appointment or imports CSV
2. Backend validates data
3. Backend stores appointment + contact
4. `ReminderPlannerService` generates `reminder_events` rows from active rules
5. `ConfirmationService` creates secure tokens for confirm and reschedule links
6. Confirmation request email is sent immediately

**Process reminders:**
1. `@nestjs/schedule` cron polls for due `reminder_events` (status = `pending`, `scheduled_for_utc` <= now)
2. System locks rows with `SELECT FOR UPDATE SKIP LOCKED` — prevents double-send under concurrency
3. `ReminderQueueService` enqueues a job per locked event
4. `ReminderProcessorService` sends via Resend SDK, writes `provider_message_id` back
5. Webhooks later reconcile delivery state

**Confirm appointment:**
1. Client clicks confirm link
2. Backend validates token (exists, not expired, not used)
3. Marks `used_at`, updates `confirmation_status` to `confirmed`
4. Cancels any future confirmation-type reminder events for this appointment

**Request reschedule:**
1. Client clicks reschedule link, submits preferred time and note
2. Backend creates `reschedule_request`
3. Admin reviews: accepts or dismisses
4. On accept: appointment `starts_at_utc` updated, old pending `reminder_events` canceled, new ones generated

### CSV import rules

**Required columns:** `customer_name` · `customer_email` · `appointment_title` · `starts_at` · `timezone`

**Optional columns:** `ends_at` · `location_name` · `phone` · `external_reference`

**Validation:** Reject invalid email · Reject invalid datetime · Reject missing timezone · Warn on duplicate `external_reference`

**Response:** Return a summary object — rows imported, rows skipped, per-row error list.

---

## 9. Frontend Architecture (Next.js)

### Project structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout — providers, fonts, themes
│   ├── (admin)/                          # Route group — shared admin shell
│   │   ├── layout.tsx                    # Admin layout — sidebar + header
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── appointments/
│   │   │   ├── page.tsx                  # Appointment list
│   │   │   ├── new/
│   │   │   │   └── page.tsx              # Create appointment form
│   │   │   ├── import/
│   │   │   │   └── page.tsx              # CSV upload
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Appointment detail
│   │   └── reschedule-requests/
│   │       └── page.tsx
│   └── (public)/                         # Route group — no sidebar
│       ├── confirm/
│       │   └── [token]/
│       │       └── page.tsx              # Client confirm page
│       └── reschedule/
│           └── [token]/
│               └── page.tsx              # Client reschedule form
├── components/
│   ├── ui/                               # shadcn/ui copied components
│   └── shared/                           # Your own reusable components
│       ├── sidebar.tsx
│       ├── header.tsx
│       ├── status-badge.tsx
│       └── confirmation-badge.tsx
├── features/                             # Colocated feature logic
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
│   ├── api.ts                            # Typed fetch wrapper to NestJS
│   ├── utils.ts                          # cn() and helpers
│   └── date.ts                           # Luxon timezone display helpers
├── hooks/
│   ├── use-appointments.ts               # TanStack Query hooks
│   └── use-dashboard.ts
└── types/
    └── index.ts                          # Shared TS types matching backend DTOs
```

**Colocation rule:** If a component is used by only one route, colocate it inside the route folder as `_components/your-component.tsx`. The underscore prefix opts it out of the routing system. Only put things in `features/` or `components/shared/` if they are genuinely used across multiple routes.

---

## 10. Pages Reference

### `(admin)/dashboard/page.tsx`

- **Rendering:** Server Component
- **Data:** Prefetches `GET /dashboard/summary`
- **Renders:** `<StatsGrid>` with metric cards, Recharts bar chart of reminders sent this week, small table of today's pending confirmations

**Dashboard metrics:**  
Appointments today · Confirmed · Pending confirmations · Reschedule requests · Canceled · No-shows · Reminders sent today · Delivery failures · Bounce count

---

### `(admin)/appointments/page.tsx`

- **Rendering:** Server Component prefetch + TanStack Query client cache
- **Data:** `GET /appointments` with pagination and filters
- **Renders:** TanStack Table v8 with columns for name, title, datetime (Luxon + display timezone), status badge, confirmation badge, row action menu
- **URL state:** nuqs handles search, status filter, pagination

---

### `(admin)/appointments/new/page.tsx`

- **Rendering:** Client Component
- **Form fields:** Contact name, email, timezone select (IANA zones, searchable), appointment title, location, start datetime, end datetime
- **Validation:** Zod schema → React Hook Form zodResolver
- **On submit:** `POST /appointments` via typed fetch wrapper
- **On success:** Redirect to appointment detail page

---

### `(admin)/appointments/import/page.tsx`

- **Rendering:** Client Component
- **Flow:** File input → papaparse parses in-browser → preview row count → send raw file to `POST /appointments/import`
- **After submit:** Result table showing rows imported, rows skipped, per-row error list

---

### `(admin)/appointments/[id]/page.tsx`

- **Rendering:** Server Component
- **Shows:** Contact info, appointment status, full reminder event timeline with status for each event (pending / sent / delivered / bounced), reschedule request if present

---

### `(admin)/reschedule-requests/page.tsx`

- **Rendering:** Server Component prefetch
- **Shows:** Table of open reschedule requests — client name, preferred time, message, review button
- **Review button:** Opens modal to accept or dismiss the request

---

### `(public)/confirm/[token]/page.tsx`

- **Rendering:** Server Component
- **Flow:** Calls NestJS confirm handler server-side, reads result, renders success or error state
- **No client JS needed** — purely outcome display

---

### `(public)/reschedule/[token]/page.tsx`

- **Rendering:** Mixed
- **Server Component:** Validates token, loads appointment data, passes down as props
- **Client Component:** Form with preferred date/time, timezone select, note field
- **On submit:** `POST /actions/reschedule/:token`

---

## 11. Components Reference

### `status-badge.tsx`

`'use client'`. Wraps shadcn `Badge`. Takes a status string, maps it to a color variant. Single source of truth for status colors. Used in every table and on the detail page.

**Status → color mapping:**
- `scheduled` → blue
- `confirmed` → green
- `reschedule_requested` → yellow
- `canceled` → red
- `completed` → gray
- `no_show` → red/dark

---

### `confirmation-badge.tsx`

Same pattern as `status-badge` but for `confirmation_status` values: `pending` · `confirmed` · `expired` · `skipped`.

---

### `appointment-table.tsx`

`'use client'`. TanStack Table v8 instance. Column definitions live in `appointment-columns.tsx` as a separate file. Includes sorting, pagination wired to nuqs, and a status filter dropdown. Row actions: view detail, cancel appointment.

---

### `appointment-form.tsx`

`'use client'`. React Hook Form with Zod resolver. The timezone field uses a searchable select — shadcn `Command` inside a `Popover`. Datetime fields use shadcn `Calendar` + a time input. The Zod schema is defined once and the inferred type is used as the form's TypeScript type.

---

### `csv-import-form.tsx`

`'use client'`. File selection → papaparse parse → instant row count preview → POST to backend → result summary table. Shows rows imported, rows skipped, and a per-row error list.

---

### `metric-card.tsx`

Server-safe — no `'use client'`. A shadcn `Card` wrapping a number, label, and optional trend indicator. No state needed.

---

### `reminder-chart.tsx`

`'use client'`. Recharts `BarChart` — reminders sent vs failed per day for the last 7 days. Data passed as props from the parent server component page, not fetched client-side.

---

### `reschedule-review-modal.tsx`

`'use client'`. shadcn `Dialog`. Shows the client's preferred time and note. Two actions: Accept (PATCH appointment to new time, cancel old reminder events, generate new ones) and Dismiss. Both call the API and then invalidate TanStack Query cache on success.

---

## 12. Frontend Patterns to Follow

### Server Components fetch, Client Components interact

Pages are async Server Components that prefetch data. Interactive pieces (tables with filters, forms, modals) are Client Components that receive data as props or use TanStack Query for subsequent fetches.

### nuqs for all URL state

Filters, search terms, and page numbers live in the URL. This means the list state survives a refresh and is shareable. Do not use `useState` for anything that belongs in the URL.

### Zod schemas are the single source of truth for form validation

Define the schema once, pass it to React Hook Form via `zodResolver`, and use the inferred type as the form's TypeScript type. Do not duplicate validation logic.

### Typed fetch wrapper

Write one `lib/api.ts` that wraps `fetch` with the base URL, auth headers, and typed response generics. Every feature hook and server component calls through this — never raw `fetch` scattered across the codebase.

### TanStack Query cache invalidation on mutations

After any mutation that changes data visible in a table or dashboard, invalidate the relevant query keys. Do not rely on route refresh alone.

### Keep `'use client'` at the leaf level

Push the client boundary as deep as possible. A page layout should stay a Server Component even if it contains one interactive child. Only the interactive child gets `'use client'`.

---

## 13. Annotated Build Order

### Step 1 — Database schema

Write the full Prisma schema for all tables. Run `prisma migrate dev` from day one. Do not defer migrations or use `prisma db push` in development.

**Done when:** All tables exist, relations are correct, you can query them in Prisma Studio.

---

### Step 2 — Appointment CRUD

Build `POST`, `GET`, `PATCH` on appointments and contacts. DTOs with `class-validator`. No queue or email involvement yet.

**Done when:** You can create, list, and update an appointment via Swagger or a REST client.

---

### Step 3 — Reminder rule seeding

Seed the three default rules:
- `confirmation_request` at offset 0 (immediate, on create)
- `reminder` at offset -1440 (24 hours before)
- `reminder` at offset -60 (1 hour before)

These are database rows, not hardcoded logic. The planner reads them dynamically.

**Done when:** Rules exist in the database and can be toggled active/inactive.

---

### Step 4 — Reminder event planner

When an appointment is created or updated, `ReminderPlannerService` reads active rules and generates `reminder_events` rows with the correct `scheduled_for_utc` values. This is pure database work — no queue, no email yet.

**Done when:** Creating an appointment produces three `reminder_events` rows with correct UTC times.

---

### Step 5 — Queue wiring + locking

Set up BullMQ queues with `@nestjs/bullmq`. Wire the `@nestjs/schedule` cron to poll for due reminder events (every 30–60 seconds is fine for a demo). Lock rows with `SELECT FOR UPDATE SKIP LOCKED` before enqueuing — this is the pattern that prevents duplicate sends under concurrency. Get this right before touching email.

**Done when:** Due events are locked, enqueued, and the queue shows jobs without a worker yet consuming them.

---

### Step 6 — Resend integration

`ReminderProcessorService` consumes jobs from the `reminder-dispatch` queue. Sends via the Resend SDK, writes `provider_message_id` back to the `reminder_events` row, updates status to `sent`. Errors update status to `failed` with `error_message`.

**Done when:** A real email lands in a test inbox and the `reminder_events` row shows `sent` with a Resend message ID.

---

### Step 7 — Token flow (confirm + reschedule)

Generate tokens on appointment create using Node `crypto`. Hash at rest — never store the raw token. Build the NestJS handlers for `POST /actions/confirm/:token` and `POST /actions/reschedule/:token`. Build the Next.js public pages at `/confirm/[token]` and `/reschedule/[token]`. Enforce expiry strictly — expired tokens return a clear error page, not a generic 404.

**Done when:** Clicking a link in the test email correctly confirms the appointment and the `confirmation_status` updates.

---

### Step 8 — Dashboard metrics

`GET /dashboard/summary` — single aggregation query, not multiple round trips. Wire it to the Next.js dashboard page using server component prefetch. Dashboard is the thing a client sees in a screen recording — it must look real and populated.

**Done when:** Dashboard shows accurate counts that change when appointments and reminder events change.

---

### Step 9 — CSV import

`POST /appointments/import` — parse with `csv-parse` on the server, validate each row, reject bad rows individually. Return a structured summary: imported count, skipped count, per-row error array. The frontend shows this summary after upload.

**Done when:** Uploading a CSV with some good rows and some bad rows correctly imports the good ones and reports errors for the bad ones.

---

### Step 10 — Webhook reconciliation

`POST /webhooks/resend` — verify the Resend webhook signature, store raw payload in `email_webhook_events`, enqueue a `process-delivery-webhook` job. The worker reads the payload and updates `reminder_events.status` to `delivered`, `opened`, `clicked`, `bounced`, or `failed` as appropriate.

**Done when:** After a test email is opened, the `reminder_events` row reflects `opened` status and the dashboard delivery counts update.

---

## 14. Email Template Requirements

### Each email must include

- Customer name (personalized greeting)
- Appointment title
- Date and time (formatted in the display timezone)
- Timezone label (e.g. "London, GMT+1")
- Location or meeting link
- Confirm attendance button (links to `/confirm/[token]`)
- Reschedule button (links to `/reschedule/[token]`)

### Each email must NOT include

- Marketing copy
- Unsubscribe links mixed with transactional actions
- Clutter or promotional language
- Unnecessary sensitive details (especially for healthcare)

---

## 15. Security Rules

| Rule | Implementation |
|------|----------------|
| Action links expire | `expires_at` enforced in token handler — not just stored |
| Token values hashed at rest | Node `crypto.createHash('sha256')` on the raw token |
| Reschedule is a request flow | Not a public editor — staff must review and accept |
| Sensitive appointments use minimal email detail | Title only, no notes or clinical detail in email body |
| Webhook payloads stored for debugging | `email_webhook_events` table with full `payload_json` |
| Duplicate sends prevented | `SELECT FOR UPDATE SKIP LOCKED` locking pattern on `reminder_events` |

---

## 16. Official Sources

### Marketplace demand

- Fiverr reminder automation: https://www.fiverr.com/pranavpauto/build-an-automated-appointment-reminder-system-that-reduces-no-shows
- Fiverr salon booking: https://www.fiverr.com/coderbotics/build-salon-spa-reservation-and-appointment-booking-system
- Upwork appointment automation: https://www.upwork.com/services/product/admin-customer-support-appointment-system-automation-book-confirm-remind-automatically-2009246686232016165
- Contra healthcare appointment assistant: https://contra.com/p/AUq2ekbv-healthcare-appointment-assistant-ai-automation-project

### Foreign-market workflow expectations

- Square reminders: https://squareup.com/gb/en/appointments/features/reminders
- Square notification support: https://squareup.com/help/us/en/article/6729-manage-appointment-booking-notifications-and-reminders
- SimplePractice reminders: https://support.simplepractice.com/hc/en-us/articles/42052535058957-Setting-up-appointment-reminders
- Calendly Workflows: https://calendly.com/features/workflows
- Vagaro notifications: https://www.vagaro.com/pro/notifications

### Build stack docs

- Next.js App Router: https://nextjs.org/docs/app
- Next.js layouts and pages: https://nextjs.org/docs/app/getting-started/layouts-and-pages
- Next.js server and client components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js project structure: https://nextjs.org/docs/app/getting-started/project-structure
- NestJS task scheduling: https://docs.nestjs.com/techniques/task-scheduling
- NestJS queues (BullMQ): https://docs.nestjs.com/techniques/queues
- Prisma docs: https://www.prisma.io/docs
- BullMQ docs: https://docs.bullmq.io
- Resend docs: https://resend.com/docs
- TanStack Query docs: https://tanstack.com/query/latest
- TanStack Table docs: https://tanstack.com/table/latest
- shadcn/ui docs: https://ui.shadcn.com
- nuqs docs: https://nuqs.47ng.com
- Luxon docs: https://moment.github.io/luxon