# ADR-011: Agent Knowledge Management

**Status:** Accepted

**Date:** 2026-07-10

## Context

ChasteAI supports document ingestion with RAG (retrieval-augmented generation), but all agents share the same workspace-wide document pool. In a multi-agent setup, different agents may serve different purposes (support vs. sales vs. technical) and should only reference relevant documents. Without agent-level scoping, an agent could surface documents from unrelated domains, leading to poor answer quality and potential information leakage between use cases.

The platform also needed a way to provide per-agent instructions for how to use its knowledge base (e.g., "prioritize pricing docs" or "always reference the technical manual first").

## Decision

### 1. Junction Table (Whitelist Model)

Created `agent_documents` junction table in both PG and SQLite schemas:

```sql
agent_documents (
  id         UUID PRIMARY KEY,
  agent_id   UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (agent_id, document_id)
)
```

**Privacy model is whitelist-based:**

- **No entries** in `agent_documents` for an agent = workspace-wide access to all documents (default/shared).
- **Entries exist** = agent is scoped to only those assigned documents (private).

This avoids the "deny list" problem where new documents would need to be explicitly excluded from agents. The default is open access, and restriction is explicit.

### 2. RAG Retrieval Scoping

Updated `retrieveRelevantChunks()` in `packages/rag/src/retrieval/index.ts` to accept optional `agentId`. When provided, only chunks from documents linked via `agent_documents` are considered. When absent, falls back to workspace-wide retrieval (backward compatible).

Both chat routes (authenticated `POST /api/chat/[conversationId]` and public widget `POST /api/public/channels/[channelId]/chat/[conversationId]`) pass `agentId` to the retrieval function.

### 3. Ingest-Time Linking

The document ingest API (`POST /api/documents/ingest`) accepts an optional `agentId` in the request body. When provided, it creates an `agent_documents` entry, linking the document to the agent at upload time.

### 4. Knowledge Instructions

Added `knowledge_instructions` text column to the `agents` table (PG + SQLite). This stores free-text instructions for how an agent should use its knowledge base (e.g., "Always reference pricing information. Prioritize technical documentation over blog posts.").

### 5. KnowledgeTab UI

Agent detail page (`agent-detail-client.tsx`) includes a new "Knowledge" tab:

- Lists assigned documents with source type icons and status
- Assign/unassign documents via a modal listing unassigned workspace documents
- Edit knowledge instructions textarea with save

The `KnowledgeTab` component is lazy-loaded only when the tab is active.

### 6. Auto-Channel Creation

When creating an agent (both via tRPC mutation and setup wizard), a Web Widget channel is automatically created for the agent. This ensures agents always have a channel ready for widget embedding. Agent deletion cleans up `agent_documents` records.

## Consequences

### Positive

- Agents can be scoped to specific knowledge domains without affecting other agents
- Default behavior (no entries) preserves backward compatibility — existing agents get workspace-wide access
- Per-agent instructions provide fine-grained control over RAG behavior
- KnowledgeTab gives clear visibility into which documents an agent can access

### Negative

- Two places to manage document assignment: ingest API (at upload time) and KnowledgeTab (retroactive)
- Whitelist model means workspace admins must actively restrict agents that should be private
- No per-document visibility control (only per-agent scoping)

### Neutral

- The `agent_documents` table adds one JOIN to scoped RAG queries
- Auto-created channels on agent creation may need cleanup for agents that never use widgets

## Alternatives Considered

- **Tag-based filtering**: Tags on documents + agent tag preferences. More flexible but adds significant complexity for a use case that is well served by explicit assignment.
- **Role-based document access**: Over-engineered for a single-workspace system. The whitelist model is simpler and more predictable.
- **Deny-list model (exclude specific docs)**: Inverted default — new documents would need explicit exclusion from each agent, which is error-prone and scales poorly.
