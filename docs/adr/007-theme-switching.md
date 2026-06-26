# ADR-007: Theme Switching (Light / Dark Mode)

**Status:** Proposed

**Date:** 2026-06-26

## Context

The ChasteAI setup wizard uses a dark-themed UI for its installer-like feel. The main application (dashboard, auth pages, homepage) uses a light theme. Users should be able to switch between light and dark themes across the entire application.

## Decision

Implement theme switching using **CSS custom properties (variables)** with a `data-theme` attribute on the `<html>` element, persisted in `localStorage` with a system preference fallback.

### Theme Scope

| Surface | Initial Theme | Switchable |
|---|---|---|
| Setup wizard (`/setup`) | Dark | No (wizard is a one-time flow) |
| Dashboard (`/dashboard`) | Light | Yes |
| Auth pages (`/signin`, `/signup`) | Light | Yes |
| Homepage (`/`) | Light | Yes |
| Public widget | Light | No (matches host page) |

### Variable Structure

Define all colors as CSS custom properties in `globals.css`. The `@theme` block already defines the light palette. Dark mode overrides are applied via `[data-theme="dark"]` selectors:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #0f172a;
  --color-border: #e2e8f0;
}

[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-text: #f5f5f5;
  --color-border: #262626;
}
```

### Toggle Placement

- Primary toggle in the dashboard sidebar header
- Secondary toggle on the homepage nav bar (when signed in)
- Icon: sun/moon SVG, no text label
- Persisted in `localStorage` with key `chaste-theme`

### System Preference Detection

On first visit (no stored preference), check `prefers-color-scheme: dark`. If the user has no preference, default to light.

```typescript
const stored = localStorage.getItem("chaste-theme")
if (stored) {
  setTheme(stored)
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  setTheme(prefersDark ? "dark" : "light")
}
```

## Consequences

### Positive

- Low-effort implementation: CSS variables + `< 50 lines` of client JS
- No additional dependencies (no `next-themes`, no UI library)
- Dark theme already tested via wizard layout
- Works with any provider (no framework lock-in)

### Negative

- Dashboard sidebar and content must be audited for hardcoded color values (`text-[#0f172a]`, `bg-white`, etc.)
- Third-party components (Drizzle Studio iframe, etc.) won't inherit the theme
- Themed images (logos, diagrams) need separate light/dark assets or SVG that responds to `currentColor`

### Neutral

- No Tailwind v4 dark mode class (`dark:` variants) — we use `data-theme` attribute + CSS variables instead, which is the recommended approach for Tailwind v4
- Future: could expose theme preference to the database for server-rendered dashboards

## Alternatives Considered

- **`next-themes` library**: Rejected — unnecessary dependency for what is essentially a CSS toggle. Next.js App Router handles the `className` on `<html>` fine without it.
- **Database-persisted preference**: Deferred — adds complexity (migration, API call, loading state). localStorage is appropriate for a UI-only preference.
- **System-only (no manual toggle)**: Rejected — users need explicit control.
