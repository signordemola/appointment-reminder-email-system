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
<!-- playbook:start -->
# Project Instructions for AI Agents

## Core Principles — apply to EVERY change

1. **Single Source of Truth** — one function per business rule, defined once, called from everywhere.
2. **Database as Safety Net** — application logic validates first, DB constraints are the final defence.
3. **Never Trust the Client** — re-validate all inputs server-side; authenticate and authorize all mutations.
4. **Audit Everything** — every state transition, charge, and permission change gets logged. Append-only.
5. **Idempotency by Default** — every external side effect uses a business-derived idempotency key.
6. **Money Is Integer Minor Units** — never floats; the currency travels with every amount; rounding happens once, in one named function.

## Required Reading, in Order

1. `.playbook/rules/`: `code-style.md`, `project-structure.md`, `mistakes.md`, `definition-of-done.md`, `git-workflow.md` (the global rules are already loaded)
2. `CONTEXT.md` at the project root, if it exists — the domain glossary; use its exact terms in all naming
3. `DESIGN.md` at the project root, if it exists — the design lock; read it before any UI work
4. `.playbook/stacks/turborepo/STACK.md` — stack conventions, templates, and check commands
5. `.playbook/stacks/nestjs/STACK.md` — stack conventions, templates, and check commands for `apps/api/`
6. `.playbook/stacks/nextjs/STACK.md` — stack conventions, templates, and check commands for `apps/web/`
7. `.playbook/playbooks/<domain>/INDEX.md` — for the relevant domain (e.g. `booking`, `core`)

## Workflows

`.playbook/workflows/flow.md` maps the available workflows (installed as slash commands) — consult it when unsure how to proceed.

## Completion Gate

A task is complete ONLY when `.playbook/rules/definition-of-done.md` passes.
<!-- playbook:end -->
