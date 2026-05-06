# AGENTS.md

## START HERE — Read This First

Before doing anything else, you must:

1. Read every `.md` file inside the `instructions/` folder at the project root. These are the source of truth for what this project is supposed to do and what has been completed.
2. Read every file in the full monorepo — both `apps/web` (Next.js) and `apps/api` (NestJS), all shared packages, all config files, all `.env.example` files.
3. Cross-reference what the `instructions/` checklists say should exist against what actually exists in the code.
4. Only after completing steps 1–3 are you allowed to take any action or write any code.

Do not assume anything. Do not use prior knowledge about how similar projects are structured. Read the actual files.

---

## Project

This is a Turborepo monorepo with two apps:
- `apps/api` — NestJS backend
- `apps/web` — Next.js frontend (uses TanStack Query for data fetching)

Package manager: `pnpm`

---

## Instructions Folder

`instructions/` at the project root contains `.md` files that define the project checklist and requirements. Read all of them at the start of every session. They define what is built, what is in progress, and what needs to be done.

---

## Alignment Rule

Before writing any code that connects `apps/web` to `apps/api`, verify:
- The endpoint exists and is implemented in `apps/api`
- The request/response shape matches what `apps/web` expects
- Any shared types are used from the shared package, not duplicated

Never assume an API endpoint exists. Read the NestJS controllers to confirm.

---

## Rules

- Always use `pnpm` — never `npm` or `yarn`
- Never hardcode API URLs — use environment variables
- Always handle loading, error, and empty states in every TanStack Query usage
- Never duplicate types between apps — use the shared package
- Never modify files in `apps/api` unless the task explicitly requires it
- Read `node_modules/next/dist/docs/` for Next.js API patterns before writing Next.js code