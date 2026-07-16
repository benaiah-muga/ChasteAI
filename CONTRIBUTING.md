# Contributing to ChasteAI

Thanks for your interest in contributing to ChasteAI! This document covers everything you need to get started.

## Prerequisites

- Node.js >= 20
- pnpm >= 10
- PostgreSQL >= 14 (or SQLite via Turso for local dev)

## Getting Started

```sh
git clone https://github.com/anomalyco/chasteai.git
cd chasteai
pnpm install
pnpm setup        # interactive setup: env, deps, build, database
pnpm dev          # start dev server at http://localhost:3000
```

## Project Structure

```
chasteai/
├── apps/web/                  # Next.js 15 app (auth, dashboard, API, widget)
│   ├── src/app/               # Pages, API routes, layouts
│   ├── src/server/api/        # tRPC routers
│   └── src/lib/actions/       # Server actions
├── packages/
│   ├── ai/                    # AI provider abstraction + registry
│   ├── db/                    # Drizzle schema, migrations, seed
│   ├── rag/                   # RAG: chunking, embeddings, retrieval, crawler
│   ├── analytics/             # Analytics queries
│   └── channels/              # Channel provider abstraction
├── scripts/                   # Setup, ADR management, hooks
└── docs/                      # ADRs, PRD, design system
```

## Development Workflow

1. **Create a branch** from `main`
2. **Make your changes** following the coding conventions below
3. **Run typecheck** — `pnpm turbo typecheck`
4. **Run lint** — `pnpm lint`
5. **Commit** using [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, etc.)

## Coding Conventions

### TypeScript

- **Strict mode** everywhere. No `any` types.
- Use `interface` for object shapes; `type` for unions, intersections, and mapped types.
- Prefer `unknown` over `any`. Narrow with type guards.

### Validation

- **Zod** for all runtime validation (API inputs, env vars, form data).
- Use `drizzle-zod` for schema-derived insert/update schemas.

### Database

- Schema definitions in `packages/db/src/schemas/pg/` (PostgreSQL) and `packages/db/src/schemas/sqlite/` (SQLite).
- Keep both dialects in sync when adding or modifying tables.
- Generate PG migrations with `pnpm db:generate`, run with `pnpm db:migrate`.
- SQLite migrations live at `packages/db/src/migrations-sqlite/0000_init.sql` (raw SQL).

### Code Style

- **No comments** in code — let the code speak. Use clear naming instead.
- **No emoji** in code or commit messages.
- Format with **Prettier** (shared config at `packages/prettier-config/`).
- Lint with **ESLint** (shared config at `packages/eslint-config/`).

### Server Components & Client Components

- Mark client components with `"use client"` at the top of the file.
- Use server components by default; only add `"use client"` when you need interactivity, hooks, or browser APIs.
- Server actions live in `apps/web/src/lib/actions/`.
- tRPC procedures are the preferred API layer. Use server actions only for auth flows and one-off mutations.

### UI Components

- Use existing components from `apps/web/src/components/ui/` before creating new ones.
- Follow the design system tokens defined in `docs/DESIGN.md`.
- Lucide icons (`lucide-react`) for all icons.
- Responsive: mobile-first with `sm:`, `md:`, `lg:` breakpoints.
- Accessible: semantic HTML, keyboard navigation, focus-visible, aria labels.

### Auth

- Auth.js v5 with JWT strategy (not database sessions).
- Credentials provider (email + password) is the default.
- OAuth (GitHub, Google) is optional and only enabled when env vars are set.
- See `docs/adr/006-credentials-oauth-auth.md` for the full rationale.

### tRPC

- All dashboard API calls go through tRPC routers at `apps/web/src/server/api/root.ts`.
- Use `protectedProcedure` for anything requiring authentication.
- Use `publicProcedure` for unauthenticated endpoints.
- Co-locate router files in `apps/web/src/server/api/routers/`.

## Making Changes

### Adding a New Feature

1. Check existing code for similar patterns — mimic them.
2. Update both PG and SQLite schemas if the change is database-related.
3. Add the tRPC procedure(s) and register in `root.ts` if needed.
4. Write the UI component following the design system.
5. Run `pnpm turbo typecheck` and `pnpm lint`.

### Adding a New Database Table

1. Define the schema in `packages/db/src/schemas/pg/your-table.ts` and `packages/db/src/schemas/sqlite/your-table.ts`.
2. Export the table from `packages/db/src/schemas/pg/index.ts` and `packages/db/src/schemas/sqlite/index.ts`.
3. Generate a PG migration: `pnpm db:generate`.
4. Add the raw SQL to `packages/db/src/migrations-sqlite/0000_init.sql` for SQLite.
5. Update the manual DDL in the SQLite migration file if needed.

### Adding a New AI Provider

For OpenAI-compatible APIs: no code needed. Configure the agent in the dashboard with "OpenAI Compatible" type, set `baseUrl`, `apiKey`, and `model`.

For non-OpenAI-compatible APIs (e.g., Anthropic): create a provider file in `packages/ai/src/providers/` implementing the `AIProvider` interface, then register it in `packages/ai/src/registry.ts`.

### Architecture Decisions

Significant architectural changes require an ADR (Architecture Decision Record):

```sh
pnpm adr:create    # Creates a new ADR from template in docs/adr/
```

The pre-commit hook (`scripts/adr-check.sh`) will warn if you change core files without a matching ADR.

## Testing

### Browser Testing

Tests use [agent-browser](https://github.com/anthropics/agent-browser):

```sh
pnpm test:browser:install   # Install Chromium (first time only)
pnpm test:browser            # Open homepage and inspect
pnpm test:browser:auth       # Sign in with seed account
```

### Seed Account

| Field    | Value                |
| -------- | -------------------- |
| Email    | `admin@chasteai.dev` |
| Password | `password123`        |

## Reporting Issues

Please report bugs and feature requests at [github.com/anomalyco/chasteai/issues](https://github.com/anomalyco/chasteai/issues).

## Code of Conduct

Be respectful, constructive, and inclusive. We're building something great together.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
