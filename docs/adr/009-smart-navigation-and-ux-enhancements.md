# ADR-009: Smart Navigation, UX Enhancements, and Web Crawler

## Status

Proposed

## Context

The application needed several UX improvements and new features to provide a more polished experience:

1. **Smart first-run detection** — The homepage always showed the setup prompt regardless of configuration state.
2. **Auto sign-out** — No idle session timeout or configurable session expiry existed.
3. **Loading animations** — No page transition animations.
4. **Auth page layout** — Sign-in/sign-up pages used a card wrapper inconsistent with the homepage design.
5. **Sidebar overflow** — Sidebar nav items could overflow without scrolling, and the Settings link was pushed too far down.
6. **Mobile responsive** — No collapsible sidebar for mobile devices.
7. **RAG website ingestion** — Website source type existed in the schema but no web crawler or UI was implemented.

## Decision

### 1. First-Run Detection (`apps/web/src/app/page.tsx`)

The homepage now queries for existing users. If authenticated → redirect to `/dashboard`. If any user exists → redirect to `/signin`. If no user → show the setup/launchpad prompt. This eliminates the need for manual navigation.

### 2. Auto Sign-Out (`apps/web/src/auth.ts`, `components/idle-timeout-provider.tsx`)

- **Absolute expiry**: JWT `maxAge` set to 7 days by default in auth.ts.
- **Idle timeout**: `IdleTimeoutProvider` client component wraps the dashboard layout. Listens for `mousedown/keydown/scroll/touchstart` events, resets a timer. When idle exceeds the configured timeout, silently calls `signOut()`.
- **Settings page** at `/dashboard/settings` provides toggles and inputs for both timeouts, stored in the workspace `settings` JSONB column.

### 3. Loading Animation (`components/ui/page-loader.tsx`)

Custom CSS-only ring animation (three concentric rings rotating and pulsing at offset intervals). Used via `loading.tsx` files in each route group (`(dashboard)/`, `(auth)/`, `(setup)/`), triggered on every route transition by Next.js App Router.

### 4. Auth Page Redesign (`(auth)/layout.tsx`, `signin/page.tsx`, `signup/page.tsx`)

Removed the card wrapper (`bg-surface-elevated rounded-xl border p-8 shadow-2xl`). Auth pages now use the same full-bleed layout as the homepage — centered content with radial gradient + grid background. Added Command icon branding above the form titles.

### 5. Sidebar Fixes (`(dashboard)/layout.tsx`)

Added `overflow-y-auto` with `min-h-0` to the nav container so it scrolls independently when items exceed viewport height. Settings stays pinned at the bottom via `mt-auto`.

### 6. Mobile Sidebar (`(dashboard)/layout.tsx`)

Added collapsible overlay drawer:
- Hamburger (Menu) button in header, visible only on mobile (`lg:hidden`)
- Sidebar becomes a fixed overlay (`fixed inset-y-0 left-0 z-40`) with backdrop
- Desktop (`lg:` breakpoint): sidebar is static in-flow (`lg:static lg:z-0 lg:translate-x-0`)
- Animates with `translate-x` transition
- Closes on navigation (pathname change)

### 7. Website Crawler (`packages/rag/src/crawler/`)

Full site crawler using `cheerio` for HTML parsing:
- Accepts root URL, max pages (1-500), max depth (1-5)
- Same-domain crawling only
- Respects `User-Agent: ChasteAI-Crawler/1.0`
- 10-second fetch timeout

The crawl API (`/api/documents/crawl`) creates a document with `sourceType: "website"`, sets status to `processing`, then runs the crawl asynchronously. Each page is chunked and embedded, stored as `document_chunks`. Status is updated to `ready` on completion or `failed` on error. The documents page has a "Website" tab for submitting URLs.

## Consequences

- Users are no longer required to manually navigate between setup and sign-in based on app state.
- Idle sessions are automatically cleaned up, improving security.
- Page transitions feel smoother with loading animations.
- Auth pages have a consistent visual identity with the homepage.
- The sidebar works correctly across all viewport heights and device sizes.
- Mobile users get a proper sidebar experience.
- Website content can now be ingested as knowledge base documents, filling the gap in the RAG pipeline.
- The async crawl API may need rate limiting and monitoring for large crawls in production.
