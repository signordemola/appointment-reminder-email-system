# Appointment Reminder Email System

Appointment Reminder Email System is a portfolio-grade demo for small appointment-based businesses. It is designed to show a credible operations workflow for reducing no-shows, capturing confirmations, handling reschedule requests, and giving staff better visibility into reminder delivery.

This repo is a `pnpm` + Turborepo monorepo with:

- `apps/web`: Next.js 16 admin and public workflow frontend
- `apps/api`: NestJS 11 API with Prisma 7, Neon/Postgres, Resend, and Gemini AI features

## What It Covers

- Mock login gate with cookie-based session (see credentials below)
- Admin dashboard with reminder activity, delivery failures, no-shows, and pending confirmations
- Appointment roster, appointment detail timeline, and new appointment flow
- CSV import for appointments with row-level validation feedback
- Contact management with full CRUD (create, edit, soft delete)
- Public confirmation and reschedule pages with expiring action tokens
- Reminder rule management with custom email templates and manual dispatch
- Resend-backed email delivery flow
- AI reschedule triage for the inbox
- AI reminder copy generation for transactional email drafts

## Stack

- Next.js 16 App Router
- React 19
- NestJS 11
- Prisma ORM 7
- PostgreSQL / Neon
- Resend
- Google Gemini 2.5 Flash via `@google/genai`
- Turborepo + `pnpm`

## Repo Layout

```text
apps/
  api/  NestJS API, Prisma schema, seed, Resend, Gemini integrations
  web/  Next.js admin dashboard and public action pages
```

## Prerequisites

- Node.js `20.19.0` or newer
- `pnpm`
- PostgreSQL connection string

Why `20.19.0+`:

- Next.js 16 requires Node `20.9+`
- Prisma ORM 7 requires Node `20.19.0+`, `22.12.0+`, or `24.0.0+`
- The Google GenAI SDK requires Node 20 or later

For the smoothest local and deployment setup, use Node 22 LTS or 24 LTS.

## Local Setup

1. Install dependencies from the repo root:

```bash
pnpm install
```

2. Copy `apps/api/.env.example` to `apps/api/.env`.

3. Copy `apps/web/.env.example` to `apps/web/.env.local`.

4. Generate Prisma client, sync the schema, and seed the demo data:

```bash
pnpm --filter api run db:generate
pnpm --filter api run db:push
pnpm --filter api run db:seed
```

5. Start the API:

```bash
cd apps/api
pnpm build
pnpm start
```

6. In a second terminal, start the web app:

```bash
cd apps/web
pnpm dev
```

Open `http://localhost:3000`. You'll be redirected to the login page.

## Demo Login Credentials

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@remindflow.com` |
| Password | `demo1234`             |

These are hardcoded in the frontend — no real auth backend is needed. The credentials are also shown on the login page itself.

## Environment Variables

### API

Use `apps/api/.env.example` as the source of truth.

Required for the core demo:

- `DATABASE_URL`
- `PORT`
- `CORS_ORIGIN`
- `PUBLIC_WEB_URL`
- `INTERNAL_JOB_SECRET`

Required for real email sending:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO`

Optional for live webhook verification:

- `RESEND_WEBHOOK_SECRET`

Required for AI features:

- `GEMINI_API_KEY_1`
- optional `GEMINI_API_KEY_2`
- optional fallback `GEMINI_API_KEY` or `GOOGLE_API_KEY`
- optional `GEMINI_MODEL`

Important: Gemini rotation only increases real free-tier headroom if the keys come from different Google AI Studio or Google Cloud projects.

### Web

Use `apps/web/.env.example` as the source of truth.

- `NEXT_PUBLIC_API_URL`
- `API_URL`
- `INTERNAL_JOB_SECRET`

In practice, set `NEXT_PUBLIC_API_URL` and `API_URL` to the same API origin unless you have a more specialized setup.

## Useful Commands

From the repo root:

```bash
pnpm build
pnpm check-types
pnpm lint
```

API-only:

```bash
pnpm --filter api run db:generate
pnpm --filter api run db:push
pnpm --filter api run db:seed
pnpm --filter api run build
```

## Deployment

### Frontend on Vercel

Current Vercel monorepo guidance is to import the repo and set a project Root Directory for each app you deploy. For this frontend:

- Framework preset: `Next.js`
- Root Directory: `apps/web`
- Node.js version: `20.x` or newer
- Environment variables:
  - `NEXT_PUBLIC_API_URL=https://your-api-domain.com`
  - `API_URL=https://your-api-domain.com`
  - `INTERNAL_JOB_SECRET=...`

### API on Render

Render supports monorepos through a service Root Directory. For this API:

- Runtime: `Node`
- Root Directory: `apps/api`
- Build Command: `pnpm install && pnpm build`
- Start Command: `pnpm start`
- Node.js version: `20.19.0+`

Add these API envs in Render:

- `DATABASE_URL`
- `PORT`
- `CORS_ORIGIN=https://your-web-domain.com`
- `PUBLIC_WEB_URL=https://your-web-domain.com`
- `INTERNAL_JOB_SECRET=...`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO`
- Gemini key envs if you want the AI features live

If you enable the web dashboard's manual dispatch control, `INTERNAL_JOB_SECRET` must match in both the web and API deployments.

## Demo Walkthrough

The cleanest recorded flow for a freelance portfolio demo is:

1. Open the app and sign in with the demo credentials.
2. Show the dashboard with reminder activity, pending confirmations, and failures.
3. Open the appointments list and detail timeline.
4. Import a CSV batch.
5. Open the contacts page — edit a contact, then delete one (soft delete with confirmation).
6. Dispatch due reminders from the dashboard.
7. Open a seeded public confirm or reschedule link.
8. Return to the reschedule inbox and run AI triage.
9. Open settings and generate reminder copy with Gemini.
10. Sign out from the sidebar user menu.

## Notes

- This app is optimized as a believable freelance demo, not as a full HIPAA-ready production system.
- The API intentionally uses database-backed reminder planning instead of BullMQ because the target deployment path is lightweight demo hosting.
- If you deploy the same database used locally, you do not need to reseed just because your frontend domain changes.
