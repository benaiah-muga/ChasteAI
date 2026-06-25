# ADR-001: Monorepo with Turborepo + pnpm

**Status:** Proposed

**Date:** 2026-06-25

## Context

ChasteAI requires multiple applications (Next.js dashboard, embeddable widget, documentation site) and shared packages (database, auth, AI providers, UI components) that must be developed, tested, and deployed coherently.

Key requirements:
- Shared TypeScript configurations across all packages
- Shared linting and formatting rules
- Efficient dependency management (deduplication)
- Fast CI with caching
- Ability to run, test, and build subsets of the project
- Low barrier to entry for contributors

## Decision

Use **Turborepo** with **pnpm workspaces** as the monorepo toolchain.

### Why pnpm over npm/yarn

- **Disk efficiency**: Content-addressable storage means `node_modules` is deduplicated at the file system level. Across 15+ packages, this saves gigabytes.
- **Strictness**: pnpm's strict dependency resolution prevents implicit access to undeclared dependencies — catches errors early.
- **Workspace protocol**: The `workspace:*` protocol makes internal package references explicit and publishable.
- **Speed**: Significantly faster than npm, competitive with yarn Berry.

### Why Turborepo over Nx/Lage/Lerna

- **Zero-config caching**: `turbo.json` defines cache keys per task with minimal config.
- **Parallelism**: Automatic parallel execution respecting the dependency graph.
- **CI-native**: Remote caching support (Vercel, S3-compatible).
- **Simplicity**: Far less configuration overhead than Nx. Teams can understand the build graph without learning an entire framework.
- **Task orchestration**: `dependsOn` allows expressing that `build` depends on `^build` (upstream packages build first).

## Consequences

### Positive

- Single `pnpm install` installs all dependencies
- Shared tooling configs in `tooling/` reduce duplication
- CI caches turbo outputs, making builds fast
- TypeScript project references work naturally with Turborepo's topological build order
- Contributors only need to understand `turbo.json` and `pnpm-workspace.yaml`

### Negative

- Monorepo complexity can grow if boundaries aren't respected — mitigated by clearly defined package ownership
- pnpm's strictness occasionally requires explicit `peerDependencies` declarations

### Neutral

- Migrating a package out to its own repo later is straightforward if needed

## Alternatives Considered

- **Nx**: More powerful but significantly more complex. Overkill for a team that values simplicity.
- **Lerna**: Largely unmaintained; npm workspaces + Lerna adds little over pnpm workspaces.
- **Single repo (no monorepo)**: Would force premature separation and duplicated configs.
- **Bun workspace**: Too early; ecosystem and CI maturity not yet at parity.
