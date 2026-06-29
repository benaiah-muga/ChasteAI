# ADR-008: User Approval Flow

**Status:** Accepted

**Date:** 2026-06-29

## Context

The platform needs multi-user support where the first user (typically the admin who runs setup) gets full access immediately, while subsequent users require admin approval before they can sign in. This is a common pattern for self-hosted tools and B2B SaaS products where a workspace admin controls access.

The user table schema needed a `status` column to track `active`, `pending`, and `suspended` states. The auth flow needed to branch based on this status at sign-in time, and an admin UI was needed to manage pending users.

## Decision

1. **User status column**: Added `status` (text, default `pending`) to the `user` table. The first user (user count === 0 at signup) is set to `active`. All subsequent signups are `pending`.
2. **Sign-in blocking**: Both the Credentials `authorize` callback and the `signinAction` server action check for `pending` or `suspended` status and return null or an error message respectively.
3. **Pending approval page**: Users who sign up when an active user already exists are redirected to `/pending-approval` — a simple static page with a "waiting for approval" message.
4. **Admin approval UI**: Team Management page (`/dashboard/team`) shows a "Pending approvals" section with approve/deny buttons for each pending user. Approving opens a modal to select workspace and role. Denying immediately sets status to `suspended`.
5. **Server actions**: `approveUserAction`, `denyUserAction`, `getPendingUsersAction`, and `getAdminWorkspacesAction` in `apps/web/src/lib/actions/admin.ts`.
6. **Additional columns**: Added `theme` and `density` to `user` (for future preferences/settings), and `created_at` for ordering and display.

## Consequences

### Positive

- First user has a friction-free onboarding (auto-active, no approval needed)
- Self-hosted admins get manual control over who can access the platform
- Pending/suspended users get clear error messages at sign-in
- Schema supports future invite flow and session management (invitations, user_sessions tables)

### Negative

- Two places to maintain status checks (authorize callback + signinAction) — must keep in sync
- Pending users who are denied (suspended) can't re-request approval without admin action

### Neutral

- The `user_sessions` table is created but not yet wired into the UI — will be used for session management in Settings
- The `invitations` table supports future invite-by-email flow but is not yet used

## Alternatives Considered

- **Soft-delete instead of suspended status**: Suspended status preserves the user record and allows reactivation. Soft-delete would lose the account relationship.
- **Approval via email link**: More complex, required email infrastructure. Admin panel approach is simpler for self-hosted setups.
- **Auto-approve all users**: Risk for self-hosted deployments where the admin may want to gate access.
