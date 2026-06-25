# ADR-002: Drizzle ORM for Database Access

**Status:** Proposed

**Date:** 2026-06-25

## Context

ChasteAI's database strategy requires:
- **PostgreSQL in production** (with pgvector for embeddings, Neon compatibility)
- **SQLite/Turso in development and self-host deployments**
- Type-safe queries that compose with tRPC
- Minimal bundle size for edge deployments
- No proprietary engines or binary dependencies
- Clean migration workflows

## Decision

Use **Drizzle ORM** as the database access layer.

### Why Drizzle over Prisma

| Concern | Drizzle | Prisma |
|---|---|---|
| Multi-dialect (Postgres + SQLite) | Single schema, adapter-swappable | Separate schema per provider, different syntax |
| Edge/Serverless compatibility | ~50KB, no binary | ~5MB+ engine binary, cold starts |
| pgvector support | Native `sql` template tags | `$raw` escape hatch, awkward |
| Migration approach | Reversible SQL (drizzle-kit) | Proprietary snapshots, destructive by default |
| TypeScript integration | Types compose naturally with tRPC | Requires codegen step |
| Self-host philosophy | Zero proprietary dependencies | Closed-source engine, binary downloads |
| Bundle size | Tree-shakeable, minimal | Engine included even for simple queries |

### The Drizzle pattern for ChasteAI

Each database entity gets a schema file in `packages/db/src/schemas/`. A single `client.ts` exports the appropriate driver based on environment:

```typescript
// Conceptual pattern — not final API
import { drizzle } from "drizzle-orm/node-postgres"
import { drizzle } from "drizzle-orm/libsql"

const db = env.USE_SQLITE
  ? drizzle(new TursoClient(env.TURSO_URL))
  : drizzle(new Pool({ connectionString: env.DATABASE_URL }))
```

## Consequences

### Positive

- Same schema definitions work for Postgres and SQLite
- No codegen step in CI
- Drizzle Kit generates reversible, human-readable SQL migrations
- Query results are plain objects — no proxy objects, no serialization surprises
- Excellent integration with tRPC (types flow naturally through routers)
- Small deployable size for edge/self-host

### Negative

- Drizzle's query builder has a different API than Prisma — team must learn it
- Some advanced PostgreSQL features require raw SQL via `sql` template tag
- Migration diffing is less automated than Prisma's snapshot approach

### Neutral

- Drizzle is newer than Prisma; ecosystem around it is smaller but growing quickly

## Alternatives Considered

- **Prisma**: Rejected due to engine binary, poor multi-dialect support, and closed-source migration engine. Better DX but wrong fit for self-host-first philosophy.
- **Kysely**: Type-safe SQL builder, not an ORM. Would require building a migration system and relationship handling manually. Too much reinvention for this project.
- **Raw SQL (node-postgres + better-sqlite3)**: Maximum control but no type safety, no migration system, no ergonomic query building. Would slow development significantly.
- **TypeORM**: Legacy; decorator-based API doesn't fit ChasteAI's functional TypeScript style. Performance and type safety concerns.
