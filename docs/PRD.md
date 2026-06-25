# ChasteAI — Product Requirements Document (PRD) & Engineering Constitution

## Vision

ChasteAI is an open-source AI customer support infrastructure platform designed for businesses, developers, and enterprises that require scalable, extensible, self-hostable, and provider-agnostic AI support systems.

The platform enables organizations to deploy intelligent AI-powered customer support assistants across multiple channels while maintaining ownership, flexibility, observability, and infrastructure portability.

ChasteAI is not merely a chatbot platform. It is an extensible AI support operating system.

The project prioritizes:

- developer experience
- exceptional product design
- self-hostability
- modularity
- infrastructure portability
- reliability
- observability
- extensibility
- AI provider abstraction
- long-term maintainability

The project must remain approachable for:

- solo developers
- startups
- SMBs
- enterprises
- on-premise deployments
- edge deployments
- privacy-sensitive organizations

---

## Core Product Principles

### 1. Self-Host First

Every major feature must be capable of running locally. Cloud services are optional enhancements, not hard dependencies.

The platform must support:

- local development
- Docker deployment
- Kubernetes deployment
- edge deployment
- offline/local inference deployments

Preferred local stack:

- Turso or PostgreSQL
- SQLite-compatible modes where possible
- Ollama/local inference support
- local embeddings
- Cloudflare R2-compatible storage abstraction

No feature should assume mandatory cloud dependency unless explicitly documented.

---

### 2. Provider Agnostic Architecture

The platform must never tightly couple itself to a single AI provider. All AI providers must implement standardized interfaces.

Supported providers may include:

- OpenAI
- Grok
- NVIDIA
- Anthropic
- Gemini
- OpenRouter
- Ollama
- vLLM
- LM Studio
- OpenAI-compatible APIs

All providers must support:

- health checks
- connection testing
- model listing
- streaming
- embeddings
- tool/function calling
- retries
- failover hooks

Providers must be swappable without modifying application business logic.

---

### 3. Multi-Tenant by Design

The architecture must support:

- organizations/workspaces
- multiple agents
- multiple channels
- permissions
- billing isolation
- data isolation

The system should never assume one business equals one assistant.

Structure: Workspace → Agents → Channels → Conversations

---

### 4. API-First Architecture

All functionality must be accessible via APIs. The frontend dashboard should consume the same APIs exposed publicly. Internal logic should not bypass public contracts.

---

### 5. UX Is Infrastructure

Product design is a core system requirement. Every feature must prioritize:

- clarity
- discoverability
- accessibility
- responsiveness
- low cognitive load
- fast onboarding
- progressive disclosure

The UI should feel:

- modern
- calm
- trustworthy
- minimal
- fast
- enterprise-ready

Avoid cluttered dashboards.

---

## Engineering Constitution

### Mandatory Engineering Standards

**Type Safety**

- TypeScript strict mode enabled
- avoid `any`
- shared schema validation via Zod

**Code Quality**

- ESLint
- Prettier
- Husky hooks
- lint-staged
- Conventional commits

**Testing Requirements**

Every feature must include:

- unit tests
- integration tests
- API contract tests

Critical systems require:

- E2E tests
- load testing
- failure testing

**Documentation Requirements**

Every major feature must include:

- architecture explanation
- usage documentation
- API examples
- environment variables
- migration notes

**Accessibility**

All UI must meet accessibility standards:

- keyboard navigation
- screen reader support
- sufficient contrast
- semantic HTML

**Observability**

Every critical service must expose:

- structured logs
- metrics
- tracing hooks
- health checks

---

## Repository Standards

The repository must include:

- README.md
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- LICENSE
- SECURITY.md
- ROADMAP.md
- ARCHITECTURE.md
- API_SPEC.md
- DEPLOYMENT.md
- DESIGN_SYSTEM.md

---

## Contributor Rules

Contributors and AI agents must:

1. Analyze existing architecture before implementation.
2. Avoid introducing duplicate abstractions.
3. Prefer extension over replacement.
4. Maintain backward compatibility where possible.
5. Avoid hardcoded provider-specific logic.
6. Avoid premature optimization.
7. Preserve self-host compatibility.
8. Preserve mobile responsiveness.
9. Preserve accessibility.
10. Preserve API consistency.

Large architectural changes require RFC documentation.

---

## AI Agent Contribution Protocol

Any AI coding agent contributing to the repository must:

### Before Implementation

- analyze relevant code paths
- identify architectural patterns
- identify shared abstractions
- check existing utilities before creating new ones
- verify existing schemas/types

### During Implementation

- maintain type safety
- preserve modularity
- add tests
- update docs
- avoid breaking APIs
- avoid hidden side effects

### After Implementation

- run linting
- run tests
- verify mobile responsiveness
- verify accessibility
- verify self-host compatibility
- verify environment variable documentation

AI agents should explain:

- reasoning
- architectural decisions
- tradeoffs
- limitations
- future extensibility considerations

---

## Architecture Principles

### Monorepo Structure

```
apps/
packages/
services/
tooling/
docs/
```

Use Turborepo.

---

## Frontend Stack

Primary:

- Next.js
- TypeScript
- Tailwind
- shadcn/ui

Requirements:

- responsive
- keyboard accessible
- dark mode support
- mobile-first
- skeleton loading states
- optimistic UI where appropriate

---

## Backend Requirements

Backend services must support:

- retries
- queues
- idempotency
- rate limiting
- structured errors
- streaming responses

Recommended:

- Trigger.dev
- BullMQ
- Redis-compatible queues

---

## Database Strategy

Primary:

- PostgreSQL
- pgvector
- Neon support

Secondary/local-first:

- Turso
- SQLite-compatible support

Database logic must remain adapter-based. No hardcoded vendor assumptions.

---

## Storage Strategy

Object storage abstraction layer required.

Supported:

- Cloudflare R2
- S3-compatible providers
- local filesystem mode

---

## RAG System Requirements

The RAG system must support:

- ingestion pipelines
- chunking strategies
- metadata enrichment
- deduplication
- hybrid retrieval
- reranking
- semantic filtering

Supported data sources:

- websites
- PDFs
- DOCX
- markdown
- APIs
- Notion
- GitHub
- help centers

---

## Security Principles

Mandatory:

- encrypted secrets
- secure cookies
- CSRF protection
- rate limiting
- tenant isolation
- audit logging
- permission boundaries

Never expose provider secrets to clients.

---

## Product Roadmap

### Phase 1 — Foundation

- authentication
- organizations/workspaces
- assistant creation
- website ingestion
- basic RAG
- embeddable widget
- basic analytics
- subscriptions
- provider abstraction

### Phase 2 — Platform

- multiple agents
- workflows
- advanced analytics
- evaluation systems
- integrations
- human handoff

### Phase 3 — Infrastructure

- omnichannel support
- voice
- plugin marketplace
- enterprise controls
- SSO/SAML
- advanced observability

---

## Non-Goals (Early Stages)

Avoid early implementation of:

- excessive workflow builders
- overcomplicated automation systems
- unnecessary microservices
- premature enterprise complexity

Focus on reliability first.

---

## Success Metrics

The platform succeeds if:

- onboarding takes under 10 minutes
- self-host setup takes under 15 minutes
- contributors can onboard quickly
- AI agents can contribute safely
- businesses trust deployment reliability
- developers can extend functionality easily

---

## Final Principle

ChasteAI should become:

- simple for beginners
- powerful for enterprises
- extensible for developers
- reliable for production
- portable across infrastructure
- beautiful to use
- trustworthy to deploy
