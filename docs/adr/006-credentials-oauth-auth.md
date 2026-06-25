# ADR-006: Credentials + OAuth Authentication Strategy

**Status:** Accepted

**Date:** 2026-06-25

## Context

ChasteAI needs authentication that works out of the box for self-hosted deployments without requiring external services. The PRD specifies self-host-first — every feature must work locally. Auth.js v5 is already in place with a Drizzle adapter. The choice is which authentication providers to support and how to handle password storage.

Key requirements:
- Zero external dependencies for local development (no GitHub OAuth, no SMTP server)
- Support OAuth as optional enhancement for production deployments
- Must integrate with the existing Auth.js + Drizzle adapter setup
- Password hashing must be secure (bcrypt), no plaintext storage
- OAuth-only users should not have password-based login (no confusion)

## Decision

### Provider Strategy

Use **Credentials (email + password) as the default provider** with **OAuth providers as optional enhancements**.

```typescript
providers: [
  // Always enabled — zero external dependencies
  Credentials({ /* bcrypt-verified email/password */ }),
  // Conditionally enabled — only if env vars are configured
  ...(process.env.AUTH_GITHUB_ID ? [GitHub] : []),
  ...(process.env.AUTH_GOOGLE_ID ? [Google] : []),
]
```

### User Table Extension

The `@auth/drizzle-adapter`'s default `user` table is extended with a `password` field (nullable — only set for credential users):

```typescript
const customUsers = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),  // bcrypt hash, null for OAuth users
})
```

### Auth Flow

| Scenario | Flow |
|---|---|
| Email signup | Form → bcrypt hash → insert user → JWT → redirect to dashboard |
| Email signin | Form → bcrypt verify → JWT → redirect to dashboard |
| OAuth signin | GitHub/Google button → OAuth callback → adapter creates user → JWT → redirect |
| OAuth returning | Session cookie → middleware allows → dashboard |

### Password Security

- `bcryptjs` (pure JS, no native deps) for password hashing
- Cost factor: 10 (standard)
- Password field is never selected by default in user queries (must be explicitly requested)
- API never returns password hash

## Consequences

### Positive

- `pnpm dev` + `docker compose up postgres` = fully working auth with zero external signups
- OAuth providers are zero-config additions — add env vars, they appear on sign-in page
- Custom user table approach keeps adapter compatibility (same column names, just +1)
- No email server required for Phase 1 (recovery can be manual or via env-optional Resend)

### Negative

- We own password hashing, rate limiting, and account recovery
- Credential login introduces more attack surface than OAuth-only — mitigated by bcrypt and future rate limiting
- Users created via email vs OAuth are in the same table, distinguished only by `password IS NULL`

### Neutral

- If we add password reset later, it requires email infrastructure (Resend/SMTP)
- OAuth-only deployments can ignore passwords entirely by removing the Credentials provider

## Alternatives Considered

- **OAuth-only**: Would force self-host users to configure GitHub/Google OAuth apps before first login. Violates self-host-first principle.
- **Magic links via Resend only**: Requires SMTP configuration. Better DX than OAuth but still not zero-dependency.
- **Single sign-on service (SSO)**: Overkill for Phase 1. Can be added as an enterprise feature in Phase 3.
- **Auth0/Clerk hosted auth**: Violates self-host-first. Would make the project dependent on third-party services.
