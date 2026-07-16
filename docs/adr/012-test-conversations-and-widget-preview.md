# ADR-012: Test Conversations and Widget Preview

**Status:** Accepted

**Date:** 2026-07-10

## Context

When developing or configuring AI agents, operators need to test agent behavior without creating real conversations that pollute analytics data and confuse support metrics. There was no sandboxed testing environment — any conversation created through the widget was treated as real, skewing analytics and making it difficult to iterate on agent prompts, knowledge base configuration, and provider settings.

Additionally, agents needed a quick way to be previewed in context (embedded in a mock website) rather than requiring manual widget embedding or API calls.

## Decision

### 1. Test Conversation Flag

Added `is_test` boolean column to the `conversations` table (PG + SQLite), default `false`.

### 2. Widget Test Mode

Appending `?test=true` to the widget URL activates test mode:

- A "TEST" badge appears in the widget header
- New conversations created while in test mode are marked with `is_test: true` in the database
- The flag propagates through the conversation creation flow: widget → public API → database

### 3. Analytics Exclusion

All analytics queries in `packages/analytics/src/service.ts` filter out `is_test=true` conversations:

- Overview stats (total conversations, messages, active agents)
- Volume over time
- Status distribution
- Agent ranking
- Channel distribution

This ensures test conversations never appear in production analytics.

### 4. Dashboard Filtering

The conversations list (`conversations-list.tsx`) includes:

- A filter toggle: "All" vs "Real only" (excludes test conversations)
- A "Test" badge on conversations where `is_test: true`
- Visual distinction so operators can identify test conversations at a glance

### 5. Widget Preview Page

Created `/dashboard/agents/[agentId]/preview`:

- Server component (`preview/page.tsx`) fetches the agent and its widget channel
- Client component (`preview/preview-client.tsx`) renders a mock website with a header, sidebar, and content area
- The real widget is embedded as an iframe in test mode (`?test=true`)
- "Preview" button added to the agent detail header for quick access

This provides a realistic testing environment without requiring manual embedding.

## Consequences

### Positive

- Test conversations are fully isolated from analytics
- Operators can iterate on agents freely without worrying about data contamination
- Preview page provides immediate feedback on agent behavior in a realistic context
- Filter toggle in dashboard lets operators choose their view

### Negative

- `is_test` column adds a filter condition to every analytics query
- Widget test mode requires the URL query parameter — not obvious without documentation
- Preview page creates real database records (just flagged as test), not fully ephemeral

### Neutral

- The `is_test` flag is simple to implement and maintain
- Test conversations are visible in the dashboard but clearly marked
- No performance impact — the `is_test` index is lightweight

## Alternatives Considered

- **Separate test database**: Full isolation but requires maintaining two databases and complicates the setup wizard. Over-engineered for this use case.
- **Client-side only test mode**: Would not persist test conversations at all. Loses the ability to review test conversations in the dashboard.
- **Mock widget (no real API calls)**: Would not test the actual AI response pipeline. The real widget in test mode provides end-to-end coverage.
- **Time-based auto-cleanup**: Could auto-delete test conversations after N days, but adds complexity and the current flag approach is sufficient.
