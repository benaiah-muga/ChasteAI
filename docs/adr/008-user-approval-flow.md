# ADR-008: User Approval Flow

**Status:** Accepted

**Date:** 2026-06-29

## Context

The platform needs multi-user support where the first user (typically the admin who runs setup) gets full access immediately, while subsequent users require admin approval before they can sign in. This is a common pattern for self-hosted tools and B2B SaaS products where a workspace admin controls access.

The user table schema needed a `status` column to track `active`, `pending`, and `suspended` states. The auth flow needed to branch based on this status at sign-in time, and an admin UI was needed to manage pending users.

## Decision

1. **User status column**: Added `status` (text, default `pending`) to the `user` table with `CHECK` constraints in both PG and SQLite. The first user (atomically determined via `UPDATE ... WHERE NOT EXISTS`) is set to `active`. All subsequent signups remain `pending`.
2. **Sign-in blocking**: Three enforcement points:
   - Credentials `authorize` callback — blocks `pending`/`suspended` at sign-in
   - OAuth `signIn` event callback — blocks `pending`/`suspended` for GitHub/Google providers
   - `signinAction` server action — validates password via bcrypt before revealing account status (prevents email enumeration)
   - `authorized()` middleware callback — re-checks `user.status` on every request to catch suspended users with unexpired JWTs
3. **Pending approval page**: Users who sign up when an active user already exists are redirected to `/pending-approval` — a simple static page with a "waiting for approval" message.
4. **Admin approval UI**: Team Management page (`/dashboard/team`) shows a "Pending approvals" section with approve/deny buttons for each pending user. Approving opens a modal to select workspace and role. Denying immediately sets status to `suspended`.
5. **Server actions**: `approveUserAction` (Zod-validated, transactional update+insert), `denyUserAction` (scoped to admin's workspace), `getPendingUsersAction` (restricted to admin/owner users), and `getAdminWorkspacesAction` in `apps/web/src/lib/actions/admin.ts`.
6. **Additional columns**: Added `theme` and `density` to `user` (for future preferences/settings), and `created_at` for ordering and display.
7. **Schema enforcement**: Unique index on `memberships(workspace_id, user_id)`, FK constraints on `user_sessions.user_id`, `invitations.workspace_id` (SQLite), boolean `is_revoked` on `user_sessions`, and CHECK constraints on `user.status`.

## Consequences

### Positive

- First user has a friction-free onboarding (auto-active, no approval needed)
- Self-hosted admins get manual control over who can access the platform
- Pending/suspended users get clear error messages at sign-in
- Schema supports invite flow and session management (invitations, user_sessions tables)

### Negative

- Three places to maintain status checks (authorize callback, signIn callback, signinAction) — must keep in sync
- OAuth users blocked at signIn event; Credentials users blocked at authorize callback
- Suspended users cannot re-request approval without admin action
- `authorized()` middleware callback re-checks `user.status` on every request for JWT-issued sessions

### Neutral

- The `user_sessions` table enables session listing and revocation in Settings
- The `invitations` table supports the invite-by-email flow

## Alternatives Considered

- **Soft-delete instead of suspended status**: Suspended status preserves the user record and allows reactivation. Soft-delete would lose the account relationship.
- **Approval via email link**: More complex, required email infrastructure. Admin panel approach is simpler for self-hosted setups.
- **Auto-approve all users**: Risk for self-hosted deployments where the admin may want to gate access.
