# ChasteAI

Open-source AI customer support infrastructure. Self-host first — everything works locally with zero external dependencies.

## Architecture

- **Monorepo**: Turborepo + pnpm workspaces (10 packages)
- **Database**: PostgreSQL via Drizzle ORM. SQLite/Turso fallback planned.
- **API Layer**: tRPC (end-to-end type safety, co-located with Next.js)
- **Auth**: Auth.js v5 with Credentials (default) + optional OAuth (GitHub, Google)
- **AI**: Provider-agnostic strategy pattern via registry (OpenAI implemented)
- **Frontend**: Next.js 15 App Router, React 19

### Packages

| Package | Path | Purpose |
|---|---|---|
| `@chaste-ai/web` | `apps/web/` | Next.js app (auth, dashboard, API routes) |
| `@chaste-ai/db` | `packages/db/` | Drizzle schema, migrations, client, seed script |
| `@chaste-ai/ai` | `packages/ai/` | AI provider abstraction + OpenAI provider |
| `@chaste-ai/ui` | `packages/ui/` | Shared React components |

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 10
- PostgreSQL 14+

### Setup

```sh
# Install dependencies
pnpm install

# Copy environment file
cp apps/web/.env.example apps/web/.env

# Set DATABASE_URL in apps/web/.env
# PostgreSQL: postgres://postgres:password@localhost:5432/chasteai

# Run database migrations
pnpm db:migrate

# Seed development data (admin@chasteai.dev / password123)
pnpm db:seed

# Start dev server
pnpm dev
```

The dev server runs at `http://localhost:3000`.

### Development Commands

```sh
pnpm dev              # Start all dev servers
pnpm build            # Build all packages
pnpm turbo typecheck  # Type-check all packages
pnpm lint             # Lint all packages
pnpm db:generate      # Generate migration from schema changes
pnpm db:migrate       # Run pending migrations
pnpm db:seed          # Seed dev user + workspace
pnpm adr:create       # Create a new Architecture Decision Record
```

## Auth

The default auth strategy uses **email + password** with bcryptjs hashing. Sign up at `/signup` or use the seed account:

- Email: `admin@chasteai.dev`
- Password: `password123`

### OAuth (Optional)

Set these environment variables in `apps/web/.env` to enable GitHub or Google sign-in:

```
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

## Database

15 tables managed by Drizzle ORM:

- **Auth**: user, account, session, verificationToken (via `@auth/drizzle-adapter`)
- **Core**: workspaces, agents, conversations, messages, documents, document_chunks
- **Operations**: channels, api_keys, memberships, subscriptions, analytics_events

### Schema changes

```sh
# 1. Edit schema in packages/db/src/schemas/
# 2. Generate migration
pnpm db:generate
# 3. Apply migration
pnpm db:migrate
```

## API (tRPC)

tRPC routes live in `apps/web/src/server/api/`. Two procedure types:

- **publicProcedure** — no auth required (e.g., health check)
- **protectedProcedure** — requires valid session, provides `ctx.session.user.id`

### Calling from server components

```ts
import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"

const ctx = await createTRPCContext()
const caller = appRouter.createCaller(ctx)
const result = await caller.workspace.list()
```

## Docker Compose (Optional)

`docker-compose.yml` provides:

- PostgreSQL with pgvector
- Redis
- MinIO (S3-compatible storage)
- Ollama (local LLM)

```sh
docker compose up -d
```

## Architecture Decision Records

All architectural changes are documented in `docs/adr/`. Create a new ADR with:

```sh
pnpm adr:create
```

A pre-commit hook detects changes to core architecture files and reminds you to document them.

## License

MIT
