# ChasteAI — Agent Guide

## Project Overview

Open-source AI customer support infrastructure. Monorepo with Turborepo + pnpm.
Self-host first: everything must work locally with zero external dependencies.

## Architecture

- **Monorepo**: Turborepo + pnpm workspaces (6 packages)
- **Database**: PostgreSQL (primary) via Drizzle ORM. SQLite/Turso fallback planned.
- **API Layer**: tRPC (end-to-end type safety, co-located with Next.js)
- **Auth**: Auth.js v5 with Credentials provider (default) + optional OAuth (GitHub, Google)
- **AI**: Provider-agnostic strategy pattern via registry (OpenAI implemented)
- **Frontend**: Next.js 15 App Router, React 19

## Workspace Packages

| Package | Path | Purpose |
|---|---|---|
| `@chaste-ai/web` | `apps/web/` | Next.js app (auth, dashboard, API routes) |
| `@chaste-ai/db` | `packages/db/` | Drizzle schema, migrations, client, seed script |
| `@chaste-ai/ai` | `packages/ai/` | AI provider abstraction + OpenAI provider |
| `@chaste-ai/typescript-config` | `packages/typescript-config/` | Shared TS config |
| `@chaste-ai/eslint-config` | `packages/eslint-config/` | Shared ESLint config |
| `@chaste-ai/prettier-config` | `packages/prettier-config/` | Shared Prettier config |

## Key Command

```sh
pnpm dev              # Start all dev servers
pnpm turbo typecheck  # Type-check all packages
pnpm db:seed          # Seed dev user (admin@chasteai.dev / password123)
pnpm db:migrate       # Run pending migrations
pnpm db:generate      # Generate migration from schema changes
pnpm adr:create       # Create a new ADR (for architectural changes)
```

## Database

- **15 tables**: workspaces, agents, conversations, messages, documents, document_chunks, channels, api_keys, memberships, subscriptions, analytics_events, user, account, session, verificationToken
- Auth tables (user, account, session, verificationToken) managed by `@auth/drizzle-adapter`
- Custom `password` column on `user` table for Credentials provider
- `DATABASE_URL` in `apps/web/.env`

### Seed Data

Run `pnpm db:seed` to create:
- Admin user: `admin@chasteai.dev` / `password123`
- Workspace: "My Workspace" + owner membership

## Auth

- **Strategy**: JWT (not database sessions)
- **Credentials**: Email + password, hashed with bcryptjs
- **OAuth**: GitHub + Google — enabled only when `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` or `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` are set
- **Middleware**: `apps/web/src/middleware.ts` protects `/dashboard/*`, redirects to `/signin`
- **Pages**: `/signin` and `/signup` at `apps/web/src/app/(auth)/`
- **Config**: `auth.config.ts` (edge-compatible) + `auth.ts` (full config with providers)

## tRPC

- Router root at `apps/web/src/server/api/root.ts`
- Context: `createTRPCContext()` calls `auth()` to get session + `getDatabaseClient()` for DB
- `publicProcedure` — no auth required
- `protectedProcedure` — requires valid session, provides `ctx.session.user.id`
- For server components: use `appRouter.createCaller(await createTRPCContext())`

## Architecture Decision Records

All architectural changes MUST be documented in an ADR (enforced by pre-commit hook).
- ADRs live in `docs/adr/`
- Create with `pnpm adr:create`
- The pre-commit hook (`scripts/adr-check.sh`) detects changes to core files and warns if no matching ADR exists

## Coding Conventions

- **TypeScript**: strict mode throughout
- **Validation**: Zod for runtime validation
- **Schema**: Drizzle + drizzle-zod for insert schemas
- **Commits**: conventional commits (feat:, fix:, chore:, docs:, etc.)
- **No comments** in code — let the code speak
- **No emoji** in files unless user requests it
- **Style**: Prettier with shared config

## Current State & Gotchas

- Dev server runs on port 3000 (kill stale `next-server` processes if port is busy)
- PostgreSQL 14.23 runs natively (not Docker), port 5432. No pgvector extension — embeddings stored as text.
- Server actions with form submissions require `multipart/form-data` encoding (curl tests fail with `application/x-www-form-urlencoded`)
- Signup flow: inserts user into `user` table, then calls `signIn("credentials", ...)` with `redirect: false`, then `redirect("/dashboard")`
- The `$ACTION_REF` / `$ACTION_ID` format varies between server actions and `useActionState`-bound actions

## Docker Compose (optional)

`docker-compose.yml` at root provides:
- PostgreSQL with pgvector
- Redis
- MinIO (S3-compatible storage)
- Ollama (local LLM)
