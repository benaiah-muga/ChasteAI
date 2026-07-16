# ADR-010: Single-Workspace Simplification

**Status:** Accepted

**Date:** 2026-07-09

## Context

The original architecture assumed multi-workspace from day one: every tRPC router, permission check, and UI component was built around the concept of scoping data to a user's workspace, requiring workspace membership verification at every access point.

This resulted in:

- **6 potential null-pointer crashes** from unguarded `membership.role` access
- **~15 duplicated permission check sequences** across 9 tRPC routers (the "fetch agent → check membership" pattern)
- **Unnecessary UI complexity**: workspace switcher, workspace CRUD pages, workspace selection in forms
- **Complex auth flow**: workspace selection on signup, workspace context in session
- **Inflated codebase**: ~40% of routing logic is workspace membership management

For v0.1.0, the primary use case is a company self-hosting one instance with one AI agent for their customer support. Multi-workspace is premature for the first stable release.

## Decision

Simplify the architecture to **one workspace per instance**:

1. **Setup creates the single workspace.** The first user (setup wizard) creates it. Subsequent users join it.
2. **All users share the same workspace.** The `memberships` table still exists (to track who has access) but is simplified — no workspace switching, no workspace selection.
3. **Roles simplified to `admin` / `member`.** The first user is admin. Admins can approve pending users. Members cannot delete the workspace or approve users.
4. **Workspace CRUD removed from UI.** No workspace list page, no workspace switcher, no workspace creation forms.
5. **Permission checks simplified.** Instead of verifying workspace membership for every operation, we verify the user exists and has `active` status. The single workspace is implicit.
6. **Router queries scoped to the single workspace.** All lists (agents, channels, conversations, documents) query against the single workspace ID, which is stored in a well-known location (e.g., first workspace row, or a server-side singleton).

## Consequences

### Positive

- Eliminates ~40% of routing complexity
- Fixes 6 potential null-pointer crashes at the source
- Dramatically simplifies auth flow (no workspace selection)
- Removes multiple UI pages (workspace list, workspace creation, workspace settings)
- Faster onboarding: new users don't need workspace selection
- Cleaner API surface for v0.1.0

### Negative

- Backward incompatible for anyone who built on the multi-workspace API
- Future multi-workspace support requires re-architecting back in
- Some schema tables may have vestigial `workspaceId` columns that need migration

### Neutral

- The `workspaces` table stays (one row) — foreign key references remain valid
- `memberships` table stays but is simplified — existing migration paths preserved
- The `invitations` table is removed (not needed for single-workspace)

## Alternatives Considered

- **Keep multi-workspace, fix all bugs**: Would require fixing 6 null-pointer crashes, 15 duplicated permission sequences, and maintaining the cognitive overhead throughout v0.1.0. Not justified for a product that doesn't yet have users requesting multi-workspace.

- **Remove workspaces entirely (flat model)**: Each user has their own agents directly. Simpler but makes the future multi-workspace migration harder (no `workspaceId` on tables). Also breaks the workspace → agents → channels → conversations hierarchy in the data model.

- **Keep multi-workspace but introduce a helper library**: Extract all the permission checking into reusable functions. Solves the DRY violations and null-pointer crashes but doesn't reduce the architectural complexity or cognitive load.
