# ADR-003: tRPC for API Layer

**Status:** Proposed

**Date:** 2026-06-25

## Context

ChasteAI must be API-first — all frontend functionality must consume the same APIs exposed publicly. The API layer needs:
- End-to-end type safety from database to UI
- Real-time streaming support (chat responses)
- File upload capabilities
- Public API surface for third-party integrations
- Webhook support
- Minimal boilerplate
- Co-location with the Next.js frontend in Phase 1

## Decision

Use **tRPC** as the primary API framework, served via Next.js Route Handlers.

### Architecture

```
tRPC Router Tree:
├── workspace         # CRUD + member management
├── agent             # Agent configuration
├── conversation      # Chat conversations
│   ├── send          # Send message (with streaming)
│   └── history       # Retrieve conversation history
├── channel           # Channel configuration
├── document          # Document ingestion management
├── analytics         # Query analytics data
├── subscription      # Billing management
├── admin             # Admin-only operations
└── public            # Unauthenticated endpoints (widget, etc.)
```

### Why tRPC over alternatives

- **End-to-end type safety**: The same types flow from Drizzle schema → tRPC router → React Query hooks → UI. No manual API client generation. No runtime validation of API responses needed.
- **Streaming natively**: tRPC supports `subscription` and async generator patterns — critical for streaming AI chat responses character-by-character.
- **Co-location with Next.js**: tRPC server runs inside Next.js Route Handlers. No separate API server to deploy in Phase 1.
- **Zero API contract drift**: The router IS the contract. If a type compiles, the API is consistent.
- **Inferrable types**: `inferRouterOutputs` and `inferRouterInputs` let us build type-safe React hooks automatically.

### Public API surface

For third-party integrations that can't use tRPC (non-TypeScript clients, webhooks), we expose:
- **REST endpoints** for key operations (webhooks, widget API)
- **tRPC's HTTP GET/JSON endpoints** which are standard REST under the hood
- **OpenAPI spec** generated from tRPC routers via `trpc-openapi`

Phase 1 focuses on tRPC. REST/OpenAPI wrappers are Phase 2.

## Consequences

### Positive

- Zero type drift between frontend and backend
- Streaming AI responses is trivial with async generators
- tRPC subscriptions for real-time analytics
- No Swagger/OpenAPI maintenance burden (auto-generated when needed)
- Excellent DevEx: autocompleted API calls, caught-at-compile-time breaking changes
- React Query integration via `@trpc/tanstack-react-query` eliminates manual loading/error state management

### Negative

- tRPC is TypeScript-only — non-TypeScript consumers need the REST bridge
- Learning curve for contributors unfamiliar with tRPC patterns
- tRPC's error handling model requires understanding the `TRPCError` system
- Public API documentation requires additional tooling (trpc-openapi or manual OpenAPI generation)

### Neutral

- If the project later needs a separate BFF or microservice, tRPC can run in its own server

## Alternatives Considered

- **REST (Next.js API Routes manually)**: Would require manual validation, manual types, manual client generation. Too much boilerplate. No streaming support without SSE boilerplate.
- **GraphQL (Apollo/Relay)**: Heavy runtime, complex caching, over-fetching prevention not needed for a first-party app. GraphQL shines for third-party API consumption — ChasteAI's primary consumer is its own frontend.
- **OpenAPI-generator (Orval, openapi-typescript)**: Codegen step introduces drift potential. Better than raw REST but no streaming, no subscriptions.
- **WebSockets directly**: Too low-level; would need to reimplement RPC patterns and serialization.
