# ChasteAI — Design System & UI/UX Specification

> **Version:** 1.0
> **Status:** Approved for implementation
> **Design Tokens:** See `docs/design-tokens.md` _(Planned — created during Phase 1)_

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Direction](#2-visual-direction)
3. [Global Design System](#3-global-design-system)
   - 3.1 [Typography](#31-typography)
   - 3.2 [Color System](#32-color-system)
   - 3.3 [Spacing & Sizing](#33-spacing--sizing)
   - 3.4 [Surface & Elevation Hierarchy](#34-surface--elevation-hierarchy)
   - 3.5 [Border Radius](#35-border-radius)
   - 3.6 [Shadows](#36-shadows)
   - 3.7 [Motion Principles](#37-motion-principles)
   - 3.8 [Responsive Breakpoints](#38-responsive-breakpoints)
   - 3.9 [Z-Index Scale](#39-z-index-scale)
   - 3.10 [Iconography](#310-iconography)
   - 3.11 [Focus & Keyboard Navigation](#311-focus--keyboard-navigation)
   - 3.12 [Scroll Behavior](#312-scroll-behavior)
   - 3.13 [Data Formatting Standards](#313-data-formatting-standards)
4. [Component Library](#4-component-library)
   - 4.1 [Buttons](#41-buttons)
   - 4.2 [Inputs & Forms](#42-inputs--forms)
   - 4.3 [Select / Dropdowns](#43-select--dropdowns)
   - 4.4 [Tabs](#44-tabs)
   - 4.5 [Tables](#45-tables)
   - 4.6 [Badges & Tags](#46-badges--tags)
   - 4.7 [Cards & Panels](#47-cards--panels)
   - 4.8 [Modals & Dialogs](#48-modals--dialogs)
   - 4.9 [Toasts & Notifications](#49-toasts--notifications)
   - 4.10 [Empty States](#410-empty-states)
   - 4.11 [Loading / Skeleton States](#411-loading--skeleton-states)
   - 4.12 [Error & Success States](#412-error--success-states)
   - 4.13 [Tooltips](#413-tooltips)
   - 4.14 [Progress Indicators](#414-progress-indicators)
   - 4.15 [Avatars](#415-avatars)
   - 4.16 [Breadcrumbs](#416-breadcrumbs)
5. [Layout System](#5-layout-system)
   - 5.1 [Page Shell](#51-page-shell)
   - 5.2 [Sidebar](#52-sidebar)
   - 5.3 [Top Bar](#53-top-bar)
   - 5.4 [Content Area](#54-content-area)
   - 5.5 [Split Panels](#55-split-panels)
6. [Screen Specifications](#6-screen-specifications)
   - 6.1 [Entry Experience (/)](#61-entry-experience-)
   - 6.2 [Authentication](#62-authentication)
   - 6.3 [Setup Wizard (/setup)](#63-setup-wizard-setup)
   - 6.4 [Dashboard Shell](#64-dashboard-shell)
   - 6.5 [Dashboard Overview (/dashboard)](#65-dashboard-overview-dashboard)
   - 6.6 [Analytics (/dashboard/analytics)](#66-analytics-dashboardanalytics)
   - 6.7 [Agent Management](#67-agent-management)
   - 6.8 [Conversations & Chat](#68-conversations--chat)
   - 6.9 [Channels](#69-channels)
   - 6.10 [API Keys](#610-api-keys)
   - 6.11 [Documents](#611-documents)
   - 6.12 [Embedded Widget](#612-embedded-widget)
   - 6.13 [Team Management](#613-team-management)
   - 6.14 [Settings](#614-settings)
7. [Theme Implementation Strategy](#7-theme-implementation-strategy)
8. [Migration Plan](#8-migration-plan)

---

## 1. Design Philosophy

ChasteAI is not a generic SaaS website. It is a developer-first, self-hostable, enterprise AI platform. Every pixel should communicate that this is serious infrastructure software — not a marketing site.

### Core Identity

- **Developer-first, not marketer-first.** The UI speaks to engineers, ops teams, and technical decision-makers who value clarity and capability over flashy copy.
- **Self-host is the default.** The experience begins with someone running `pnpm setup` in a terminal. The UI is the reward for that effort — it should feel earned and professional.
- **Operational, not promotional.** Every surface prioritizes utility, visibility, and direct action. No hero sections, no testimonials, no pricing tiers.
- **App-native, not web-template.** On desktop, it should feel like an installed application (GitHub Desktop, Linear, Superhuman). On mobile, it should feel like a premium native chat and operations app.

### Emotional Qualities

| Quality       | Definition                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| **Direct**    | No fluff. The UI tells you what the system is doing and what you can do next.                           |
| **Confident** | Strong typography, deliberate whitespace, predictable interactions.                                     |
| **Calm**      | Low visual noise. Neutral foundations with restrained accent use. Motion is functional, not decorative. |
| **Capable**   | Dense information density when needed, but always scannable and well-structured.                        |
| **Premium**   | Fit-and-finish matters. Every border radius, shadow, transition, and alignment is intentional.          |

### What We Are Not

- Not a generic startup SaaS landing page
- Not a template-driven dashboard
- Not a "hero section + CTA + testimonials" marketing site
- Not trying to look like every other AI chatbot platform

### Design Inspirations

- **Linear** — project management with surgical precision, excellent density, confident color
- **Raycast** — extensions and command palette with native-feeling speed, blurred surfaces, dark glass
- **Vercel** — typographic clarity, restrained palette, developer empathy
- **Tailscale** — admin console that feels like a native app, beautiful empty states
- **Supabase Studio** — dense operational dashboard that remains navigable
- **Notion** — content-first layouts, sidebar navigation, typographic richness
- **GitHub Desktop** — installed-application feel, clear git operations UI
- **Arc browser** — sidebar-first, visual identity, command bar, spatial navigation

---

## 2. Visual Direction

### 2.1 Core Atmosphere

- **Dark mode is the primary mode.** Light mode is a secondary, well-executed alternative.
- **Neutral base with indigo accent.** The interface is built on a warm-cool neutral scale (slate/neutral blend) with indigo (#6366f1) as the single accent color for interactive elements, active states, and brand moments.
- **Subtle depth.** Surfaces are differentiated by luminance, not heavy borders or shadows. The elevation hierarchy is soft and layered.
- **Glass and blur** for overlays, modals, and command palettes (on supporting browsers).

### 2.2 Dark Mode Palette Direction

- Background: near-black with subtle warmth (#0A0A0B → #18181B)
- Surfaces: layered grays (#1E1E22 → #27272A → #2D2D32)
- Text: high-contrast white (#FAFAFA → #E4E4E7 → #A1A1AA)
- Borders: subtle (#2D2D32 → #3F3F46)
- Accent: Indigo (#818CF8 for interactive, #6366F1 for solid, #312E81 for subtle surfaces)

### 2.3 Light Mode Palette Direction

- Background: clean white (#FFFFFF) with warm-gray surfaces (#FAFAFA → #F4F4F5)
- Text: near-black (#18181B → #3F3F46 → #71717A)
- Borders: subtle warm-gray (#E4E4E7 → #D4D4D8)
- Accent: Same indigo (#6366F1 for solid, #4F46E5 for hover, #EEF2FF for subtle)

---

## 3. Global Design System

### 3.1 Typography

#### Font Stack

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code", monospace;
```

- **Inter** for all UI text (headings, body, labels, buttons)
- **JetBrains Mono** for code blocks, API keys, terminal output, identifiers

#### Type Scale

| Token       | Size | Line Height  | Weight      | Usage                                      |
| ----------- | ---- | ------------ | ----------- | ------------------------------------------ |
| `text-xs`   | 12px | 16px (1.333) | 400/500     | Captions, labels, metadata                 |
| `text-sm`   | 13px | 20px (1.538) | 400/500/600 | Body text, descriptions, secondary content |
| `text-base` | 14px | 20px (1.428) | 400/500/600 | Default UI text, table cells, input values |
| `text-md`   | 15px | 22px (1.466) | 500/600     | Emphasized UI text, navigation items       |
| `text-lg`   | 16px | 24px (1.5)   | 500/600     | Card titles, section headers               |
| `text-xl`   | 18px | 26px (1.444) | 600         | Modal titles, page sub-headers             |
| `text-2xl`  | 20px | 28px (1.4)   | 600         | Page titles (H1-equivalent)                |
| `text-3xl`  | 24px | 32px (1.333) | 600/700     | Hero/featured headings                     |
| `text-4xl`  | 30px | 38px (1.266) | 700         | Display headings (sparingly)               |
| `text-5xl`  | 36px | 44px (1.222) | 700         | Welcome screen heading                     |
| `text-6xl`  | 48px | 56px (1.166) | 700/800     | Full-screen welcome (desktop only)         |

#### Font Weights

| CSS Weight | Token     | Usage                                   |
| ---------- | --------- | --------------------------------------- |
| 400        | Regular   | Body text, descriptions                 |
| 500        | Medium    | Buttons, navigation, table headers      |
| 600        | Semibold  | Card titles, page titles, sidebar items |
| 700        | Bold      | Display headings                        |
| 800        | Extrabold | Large welcome text (sparingly)          |

#### Typography Rules

- **Letter spacing:** Tight for headings (`-0.02em` to `-0.04em`), normal for body text
- **Line length:** Content text capped at ~650px for readability
- **Monospace:** Used for code, API keys, IDs, JSON, terminal output, timestamps
- **No font smoothing overrides** — respect OS-level rendering (subpixel on macOS, grayscale on Windows)

### 3.2 Color System

#### Dark Mode (Primary)

```css
/* Surfaces */
--color-bg: #0a0a0b;
--color-surface: #18181b;
--color-surface-elevated: #1e1e22;
--color-surface-high: #27272a;
--color-surface-hover: #2d2d32;
--color-surface-active: #3f3f46;

/* Text */
--color-text-primary: #fafafa;
--color-text-secondary: #d4d4d8;
--color-text-tertiary: #a1a1aa;
--color-text-muted: #71717a;
--color-text-inverse: #0a0a0b;

/* Borders */
--color-border: #2d2d32;
--color-border-hover: #3f3f46;
--color-border-active: #52525b;

/* Accent (Indigo) */
--color-accent: #818cf8;
--color-accent-strong: #6366f1;
--color-accent-subtle: #1e1b4b;
--color-accent-border: #312e81;
--color-accent-text: #a5b4fc;

/* Semantic */
--color-success: #22c55e;
--color-success-subtle: #052e16;
--color-success-border: #166534;
--color-success-text: #86efac;

--color-warning: #f59e0b;
--color-warning-subtle: #451a03;
--color-warning-border: #92400e;
--color-warning-text: #fcd34d;

--color-danger: #ef4444;
--color-danger-subtle: #450a0a;
--color-danger-border: #991b1b;
--color-danger-text: #fca5a5;

--color-info: #3b82f6;
--color-info-subtle: #0c1929;
--color-info-border: #1d4ed8;
--color-info-text: #93c5fd;
```

#### Light Mode (Secondary)

```css
--color-bg: #ffffff;
--color-surface: #fafafa;
--color-surface-elevated: #f4f4f5;
--color-surface-high: #e4e4e7;
--color-surface-hover: #d4d4d8;
--color-surface-active: #a1a1aa;

--color-text-primary: #18181b;
--color-text-secondary: #3f3f46;
--color-text-tertiary: #71717a;
--color-text-muted: #a1a1aa;
--color-text-inverse: #ffffff;

--color-border: #e4e4e7;
--color-border-hover: #d4d4d8;
--color-border-active: #a1a1aa;

--color-accent: #6366f1;
--color-accent-strong: #4f46e5;
--color-accent-subtle: #eef2ff;
--color-accent-border: #c7d2fe;
--color-accent-text: #4338ca;

--color-success: #16a34a;
--color-success-subtle: #f0fdf4;
--color-success-border: #bbf7d0;
--color-success-text: #15803d;

--color-warning: #d97706;
--color-warning-subtle: #fffbeb;
--color-warning-border: #fde68a;
--color-warning-text: #92400e;

--color-danger: #dc2626;
--color-danger-subtle: #fef2f2;
--color-danger-border: #fecaca;
--color-danger-text: #991b1b;

--color-info: #2563eb;
--color-info-subtle: #eff6ff;
--color-info-border: #bfdbfe;
--color-info-text: #1e40af;
```

#### Contrast Compliance

All text/background combinations must meet WCAG AA minimums:

- **Body text (≤ 18px):** 4.5:1 contrast ratio minimum
- **Large text (≥ 18px bold or ≥ 24px):** 3:1 contrast ratio minimum
- **Decorative/disabled text:** Exempt, but aim for 3:1 where practical

**Known risk:** `--color-text-muted` (#71717A) on `--color-surface` (#18181B) yields ~3.9:1, which **fails AA**. Use `--color-text-muted` only on `--color-bg` (#0A0A0B) where it passes, or lighten muted to #8A8A94 (~4.8:1 on surface) for surface contexts.

### 3.3 Spacing & Sizing

#### Spacing Scale

Uses a 4px base unit with rational increments.

| Token       | Value | Common Usage                     |
| ----------- | ----- | -------------------------------- |
| `space-0.5` | 2px   | Inner icon spacing               |
| `space-1`   | 4px   | Tight element gaps               |
| `space-1.5` | 6px   | Button icon padding              |
| `space-2`   | 8px   | Input padding, element gaps      |
| `space-2.5` | 10px  | Card padding (compact)           |
| `space-3`   | 12px  | Card padding (default)           |
| `space-3.5` | 14px  | Section spacing (compact)        |
| `space-4`   | 16px  | Section spacing, form field gaps |
| `space-5`   | 20px  | Card internal padding            |
| `space-6`   | 24px  | Page padding, panel gaps         |
| `space-8`   | 32px  | Section separation               |
| `space-10`  | 40px  | Page section margins             |
| `space-12`  | 48px  | Layout gaps                      |
| `space-16`  | 64px  | Large section separation         |
| `space-20`  | 80px  | Page-level margins               |
| `space-24`  | 96px  | Full-screen page padding         |

#### Sizing (for interactive elements)

| Element              | Height | Min Width | Padding X |
| -------------------- | ------ | --------- | --------- |
| Small input/button   | 32px   | —         | 10px      |
| Default input/button | 36px   | —         | 12px      |
| Large input/button   | 44px   | —         | 16px      |
| Sidebar item         | 32px   | —         | 8px       |
| Badge / Tag          | 20px   | —         | 6px       |
| Small badge          | 18px   | —         | 4px       |

### 3.4 Surface & Elevation Hierarchy

#### Surface Levels

| Level        | Dark BG               | Light BG                 | Usage                                   |
| ------------ | --------------------- | ------------------------ | --------------------------------------- |
| 0 - Base     | `#0A0A0B`             | `#FFFFFF`                | Page background                         |
| 1 - Surface  | `#18181B`             | `#FAFAFA`                | Cards, panels, default sections         |
| 2 - Elevated | `#1E1E22`             | `#F4F4F5`                | Hovered cards, dropdown menus, sidebars |
| 3 - High     | `#27272A`             | `#E4E4E7`                | Active states, modal content, tooltips  |
| 4 - Overlay  | `rgba(0,0,0,0.8)`     | `rgba(0,0,0,0.5)`        | Modal backdrops, drawer overlays        |
| 5 - Glass    | `rgba(24,24,27,0.85)` | `rgba(255,255,255,0.85)` | Command palette, floating panels        |

#### Elevation Principles

- Surfaces are differentiated primarily by **luminance** (dark/light), not shadows
- Shadows are used sparingly and only for floating elements (modals, dropdowns, tooltips)
- Active surfaces are slightly lighter than their container
- Hover states are subtle — never more than one level shift
- Use `backdrop-filter: blur()` for glass surfaces on overlays/command palettes

### 3.5 Border Radius

| Token         | Value  | Usage                                     |
| ------------- | ------ | ----------------------------------------- |
| `radius-none` | 0px    | Full-bleed elements, avatars (with image) |
| `radius-xs`   | 2px    | Small badges, code inline markers         |
| `radius-sm`   | 4px    | Small buttons, status dots                |
| `radius-md`   | 6px    | Default buttons, inputs, cards            |
| `radius-lg`   | 8px    | Modals, larger cards, panels              |
| `radius-xl`   | 12px   | Full-page cards, setup wizard steps       |
| `radius-2xl`  | 16px   | Modals with image headers                 |
| `radius-full` | 9999px | Avatars, pills, status indicators         |

### 3.6 Shadows

#### Dark Mode

```css
--shadow-xs: 0 0 0 1px rgba(255, 255, 255, 0.05);
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.04);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06);
--shadow-2xl: 0 40px 50px -12px rgba(0, 0, 0, 0.7);
```

#### Light Mode

```css
--shadow-xs: 0 0 0 1px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.06);
--shadow-2xl: 0 40px 50px -12px rgba(0, 0, 0, 0.15);
```

### 3.7 Motion Principles

#### Duration Tokens

| Token              | Value | Usage                              |
| ------------------ | ----- | ---------------------------------- |
| `duration-instant` | 50ms  | Micro-interactions (button press)  |
| `duration-fast`    | 100ms | Hover states, simple transitions   |
| `duration-normal`  | 150ms | Standard state changes             |
| `duration-slow`    | 250ms | Panel entrances, modal opens       |
| `duration-slide`   | 300ms | Page transitions, sidebar collapse |
| `duration-express` | 400ms | Setup wizard step transitions      |

#### Easing Tokens

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

#### Motion Rules

1. **Functional, not decorative.** Every animation serves a purpose — indicating state, guiding attention, or providing spatial continuity.
2. **Subtle by default.** Most transitions are 150ms or less. Only layout-changing animations (panel slides, page transitions) use longer durations.
3. **Reduce motion respected.** `@media (prefers-reduced-motion: reduce)` disables all non-essential animations.
4. **Spring easing** reserved for celebratory moments, feedback confirms, and toasts.
5. **No parallax, no 3D transforms, no particle effects** — this is operational software.
6. **Opacity + transform** for most animations (never animating `width`, `height`, `top`, `left` directly).

#### Common Animation Patterns

- **Skeleton loading:** Gentle pulse at 1.5s cycle
- **Page enter:** Fade-in + subtle translateY(4px → 0) at 200ms
- **Modal open:** Fade backdrop + scale(0.96 → 1) content at 200ms
- **Dropdown open:** Fade + translateY(-2px → 0) at 100ms
- **Sidebar collapse:** Width transition at 250ms with content fade
- **Toast enter:** Slide in from right at 250ms with spring
- **Button loading:** Spinner rotation 600ms linear infinite
- **Status indicator pulse:** 2s gentle pulse for live/active indicators

### 3.8 Responsive Breakpoints

```css
--breakpoint-sm: 640px; /* Mobile landscape */
--breakpoint-md: 768px; /* Tablet */
--breakpoint-lg: 1024px; /* Desktop narrow */
--breakpoint-xl: 1280px; /* Desktop wide */
--breakpoint-2xl: 1536px; /* Desktop ultra-wide */
```

#### Layout Shifts by Breakpoint

| Breakpoint           | Sidebar         | Content             | Behavior                        |
| -------------------- | --------------- | ------------------- | ------------------------------- |
| < 640px (mobile)     | Hidden (drawer) | Full width          | Bottom nav, stacked layouts     |
| 640-1023px (tablet)  | Collapsed       | Full width          | Top nav, compact cards          |
| 1024+px (desktop)    | Expanded        | Remaining width     | Sidebar + content, multi-panel  |
| 1536+px (ultra-wide) | Expanded        | Max 1440px centered | Sidebar + centered content grid |

### 3.9 Z-Index Scale

| Token               | Value | Usage                   |
| ------------------- | ----- | ----------------------- |
| `z-base`            | 0     | Page content            |
| `z-sticky`          | 10    | Sticky headers, sidebar |
| `z-overlay`         | 40    | Dropdowns, popovers     |
| `z-drawer`          | 50    | Mobile side drawer      |
| `z-modal-backdrop`  | 60    | Modal backdrops         |
| `z-modal`           | 70    | Modal dialogs           |
| `z-toast`           | 80    | Toast notifications     |
| `z-command-palette` | 90    | Command palette         |
| `z-tooltip`         | 100   | Tooltips                |

### 3.10 Iconography

#### Icon Library

Use **Lucide** (`lucide-react`) — open-source, consistent stroke weight, tree-shakeable, actively maintained, and visually aligned with Inter typography.

#### Size Scale

| Token      | Size | Usage                                           |
| ---------- | ---- | ----------------------------------------------- |
| `icon-xs`  | 14px | Inline with small text, badge icons             |
| `icon-sm`  | 16px | Buttons (sm), table actions, input adornments   |
| `icon-md`  | 18px | Navigation items, default buttons, card headers |
| `icon-lg`  | 20px | Section headers, large buttons                  |
| `icon-xl`  | 24px | Empty state illustrations, top bar actions      |
| `icon-2xl` | 32px | Feature callouts, onboarding                    |
| `icon-3xl` | 48px | Empty state hero icons, full-page errors        |

#### Rules

- **Stroke width:** 1.5px consistently (Lucide default). Never mix stroke widths.
- **Color:** Inherit from parent text color (`currentColor`) unless semantically colored (success/danger).
- **Optical alignment in buttons:** Icons may need 1px vertical offset for visual centering — use flexbox `align-items: center` with the icon element.
- **Icon-only buttons:** Must include `aria-label` for accessibility.
- **No filled icons** — stroke-only for consistency. Exception: status dots (which are filled circles, not icons).

### 3.11 Focus & Keyboard Navigation

#### Focus Ring Specification

```css
/* Visible only on keyboard navigation, not mouse clicks */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: inherit;
}

:focus:not(:focus-visible) {
  outline: none;
}
```

#### Focus Management Rules

1. **Focus-visible only.** Mouse users should never see focus rings. Use `:focus-visible` exclusively.
2. **Tab order follows visual order.** No `tabindex` values > 0. Use DOM order to control tab sequence.
3. **Focus trapping.** Modals, drawers, and command palette trap focus within. Tab wraps from last to first element.
4. **Focus restoration.** When a modal closes, focus returns to the element that triggered it.
5. **Skip-to-content link.** Hidden `<a>` at top of page, visible on focus, jumps past sidebar/nav to content area.
6. **Roving tabindex.** Composite widgets (tabs, menus, toolbars) use arrow keys for internal navigation, Tab moves to/from the widget as a whole.

#### Keyboard Shortcuts

| Shortcut        | Action                                 |
| --------------- | -------------------------------------- |
| `⌘K` / `Ctrl+K` | Open command palette / global search   |
| `⌘1`–`⌘8`       | Navigate to sidebar items              |
| `Esc`           | Close modal / drawer / command palette |
| `Enter`         | Confirm action / submit form           |
| `⌘Enter`        | Submit form (in textarea contexts)     |
| `⌘⇧N`           | New conversation                       |
| `⌘N`            | New agent                              |

### 3.12 Scroll Behavior

#### Custom Scrollbar Styling (WebKit)

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}
```

#### Scroll Conventions

- **Scroll shadows:** Gradient fade (8px) at top/bottom of scroll containers to indicate more content. Uses `mask-image` for clean implementation.
- **Sticky headers:** Table headers and section headers stick within their scroll container. Use `position: sticky; top: 0;` with `z-index: var(--z-sticky)`.
- **Pagination vs infinite scroll:**
  - Conversations list → infinite scroll (append on scroll)
  - Tables (API keys, documents) → pagination (page controls at bottom)
  - Activity feed → infinite scroll with "load more" trigger
- **Scroll restoration:** Preserve scroll position on back navigation within the dashboard.

### 3.13 Data Formatting Standards

| Data Type                | Format                                                      | Example                      |
| ------------------------ | ----------------------------------------------------------- | ---------------------------- |
| **Relative time**        | "Xm ago", "Xh ago", "Xd ago"                                | "2m ago", "3h ago", "1d ago" |
| **Absolute time**        | "MMM D" (same year), "MMM D, YYYY" (other year)             | "Jan 15", "Jan 15, 2024"     |
| **Time threshold**       | Relative within 24h, absolute beyond                        | —                            |
| **Large numbers**        | Locale-formatted with compact notation for 1000+            | "1,234" or "1.2k", "3.4M"    |
| **Percentages**          | Always with `%` sign                                        | "94%", "+12%", "-3%"         |
| **Percentage deltas**    | Green for positive, red for negative, with ▲/▼ arrow        | "▲ 12%", "▼ 3%"              |
| **Empty values**         | Em-dash (—)                                                 | —                            |
| **Truncation**           | Ellipsis (`...`) with full value in tooltip                 | "chaste_a1b2..."             |
| **Truncation max-width** | Per context: table cells 200px, sidebar 160px, badges 120px | —                            |
| **Boolean states**       | Dot indicator + label, never "true"/"false"                 | "● Active", "○ Inactive"     |
| **File sizes**           | Binary units, 1 decimal                                     | "124 KB", "2.1 MB"           |

---

## 4. Component Library

### 4.1 Buttons

#### Variants

| Variant       | BG (Dark)         | BG (Light)        | Hover                   | Text Color               | Usage                          |
| ------------- | ----------------- | ----------------- | ----------------------- | ------------------------ | ------------------------------ |
| **Primary**   | `--color-accent`  | `--color-accent`  | Lighter shade           | White                    | Primary actions, next/continue |
| **Secondary** | `--color-surface` | `--color-surface` | `--color-surface-hover` | `--color-text-primary`   | Default actions                |
| **Subtle**    | Transparent       | Transparent       | `--color-surface`       | `--color-text-secondary` | Tertiary/ghost actions         |
| **Danger**    | `--color-danger`  | `--color-danger`  | Lighter shade           | White                    | Destructive actions            |
| **Outline**   | Transparent       | Transparent       | `--color-surface`       | `--color-accent`         | Border with accent text        |
| **Link**      | Transparent       | Transparent       | Underline               | `--color-accent`         | Inline navigation              |

#### Sizes

| Size             | Height | Padding X | Font Size | Icon Size |
| ---------------- | ------ | --------- | --------- | --------- |
| **Xs**           | 28px   | 8px       | 12px      | 12px      |
| **Sm**           | 32px   | 10px      | 13px      | 14px      |
| **Md (default)** | 36px   | 12px      | 14px      | 16px      |
| **Lg**           | 44px   | 16px      | 15px      | 18px      |

#### States

- **Default:** Appropriate variant background
- **Hover:** Slightly lighter background, subtle lift (translateY(-1px))
- **Active/Pressed:** Scale down (scale(0.97)), deeper color
- **Disabled:** Opacity 40%, no interactions, no shadow
- **Loading:** Replace content with spinner, maintain width
- **Focused:** Focus ring using accent color (2px offset, 2px width)

#### Button with Icon

- Icons always placed consistently (left for leading, right for trailing)
- Icon button (no label) uses same sizing with equal width/height
- Icon + label buttons have 6px gap between icon and text

### 4.2 Inputs & Forms

#### Text Input

```css
/* Structure */
height: 36px;
padding: 0 12px;
border-radius: 6px;
font-size: 14px;
line-height: 20px;
```

| State    | Dark Mode                                                    | Light Mode                                   |
| -------- | ------------------------------------------------------------ | -------------------------------------------- |
| Default  | BG `--color-surface` Border `--color-border`                 | BG `--color-surface` Border `--color-border` |
| Hover    | Border `--color-border-hover`                                | Border `--color-border-hover`                |
| Focus    | Border `--color-accent` Ring `--color-accent` 2px@2px offset | Same                                         |
| Disabled | Opacity 50%, cursor not-allowed                              | Same                                         |
| Error    | Border `--color-danger` Ring `--color-danger`                | Same                                         |
| Success  | Border `--color-success`                                     | Same                                         |

#### Textarea

- Same visual styling as text inputs
- 3 rows default, resizable vertically only
- 8px padding (closer to card padding for multi-line)
- Character count shown at bottom-right when `maxLength` specified

#### Labels

- 13px, medium weight, `--color-text-secondary`
- 6px gap between label and input
- Optional: inline helper text at 12px, `--color-text-muted`

#### Validation Messages

- 12px, 4px below input
- Error: `--color-danger-text`
- Success: `--color-success-text`
- Hint: `--color-text-muted`

#### Input Groups

- Prefix/suffix elements flush with input (e.g., `$`, `.com`, copy button)
- Separated by a subtle 1px border or background contrast
- Used for URL inputs, API key fields, search fields

#### Checkboxes & Radios

- Custom styled, 16x16px
- Checked state uses accent color with white checkmark/dot
- Radio: filled circle with inner dot
- Label is 14px, clickable, 8px gap from control

#### Toggle/Switch

- 36px wide, 20px tall
- Track: `--color-surface-hover` (off) → `--color-accent` (on)
- Thumb: 16px white circle with subtle shadow
- Transition: 150ms, ease-in-out

### 4.3 Select / Dropdowns

#### Native Select

- Same visual styling as text inputs
- Chevron icon positioned absolute right
- Min-width 160px for content

#### Custom Dropdown Menu

```css
/* Container */
padding: 4px;
border-radius: 8px;
background: var(--color-surface-elevated);
border: 1px solid var(--color-border);
box-shadow: var(--shadow-lg);
```

- Menu items: 32px height, 8px horizontal padding, 6px border-radius
- Hover: `--color-surface-hover` background
- Active/selected: `--color-accent-subtle` background with `--color-accent-text` text
- Dividers: 1px `--color-border`, 4px vertical margin
- Keyboard navigation: automatic, visible focus ring

#### Combobox / Autocomplete

- Input with dropdown attached
- Filter-as-you-type behavior
- Empty state: "No results found" centered
- Loading state: spinner in dropdown

### 4.4 Tabs

#### Variant 1: Underline Tabs

- 32px height items
- 12px horizontal padding, 4px gap between items
- Active: `--color-accent` bottom border (2px), `--color-text-primary`
- Inactive: `--color-text-tertiary`, hover → `--color-text-secondary`
- Bottom border on container: 1px `--color-border`

#### Variant 2: Segmented Control

- Container: 4px padding, `--color-surface`, 6px radius
- Items: flush to container, equal width
- Active: `--color-surface-high` with subtle shadow, rounded
- Used for: view toggles (grid/list), time range selectors

#### Variant 3: Pills

- Rounded-full tabs
- Active: `--color-accent-subtle` with `--color-accent-text`
- Inactive: transparent with `--color-text-tertiary`

### 4.5 Tables

#### Structure

```css
font-size: 14px;
border-collapse: separate;
border-spacing: 0;
```

| Element      | Dark Mode                                                       | Light Mode |
| ------------ | --------------------------------------------------------------- | ---------- |
| Header       | 13px, medium weight, `--color-text-muted`, uppercase (optional) | Same       |
| Row default  | `--color-text-primary`                                          | Same       |
| Row hover    | `--color-surface-hover` background                              | Same       |
| Row selected | `--color-accent-subtle` background                              | Same       |
| Cell padding | 10px 12px                                                       | Same       |
| Border       | Bottom 1px `--color-border`                                     | Same       |

#### Features

- Sortable headers: show chevron on active sort column
- Checkbox column: 40px wide, first column
- Actions column: right-aligned, hidden by default, show on row hover
- Striped rows: optional, subtle alternating `--color-surface` every other row
- Empty state: centered message in table area

### 4.6 Badges & Tags

#### Badge Variants

| Variant | Dark BG                  | Dark Text               | Light BG                 | Light Text               |
| ------- | ------------------------ | ----------------------- | ------------------------ | ------------------------ |
| Neutral | `--color-surface-high`   | `--color-text-tertiary` | `--color-surface-high`   | `--color-text-secondary` |
| Accent  | `--color-accent-subtle`  | `--color-accent-text`   | `--color-accent-subtle`  | `--color-accent-text`    |
| Success | `--color-success-subtle` | `--color-success-text`  | `--color-success-subtle` | `--color-success-text`   |
| Warning | `--color-warning-subtle` | `--color-warning-text`  | `--color-warning-subtle` | `--color-warning-text`   |
| Danger  | `--color-danger-subtle`  | `--color-danger-text`   | `--color-danger-subtle`  | `--color-danger-text`    |

#### Sizes

- Default: 20px height, 8px horizontal padding, 6px radius, 12px font
- Small: 18px height, 6px horizontal padding, 4px radius, 11px font
- With dot: 6px left padding (8px gap before text), circle indicator

#### Tags / Chips

- Same as badges but with optional remove (×) button
- Remove button: 14px, hover → danger color
- Used for: filter chips, multi-select values, API key scopes

### 4.7 Cards & Panels

#### Card

```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: 8px;
padding: 16px;
```

- Hover: subtle border or background shift for interactive cards
- Padding variants: compact (12px), default (16px), spacious (20px)
- Header section: bottom border optional, contains title + actions
- Footer section: top border optional, contains primary actions

#### Panel (Larger Surface)

- Used for: detail views, full-page sections
- No background (inherits page/section surface)
- Inner sections separated by 1px `--color-border`

#### Stat Card (KPI)

```
┌─────────────────┐
│ ┌──────┐ Label  │
│ │ Icon │ Value  │
│ └──────┘ Delta  │
│                 │
│ Sparkline       │
└─────────────────┘
```

- 200-240px wide, compact
- Value: 24-30px, bold, `--color-text-primary`
- Label: 13px, `--color-text-tertiary`
- Delta: 12px, green (up) or red (down) with arrow
- Optional: mini sparkline chart at bottom

### 4.8 Modals & Dialogs

#### Structure

```css
/* Backdrop */
position: fixed;
inset: 0;
background: rgba(0, 0, 0, 0.6);
backdrop-filter: blur(4px);
z-index: var(--z-modal-backdrop);
```

```css
/* Content */
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: 12px;
box-shadow: var(--shadow-2xl);
width: 480px; /* default */
max-height: 80vh;
overflow-y: auto;
z-index: var(--z-modal);
```

#### Sections

- **Header:** 16px padding, bottom border, title (16px semibold) + close button
- **Body:** 20px padding, scrollable
- **Footer:** 16px padding, top border, right-aligned actions (cancel + confirm)

#### Sizes

| Size         | Width | Usage                           |
| ------------ | ----- | ------------------------------- |
| Sm           | 400px | Quick confirm, short forms      |
| Md (default) | 480px | Standard forms, edit dialogs    |
| Lg           | 640px | Complex forms, API key creation |
| Xl           | 800px | Full settings panels (rare)     |
| Full         | 90vw  | Image preview, complex config   |

#### Animation

- Backdrop: fade in 200ms
- Content: scale(0.95 → 1) + fade 200ms, ease-out
- Close: reverse, 150ms

### 4.9 Toasts & Notifications

#### Toast Placement

- Desktop: bottom-right, stacked with 8px gap
- Mobile: top-center, below header

#### Toast Types

| Type    | Icon      | Border Left Color | Text                     |
| ------- | --------- | ----------------- | ------------------------ |
| Success | Checkmark | `--color-success` | `--color-success-text`   |
| Error   | X mark    | `--color-danger`  | `--color-danger-text`    |
| Warning | Triangle  | `--color-warning` | `--color-warning-text`   |
| Info    | Circle i  | `--color-info`    | `--color-info-text`      |
| Loading | Spinner   | `--color-accent`  | `--color-text-secondary` |

#### Structure

```css
height: auto;
min-width: 320px;
max-width: 420px;
padding: 12px 16px;
border-radius: 8px;
background: var(--color-surface-elevated);
border: 1px solid var(--color-border);
box-shadow: var(--shadow-lg);
```

- Icon: 16px, left side, 12px gap to text
- Title (optional): 14px semibold
- Description: 13px, `--color-text-tertiary`
- Dismiss button: top-right, subtle
- Auto-dismiss: success/info after 4s, warning/error manual dismiss
- **Stacking limit:** Max 5 visible toasts. Oldest is auto-dismissed when exceeding limit.
- **Grouping:** Repeated events consolidate into a single toast (e.g., "3 documents uploaded" instead of 3 separate toasts).

#### Notification Panel (Inbox)

- Slide-out drawer from right (400px wide)
- List of notification items with read/unread state
- Unread: `--color-accent` left border, `--color-accent-subtle` background
- Each item: icon + title + description + timestamp
- Mark all read action at top

### 4.10 Empty States

#### Structure

```css
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 48px 24px;
text-align: center;
```

- **Illustration/Icon:** 48-64px, `--color-text-muted` (use simple geometric icons, no illustrations)
- **Title:** 15px semibold, `--color-text-primary`
- **Description:** 13px, `--color-text-tertiary`, max 400px width
- **Action button:** Optional primary button to resolve empty state

#### Contextual Empty States

| Screen            | Title                  | Description                                                               | Action            |
| ----------------- | ---------------------- | ------------------------------------------------------------------------- | ----------------- |
| No agents         | No agents yet          | Create your first AI agent to start handling conversations.               | "Create Agent"    |
| No conversations  | No conversations       | Conversations will appear here once your agent starts receiving messages. | —                 |
| No channels       | No channels configured | Connect a channel to let your agent interact with users.                  | "Add Channel"     |
| No API keys       | No API keys            | Generate an API key to access the ChasteAI API.                           | "Generate Key"    |
| No documents      | No documents uploaded  | Upload documents to provide your agents with knowledge.                   | "Upload Document" |
| No analytics data | No data yet            | Analytics will populate once your agents handle conversations.            | —                 |

### 4.11 Loading / Skeleton States

#### Skeleton Component

```css
background: var(--color-surface);
border-radius: 6px;
animation: skeleton-pulse 1.5s ease-in-out infinite;
```

```css
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
```

#### Skeleton Patterns by Context

| Context         | Skeleton Layout                          |
| --------------- | ---------------------------------------- |
| Stat cards      | 3-4 rects in row (200x100px each)        |
| Table           | Header row rect + 5-8 body row rects     |
| Card grid       | 6 rect cards in 3-column grid            |
| Chat view       | Bubble rects alternating left/right      |
| Detail view     | Title rect + 2 body rects + sidebar rect |
| Analytics chart | Large rect (chart area) + legend row     |

#### Loading States

- **Page load:** Skeleton matching page layout (no spinner)
- **Action/submit:** Inline spinner in button, button maintains width
- **Refresh:** Subtle spinner in the refreshed section only
- **File upload:** Progress bar with percentage + filename
- **Streaming response:** Cursor blink animation (terminal-like) during AI response generation

### 4.12 Error & Success States

#### Inline Error

- Red border on the errored input
- 12px red text below the input field
- Optional: shake animation on the field (100ms left-right oscillation)

#### Alert Banner

```css
padding: 10px 12px;
border-radius: 6px;
font-size: 13px;
display: flex;
align-items: flex-start;
gap: 8px;
```

| Type    | BG                       | Border                   | Text                   | Icon      |
| ------- | ------------------------ | ------------------------ | ---------------------- | --------- |
| Error   | `--color-danger-subtle`  | `--color-danger-border`  | `--color-danger-text`  | Circle X  |
| Warning | `--color-warning-subtle` | `--color-warning-border` | `--color-warning-text` | Triangle  |
| Success | `--color-success-subtle` | `--color-success-border` | `--color-success-text` | Checkmark |
| Info    | `--color-info-subtle`    | `--color-info-border`    | `--color-info-text`    | Circle i  |

#### Full-Page Error

```css
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 100%;
text-align: center;
gap: 16px;
```

- Large status code (500, 404): 48px, bold, `--color-text-muted`
- Title: 18px semibold
- Description: 14px, `--color-text-tertiary`
- "Try again" or "Go home" button

#### Success Confirmation

- Green checkmark in circle (48px)
- Brief message
- Optional: confetti-like spring animation (very subtle, just a scale bounce)

### 4.13 Tooltips

- 4px above/below the target element
- Background: `--color-surface-high`
- Text: `--color-text-primary`, 12px
- Padding: 4px 8px
- Border-radius: 4px
- Max-width: 200px
- Show: 300ms delay (immediate for active focus)
- Hide: 150ms
- Arrow: 4px CSS triangle pointing toward target

### 4.14 Progress Indicators

#### Linear Progress

```css
height: 2px;
background: var(--color-border);
border-radius: 1px;
overflow: hidden;

/* Fill */
background: var(--color-accent);
```

- Indeterminate: animated gradient sweep (1.5s)
- Determinate: width transition (300ms ease-out)

#### Circular Progress

- 16-24px for inline loading
- Stroke: `--color-accent`, 2-3px width
- Track: `--color-border`
- Determinate: stroke-dasharray animation
- Indeterminate: spin 600ms linear infinite

#### Step Progress (Wizard)

- Horizontal stepper with numbered circles
- Completed: filled accent with checkmark
- Active: filled accent with number
- Pending: outlined, `--color-border`
- Connected by subtle line between steps
- Circle size: 24px, text 12px semibold

### 4.15 Avatars

#### Sizes

| Size             | Diameter | Font Size | Usage                           |
| ---------------- | -------- | --------- | ------------------------------- |
| `avatar-xs`      | 20px     | 9px       | Inline mentions, compact lists  |
| `avatar-sm`      | 24px     | 10px      | Top bar user, conversation list |
| `avatar-md`      | 28px     | 11px      | Sidebar user, chat headers      |
| `avatar-default` | 32px     | 12px      | Card headers, detail views      |
| `avatar-lg`      | 40px     | 14px      | Profile headers, agent cards    |
| `avatar-xl`      | 48px     | 16px      | User profile page, onboarding   |

#### Appearance

- **Image:** Rounded full (`border-radius: 9999px`), `object-fit: cover`
- **Fallback (no image):** Initials (first letter of first + last name), `--color-accent-subtle` background, `--color-accent-text` text, medium weight
- **Status dot:** 8px circle, positioned bottom-right, 2px white ring offset
  - Online: `--color-success`
  - Away: `--color-warning`
  - Offline: `--color-border`
- **Group/stack:** Overlapping with -4px margin, ascending z-index, `+N` overflow badge at end

### 4.16 Breadcrumbs

#### Structure

```css
font-size: 13px;
display: flex;
align-items: center;
gap: 6px;
```

- **Separator:** Chevron icon (12px, `--color-text-muted`) or `/` character
- **Items:** `--color-text-tertiary`, hover → `--color-text-secondary`, cursor pointer
- **Current (last item):** `--color-text-primary`, no hover effect, not a link
- **Truncation:** On narrow viewports, middle items collapse to `...` — click reveals full breadcrumb in a dropdown
- **Used in:** Top bar for nested views (e.g., Agents → Support Bot → Settings)

---

## 5. Layout System

### 5.1 Page Shell

```
┌──────────────────────────────────────┐
│ [Skip to content] (hidden, a11y)      │
├──────────┬───────────────────────────┤
│          │                           │
│ Sidebar  │  Top Bar                  │
│ (260px)  ├───────────────────────────┤
│          │                           │
│          │  Content Area             │
│          │  (scrollable, fills       │
│          │   remaining space)        │
│          │                           │
│          │                           │
└──────────┴───────────────────────────┘
```

#### Desktop (≥1024px)

- Sidebar: 260px fixed width, collapsible to 60px (icon-only)
- Top bar: 52px height, spans content area
- Content: fills remaining width, scrollable independently

#### Tablet (640-1023px)

- Sidebar: collapsed to 60px icon-only
- Or optional top navigation bar replacing sidebar
- Content: full width below nav

#### Mobile (<640px)

- Sidebar: hidden, accessible via hamburger drawer
- Bottom tab bar for primary navigation
- Content: full width

#### Mobile Bottom Tab Bar

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Overview │  Agents  │  Chat    │ Channels │   More   │
│   ◉      │   ◎      │   ◎      │   ◎      │   ◎      │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

- **Height:** 56px + safe area inset (for iOS home indicator)
- **5 tabs max:** Overview, Agents, Conversations, Channels, More
- **"More" tab:** Opens a bottom sheet listing remaining items (Analytics, API Keys, Documents, Settings)
- **Active state:** Filled icon + label (11px), `--color-accent`
- **Inactive state:** Outline icon only (no label), `--color-text-muted`
- **Background:** `--color-surface` with 1px top border
- **Safe area:** `padding-bottom: env(safe-area-inset-bottom)` for notched devices

### 5.2 Sidebar

#### Desktop (Expanded)

- Width: 260px
- Background: `--color-surface` (level 1), 1px right border
- Contains:
  - **Header:** Logo + product name + collapse toggle (44px)
  - **Workspace switcher:** Dropdown at top of navigation (36px)
  - **Navigation items:** 32px each, vertical stack with 2px gap
  - **Section labels:** 11px uppercase, 8px above section, `--color-text-muted`
  - **Separator:** 1px `--color-border`, 8px vertical margin
  - **Settings item:** Always visible at bottom of nav stack (gear icon, "Settings")
  - **Bottom section:** User area (see below)

#### User Section (Sidebar Bottom)

- Avatar (24px) + name (14px, truncated) + email (12px, `--color-text-muted`, truncated)
- Hover: `--color-surface-hover` background, full row clickable
- Click: opens user menu popover upward containing:
  - Theme toggle (Dark / Light / System)
  - Sign Out (danger text)
- Online status dot on avatar (see §4.15 Avatars)

#### Navigation Items

```
┌──────────────────────────────────────┐
│  ⟐  Overview                   ⌘1   │
│  ⟐  Analytics                  ⌘2   │
│  ⟐  Agents                     ⌘3   │
│  ⟐  Conversations              ⌘4   │
│  ⟐  Channels                   ⌘5   │
│  ⟐  API Keys                   ⌘6   │
│  ⟐  Documents                  ⌘7   │
│  ⟐  Team                       ⌘8   │
│  ⟐  Workspaces                 ⌘9   │
├──────────────────────────────────────┤
│  ⚙  Settings                        │
└──────────────────────────────────────┘
```

- Icon (18x18) + label (14px) + optional keyboard shortcut badge
- Active: `--color-accent-subtle` background, `--color-accent` text, 2px left accent border
- Hover: `--color-surface-hover` background
- Unread badge: 18px pill, right-aligned, `--color-accent-strong` background

#### Notification Badges

- **Position:** top-right of parent element, offset -4px/-4px
- **Dot (no count):** 8px circle, `--color-danger` for critical alerts, `--color-accent-strong` for informational
- **Count badge:** 18px pill, min-width 18px, padding 0 4px, 10px font, white text
- **Count display:** 1–9 shown as-is, `9+` for overflow
- **Animation:** Subtle scale-in (spring easing) on first appearance

#### Collapsed State

- Width: 60px
- Icons only (centered), tooltip on hover
- Active: left accent bar (2px)

#### Workspace Switcher

- Dropdown button in sidebar header
- Shows current workspace name + chevron
- Dropdown lists all workspaces with checkmark on current
- "Create workspace" action at bottom

### 5.3 Top Bar

- Height: 52px
- Background: page background (level 0), bottom border
- Contains:
  - **Left:** Current page title or breadcrumbs
  - **Right:** Global search trigger, notifications (bell with badge), user avatar (24px)

#### Global Search

- Trigger: ⌘K or "Search..." button in top bar (36px, 200px wide, subtle border)
- Opens command palette overlay:

```
┌──────────────────────────────────────┐
│ 🔍 Search pages, agents, config...   │
├──────────────────────────────────────┤
│ Recent searches...                    │
│  → Agent: Support Agent              │
│  → Page: Conversation History        │
├──────────────────────────────────────┤
│ Quick actions                         │
│  ⌘N  New agent                       │
│  ⌘⇧N New conversation                │
│  ⌘,  Settings                        │
└──────────────────────────────────────┘
```

- Glass background (level 5)
- 560px wide, centered (or below trigger)
- Search input with keyboard shortcut hint
- Sections: Recent, Pages, Agents, Conversations, Quick Actions
- Animation: glass backdrop fade + content scale(0.98 → 1) at 150ms, ease-out

#### Command Palette Interaction

- **Keyboard:** `↑`/`↓` to navigate results, `Enter` to select, `Esc` to close, type-ahead filtering
- **Result item structure:** Icon (16px) + title (14px) + description/context (12px, muted) + optional shortcut badge (right-aligned)
- **Section headers:** 11px uppercase, `--color-text-muted`, not selectable
- **Highlighted match:** Bold matching characters in title
- **No results:** "No results for [query]" centered, 13px, `--color-text-muted`
- **Loading state:** Inline spinner below search input during async search
- **Max results:** 8 per section, "View all" link at section end

### 5.4 Content Area

- Padding: 32px horizontal, 24px vertical (desktop)
  - Reduced to 20px/16px on tablet
  - Reduced to 16px/16px on mobile
- Max content width: 1440px (on ultra-wide, centered)
- Page title + metadata at top, then content

### 5.5 Split Panels

Used in: Conversations, Agent Detail, Channel Detail

```
┌──────────────────┬────────────────────┐
│                  │                    │
│  List Panel      │  Detail Panel      │
│  (320-380px)     │  (remaining)       │
│  Scrollable      │  Scrollable        │
│  Resizable       │                    │
│                  │                    │
└──────────────────┴────────────────────┘
```

- Resizable divider: 4px hover zone, `--color-border` active, cursor col-resize
- On mobile: stack vertically, toggle between list and detail
- List panel: search/filter at top, scrollable list below
- Detail panel: header + scrollable content

---

## 6. Screen Specifications

### 6.1 Entry Experience (/)

#### Layout

This is a **welcome surface / launch screen**, not a marketing hero. The difference: a hero sells to prospects; a welcome screen orients operators who just installed the software. It should feel like an application's initial state — quiet, confident, and immediately actionable.

- Full-screen, dark-themed immersive welcome surface
- No traditional header, no navigation chrome, no footer
- Centered content with ambient background

#### Background

- Very subtle animated gradient mesh (slow, 30s cycle, desaturated indigo/neutral tones) — should feel like a screensaver, not a landing page effect
- Or: subtle grid pattern overlay (like terminal grid, 32px squares at 5% opacity)
- Or: gentle particle field at very low density and opacity
- Must support `prefers-reduced-motion` — static gradient fallback

#### Content Block (Center)

```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│        ⌘  ChasteAI                       │
│                                          │
│    Open-source AI customer support       │
│    infrastructure platform              │
│                                          │
│    │──────────────────────────────────│  │
│    │   Initialize Workspace           │  │
│    │──────────────────────────────────│  │
│                                          │
│    ─── or ───                           │
│                                          │
│    Already configured? → Open Dashboard │
│                                          │
│    Version 0.1.0 · MIT License           │
│    Documentation · GitHub                │
│                                          │
└──────────────────────────────────────────┘
```

#### Elements

| Element        | Spec                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| Logo/Icon      | Glyph-style mark, 32px, `--color-accent`                                |
| Product Name   | "ChasteAI", 18px, medium, `--color-text-primary`, subtle letter-spacing |
| Tagline        | 14px, `--color-text-tertiary`, max 400px                                |
| Primary CTA    | "Initialize Workspace" — primary button, large (44px), with arrow icon  |
| Secondary link | "→ Open Dashboard" — subtle link, 13px, only visible if configured      |
| Version footer | 11px, `--color-text-muted`, center                                      |

#### Interaction

- Clicking "Initialize Workspace" transitions to `/setup`
- Transition: page slides to left, setup wizard slides in from right (400ms)
- No page reload — client-side transition with smooth panel animation

### 6.2 Authentication

#### Pages

| Page             | Route               | Purpose                                              |
| ---------------- | ------------------- | ---------------------------------------------------- |
| Sign In          | `/signin`           | Email + password login, OAuth options                |
| Sign Up          | `/signup`           | Create account form                                  |
| Pending Approval | `/pending-approval` | Shown after signup when account needs admin approval |
| Forgot Password  | `/forgot-password`  | Password reset request                               |

#### Shared Layout

- Dark-themed, centered card layout
- No sidebar, no navigation chrome
- Background: subtle dark gradient or grid
- Card: 400px wide, `--color-surface-elevated`, border, 12px radius
- Loading/error states: smooth transitions within the card

#### Sign In

```
┌─────────────────────────────────┐
│           🔐                    │
│       Welcome back              │
│   Sign in to your workspace     │
│                                 │
│   Email                         │
│   ┌────────────────────────┐   │
│   │                        │   │
│   └────────────────────────┘   │
│   Password                      │
│   ┌────────────────────────┐   │
│   │                        │   │
│   └────────────────────────┘   │
│   ┌────────────────────────┐   │
│   │   Sign In               │   │
│   └────────────────────────┘   │
│                                 │
│   ─── or continue with ───     │
│                                 │
│   [GitHub] [Google]             │
│                                 │
│   No account? Create one        │
│   Forgot password?              │
└─────────────────────────────────┘
```

#### Sign Up

- Same card structure
- Fields: Name (optional), Email, Password, Confirm Password
- Password strength indicator (optional)

#### Form States (Sign In)

- **Idle:** Clean inputs, subtle placeholder text
- **Focused:** Accent border, label floats or stays
- **Filled:** Valid input styling
- **Error:** Red border + inline message
- **Submitting:** Button shows spinner, inputs disabled
- **Server error:** Inline alert banner above form
- **Pending account error:** "Your account is pending approval. Please wait for an admin to approve your account."
- **Suspended account error:** "Your account has been suspended. Please contact your administrator."

#### Form States (Sign Up)

- **Idle:** Clean inputs, subtle placeholder text
- **Focused:** Accent border, label floats or stays
- **Filled:** Valid input styling
- **Error:** Red border + inline message
- **Submitting:** Button shows spinner, inputs disabled
- **Server error:** Inline alert banner above form
- **Success (first user):** Brief checkmark animation → auto-redirect to dashboard
- **Success (subsequent user):** Account created with pending status → redirect to `/pending-approval`

#### Pending Approval Page

- Simple centered card, same dark layout as sign-in
- Shows clock/pending icon (24px)
- Heading: "Account pending approval"
- Body: "An administrator needs to approve your account before you can sign in."
- Link: "Back to sign in"

### 6.3 Setup Wizard (/setup)

#### Layout

- Full-screen dark surface (same as entry experience)
- Center-aligned card at 560px max width
- Persistent step indicator at top of card
- Content area with animated step transitions
- Footer with Back/Continue buttons

#### Card Structure

```
┌──────────────────────────────────┐
│ ⟐ ChasteAI              Step 2/5 │
│ ○──●──○──○──○                    │
│ (Step Progress Indicator)        │
├──────────────────────────────────┤
│                                   │
│   Step Content (animated)        │
│                                   │
│                                   │
│                                   │
├──────────────────────────────────┤
│   [Back]              [Continue] │
└──────────────────────────────────┘
```

#### Step Progress Indicator

```
○ ── ● ── ○ ── ○ ── ○
1    2    3    4    5
```

- Completed (1): Filled accent, checkmark icon
- Active (2): Filled accent, number
- Pending (3-5): Outlined, muted
- Connecting lines: completed = accent, pending = border
- Clickable to navigate back to completed steps

#### Step 1: Create Account

- Email input
- Name input
- Password input (with show/hide toggle)
- Password requirements: 8+ characters, show requirements as checklist
- Validation on blur
- "Create Account" primary action

- **Loading state:** Account creation spinner in button
- **Success:** Smooth transition to step 2
- **Error:** Expandable error card showing server response

#### Step 2: Database Test

- Shows connection string from TUI setup (read-only, masked partially)
- "Test Connection" button
- Terminal/log-inspired feedback area:

```
┌──────────────────────────────────────┐
│ $ Testing database connection...     │
│ ✓ Connecting to postgresql://...     │
│ ✓ Running migration check            │
│ ✓ Schema up to date                  │
│ ✓ Connection successful              │
└──────────────────────────────────────┘
```

- Connection states:
  - **Testing:** "Testing..." with spinner, log lines appear one by one
  - **Passed:** Green checkmark, "Database connected successfully", log lines visible
  - **Failed:** Red X with error message, ExpandableError with full details
- Auto-test on mount if DB URL is present

#### Step 3: AI Provider Test

- Provider preset selector (OpenAI, Groq, NVIDIA, Together, Fireworks, DeepSeek, Mistral, Custom)
- Conditional fields: API key always shown, Base URL + Model shown for Custom
- Secret API key input (password field with show/hide)
- "Test Connection" button
- Log/terminal feedback area same as step 2
- State transitions same as step 2

#### Step 4: Workspace + Agent Setup

- Workspace Name (default: "My Workspace")
- — "First Agent" section —
- Agent Name (default: "Support Agent")
- Agent Description (optional)
- System Prompt (textarea, 3 rows, placeholder: "You are a helpful support agent...")
- Clean form layout with proper spacing

#### Step 5: Completion

```
┌──────────────────────────────────┐
│         ✅                        │
│                                   │
│     All set!                      │
│                                   │
│  Your workspace is ready.         │
│  Here's what was configured:      │
│                                   │
│  ─────────────────────────        │
│  ✓ Database connected             │
│  ✓ AI provider configured         │
│  ✓ Workspace created              │
│  ✓ First agent created            │
│  ─────────────────────────        │
│                                   │
│  ┌──────────────────────────┐    │
│  │  Open Dashboard           │    │
│  └──────────────────────────┘    │
└──────────────────────────────────┘
```

- Completion checkmark animation (spring scale)
- Summary of what was configured
- "Open Dashboard" as primary button
- Button click → smooth transition to `/dashboard`

#### Transitions

- Step changes: slide content horizontally (current leaves left, next enters from right)
- Duration: 300ms, ease-in-out
- Progress bar fills animatedly

### 6.4 Dashboard Shell

#### Layout

```
┌──────────┬─────────────────────────────────────────┐
│          │  ⌘K Search...               🔔 👤      │
│          │  ── 52px top bar ──                     │
│ Sidebar  ├─────────────────────────────────────────┤
│ 260px    │                                         │
│          │                                         │
│          │  Content Area (scrollable)              │
│          │                                         │
│          │                                         │
│          │                                         │
│          │                                         │
└──────────┴─────────────────────────────────────────┘
```

#### Navigation Items

| Icon   | Label         | Route                      | Keyboard Shortcut |
| ------ | ------------- | -------------------------- | ----------------- | --- |
| Icon   | Label         | Route                      | Keyboard Shortcut |
| ---    | ---           | ---                        | ---               | --- |
| Grid   | Overview      | `/dashboard`               | `⌘1`              |
| Chart  | Analytics     | `/dashboard/analytics`     | `⌘2`              |
| Bot    | Agents        | `/dashboard/agents`        | `⌘3`              |
| Chat   | Conversations | `/dashboard/conversations` | `⌘4`              |
| Nodes  | Channels      | `/dashboard/channels`      | `⌘5`              |
| Key    | API Keys      | `/dashboard/api-keys`      | `⌘6`              |
| File   | Documents     | `/dashboard/documents`     | `⌘7`              |
| Users  | Team          | `/dashboard/team`          | `⌘8`              |
| Layers | Workspaces    | `/dashboard/workspaces`    | `⌘9`              |
| —      | —             | —                          | —                 |
| Gear   | Settings      | `/dashboard/settings`      | —                 |

#### Global Search (⌘K)

- Glass surface overlay
- Search input with placeholder: "Search pages, agents, conversations..."
- Results categorized by type
- Keyboard navigable (↑↓ to select, Enter to navigate, Esc to close)
- Recent searches shown when input is empty

### 6.5 Dashboard Overview (/dashboard)

#### Layout

40px below page title, content fills available width.

```
Page Title: "Overview"
Page Description: "Your workspace at a glance"

── KPI Row ──────────────────────────────────────
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Agents │ │ Conv.  │ │Channels│ │ Total  │
│   8    │ │  142   │ │   4    │ │ Msgs   │
│  +2    │ │  +12%  │ │  0     │ │ 2.4k   │
└────────┘ └────────┘ └────────┘ └────────┘

── Main Grid ────────────────────────────────────
┌─────────────────────┬─────────────────────────┐
│                     │                         │
│  Recent Activity    │  Quick Actions          │
│                     │                         │
│  ⟐ New conversation │  ┌──────────────────┐  │
│    Agent: Support   │  │ + New Agent       │  │
│    2m ago           │  └──────────────────┘  │
│  ⟐ Channel added   │  ┌──────────────────┐  │
│    Slack #support   │  │ + Add Channel     │  │
│    15m ago          │  └──────────────────┘  │
│  ⟐ Document indexed │  ┌──────────────────┐  │
│    API docs.pdf      │  │ + Import Docs    │  │
│    1h ago            │  └──────────────────┘  │
│                     │                         │
└─────────────────────┴─────────────────────────┘

── Bottom Row ──────────────────────────────────
┌─────────────────────┬─────────────────────────┐
│                     │                         │
│  Active Agents      │  System Health         │
│                     │                         │
│  Support Agent   ●  │  Database        ✓      │
│  Sales Bot       ●  │  AI Providers    ✓      │
│  Onboarding      ○  │  Queue           ✓      │
│                     │  Storage         ✓      │
└─────────────────────┴─────────────────────────┘
```

#### KPI Cards

- 4 cards in a row on desktop, 2x2 on tablet, stacked on mobile
- Each card: icon + value (large) + label + delta indicator
- Sparkline chart at bottom for trend (optional)

#### Quick Actions

- 3-4 primary action buttons stacked vertically
- Each: icon + label + description
- Hover: subtle background shift

#### Activity Feed

- Reverse-chronological list
- Each item: icon (contextual) + description + timestamp
- Clickable, navigates to relevant context
- "View all" link at bottom

### 6.6 Analytics (/dashboard/analytics)

#### Layout

```
Page Title: "Analytics"

── Filters Row ──────────────────────────────────
┌──────────────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│ Last 30 days │ │ All  │ │ Sort │ │ Export   │
└──────────────┘ └──────┘ └──────┘ └──────────┘

── Chart: Conversation Volume ──────────────────
┌──────────────────────────────────────────────┐
│                                              │
│    ▁▂▃▄▅▆▇██▇▆▅▄▃▂▁                         │
│    Conversation Volume over Time             │
│    30-day view                               │
│                                              │
└──────────────────────────────────────────────┘

── Metrics Row ─────────────────────────────────
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Avg    │ │ Avg    │ │ Peak   │ │ Active │
│ Resp.  │ │ Satisf.│ │ Daily  │ │ Today  │
│ 1.2s   │ │  94%   │ │  24    │ │  12    │
└────────┘ └────────┘ └────────┘ └────────┘

── Bottom Grid ─────────────────────────────────
┌─────────────────────┬─────────────────────────┐
│                     │                         │
│  Channel Dist.      │  Agent Performance      │
│                     │                         │
│  ████████ Widget 45%│  Agent      Conv  Sat   │
│  ██████ Web     30% │  Support    84   96%   │
│  ████  API     15% │  Sales      38   91%   │
│  ██    Slack   10% │  Onboard    20   88%   │
│                     │                         │
└─────────────────────┴─────────────────────────┘
```

#### Charts

- **Line chart** (conversation volume): single accent-colored line, subtle grid, labeled axes
- **Bar chart** (channel distribution): horizontal bars, color-coded by channel
- **Table** (agent performance): sortable columns (agent, conversations, satisfaction, avg response time)
- Chart library: **Recharts** (recommended) — React-native API, built-in dark mode theming, animation support, declarative. Reserve visx only if custom non-standard visualizations are needed later.

#### Design Rules for Charts

- Single accent color for primary data
- Grid lines: `--color-border`, dashed, low opacity
- Fonts: 11px, `--color-text-muted`
- No 3D, no gradients in chart fills
- Tooltip on hover: dark card with precise values
- Empty state: "No data yet" with illustration

### 6.7 Agent Management

#### Agents List

```
── Header ──────────────────────────────────────
Agents                  [Search...] [Grid/List]

── Agent Cards (Grid View) ──────────────────────
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│                 │ │                 │ │                 │
│  ⟐ Support Bot  │ │  ⟐ Sales Bot    │ │  ⟐ Onboarding   │
│     ● Active    │ │     ○ Draft     │ │     ○ Inactive  │
│                 │ │                 │ │                 │
│  GPT-4o         │ │  Mixtral        │ │  GPT-4o         │
│  84 convos      │ │  12 convos      │ │  0 convos       │
│  96% sat        │ │  —              │ │  —              │
│                 │ │                 │ │                 │
│  [Edit] [Del]   │ │  [Edit] [Del]   │ │  [Edit] [Del]   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Card Spec:** Icon + name + status badge + provider + metrics + hover actions

**Grid Responsive Layout:**

| Breakpoint            | Columns | Gap              | Card Width |
| --------------------- | ------- | ---------------- | ---------- |
| Mobile (<640px)       | 1       | —                | Full width |
| Tablet (640-1023px)   | 2       | `space-4` (16px) | Flexible   |
| Desktop (1024-1535px) | 3       | `space-4` (16px) | Flexible   |
| Ultra-wide (1536+)    | 4       | `space-5` (20px) | Flexible   |

**List View:** Table with columns: Name, Status, Provider, Model, Conversations, Satisfaction, Created, Actions

**Status Indicators:**

- Active: Green dot, "Active"
- Draft: Yellow dot, "Draft"
- Inactive: Gray dot, "Inactive"

**Empty State:** "No agents yet" with create button

#### New Agent Form

Multi-section configuration card:

```
── Basic Configuration ──
Agent Name        [________________]
Description       [________________]
System Prompt     [________________]
                  [________________]
                  [________________]

── Provider Configuration ──
Provider Type:    [OpenAI ▼]
API Key:          [________________]
Model:            [gpt-4o           ▼]
Base URL:         [https://api.openai.com/v1]

── Advanced Settings ──
Temperature:      [=====o===========] 0.7
Max Tokens:       [=====o===========] 2048
Top P:            [=====o===========] 1.0
```

#### Agent Detail

```
── Profile Header ──────────────────────────────
┌──────────────────────────────────────────────┐
│  ⟐ Support Bot           ● Active            │
│                                              │
│  GPT-4o · OpenAI · Created 2 weeks ago       │
│                                              │
│  [Edit] [Delete] [Deactivate]                │
└──────────────────────────────────────────────┘

── Metrics Row ─────────────────────────────────
84 Conversations  96% Satisfaction  1.2s Avg Response

── Tabs ────────────────────────────────────────
Overview | Conversations | Channels | Analytics

── Overview Tab ────────────────────────────────
System Prompt:
"You are a helpful support agent..."

Connected Channels: Widget, Web
Provider Configuration: OpenAI / gpt-4o
Created: 2 weeks ago
Last Active: 2 minutes ago
```

### 6.8 Conversations & Chat

#### Conversation List (Split Panel Left)

```
── Search + Filters ────────────────────────────
[Search conversations...]   [All ▼] [Date ▼]

── List ────────────────────────────────────────
┌──────────────────────────────────────────────┐
│ User: John Smith           Agent: Support    │
│ "Can you help me with..."   ● Active         │
│ 2m ago                                       │
├──────────────────────────────────────────────┤
│ User: Alice Jones          Agent: Support    │
│ "I need to reset my pa..."  ○ Resolved       │
│ 15m ago                                      │
├──────────────────────────────────────────────┤
│ User: Bob Chen             Agent: Sales      │
│ "Tell me about pricing..."  ● Active         │
│ 1h ago                                       │
└──────────────────────────────────────────────┘
```

- Each item: user name + agent label + message preview + status + timestamp
- Active: accent left border
- Hover: subtle background shift

#### Chat View (Split Panel Right)

```
── Header ─────────────────────────────────────
┌──────────────────────────────────────────────┐
│  ← Back                      John Smith      │
│  Agent: Support Bot           ● Online       │
│                              [Info] [Actions]│
└──────────────────────────────────────────────┘

── Messages ───────────────────────────────────
┌──────────────────────────────────────────────┐
│                     ┌───────────────────┐    │
│                     │ Hi, can you help  │    │
│                     │ me reset my       │    │
│                     │ password?         │    │
│                     │             2:30pm│    │
│                     └───────────────────┘    │
│                                              │
│  ┌────────────────────────────────┐          │
│  │ I'd be happy to help! Let me  │          │
│  │ guide you through the process │          │
│  │...                            │          │
│  │                        2:30pm │          │
│  └────────────────────────────────┘          │
│                                              │
│                     ┌───────────────────┐    │
│                     │ My email is       │    │
│                     │ john@example.com  │    │
│                     │             2:31pm│    │
│                     └───────────────────┘    │
│                                              │
│  ┌────────────────────────────────┐          │
│  │ ⏳ Generating response...      │          │
│  └────────────────────────────────┘          │
└──────────────────────────────────────────────┘

── Composer ───────────────────────────────────
┌──────────────────────────────────────────────┐
│ ┌──────────────────────────────────┐ ┌────┐  │
│ │ Type a message...                │ │ ↗  │  │
│ └──────────────────────────────────┘ └────┘  │
│ [📎] [📷]                                   │
└──────────────────────────────────────────────┘
```

#### Message Bubbles

| Property      | User Message               | Assistant Message          |
| ------------- | -------------------------- | -------------------------- |
| Alignment     | Right                      | Left                       |
| Background    | `--color-accent-strong`    | `--color-surface-elevated` |
| Text          | White                      | `--color-text-primary`     |
| Border Radius | 12px top-right, 4px others | 12px top-left, 4px others  |
| Max Width     | 70%                        | 75%                        |
| Margin        | 4px between messages       |                            |

#### States

- **User typing:** Dot animation at bottom of user messages
- **Assistant generating:** Blinking cursor or subtle dot animation in an assistant bubble
- **Streaming:** Text appears character by character in real-time, with smooth opacity transition
- **Error:** Red bubble on assistant side with error message + "Retry" button
- **Loading history:** Skeleton bubbles at top
- **Empty (no messages):** Centered prompt: "Start a conversation by sending a message below"

#### Composer

- Bottom-anchored, always visible
- Textarea: auto-resizing (1-6 rows), placeholder text
- Send button: accent filled, enabled only when text exists
- Attachment button: paperclip icon
- Keyboard: Enter to send, Shift+Enter for newline
- Disabled during streaming, "Stop" button replaces send during generation

### 6.9 Channels

#### Channel List

```
── Header ──────────────────────────────────────
Channels                    [Add Channel]

── Channel List ────────────────────────────────
┌──────────────────────────────────────────────┐
│  ⟐ Widget         ● Connected    Embed Snippet│
│  Public embeddable widget                     │
├──────────────────────────────────────────────┤
│  ⟐ Web API        ● Connected    Docs        │
│  REST API endpoint                            │
├──────────────────────────────────────────────┤
│  ⟐ Slack          ○ Disconnected  Configure  │
│  Slack integration not connected              │
├──────────────────────────────────────────────┤
│  ⟐ Discord        ○ Coming Soon              │
│  Discord integration (in development)        │
└──────────────────────────────────────────────┘
```

#### Channel Types & Icons

| Channel | Icon              | Default Status              |
| ------- | ----------------- | --------------------------- |
| Widget  | Window/Code icon  | Connected (when configured) |
| Web     | Globe icon        | Always available            |
| API     | Terminal/Key icon | Always available            |
| Slack   | # / Slack icon    | Disconnected (needs OAuth)  |
| Discord | / Discord icon    | Coming Soon                 |

#### Channel Detail

```
── Header ──────────────────────────────────────
Widget                          ● Connected
[Edit Settings] [Disconnect]

── Configuration ──────────────────────────────
┌──────────────────────────────────────────────┐
│ Channel Name:  [Widget Support          ]    │
│ Greeting:      [How can I help you?     ]    │
│ Accent Color:  [#6366f1                ]    │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ Save Settings                          │   │
│ └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘

── Embed Code (Widget Only) ───────────────────
┌──────────────────────────────────────────────┐
│ Embed Snippet                                 │
│                                              │
│ Copy this code and paste it into your        │
│ website's <head> tag:                        │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ <script                              │   │
│ │   src="https://chasteai.../embed.js"   │   │
│ │   data-channel="..."                   │   │
│ │ ></script>                             │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ [Copy Code] [Preview Widget]                 │
└──────────────────────────────────────────────┘
```

#### Connection Health States

- **Connected:** Green dot, "Connected", last active timestamp
- **Disconnected:** Gray dot, "Disconnected", "Configure" action
- **Error:** Red dot, error message, "Retry" action
- **Pending:** Yellow dot, "Pending setup"

### 6.10 API Keys

#### Key List

```
── Header ──────────────────────────────────────
API Keys                    [Generate Key]

── Key Table ───────────────────────────────────
┌────────────┬────────────┬──────────┬──────────┬──────────┐
│ Name       │ Key        │ Permissions│ Used    │ Created  │
├────────────┼────────────┼──────────┼──────────┼──────────┤
│ Production │ chaste-... │ Read,    │ 1,240    │ Jan 15   │
│            │ a1b2...    │ Write    │ today    │ 2025     │
├────────────┼────────────┼──────────┼──────────┼──────────┤
│ Dev        │ chaste-... │ Read     │ 12       │ Feb 1    │
│            │ c3d4...    │          │ today    │ 2025     │
└────────────┴────────────┴──────────┴──────────┴──────────┘
```

- Key partially masked (show last 4 characters)
- Actions column: copy, reveal, regenerate, revoke
- Row click expands to full details

#### Generate Key Modal

```
┌──────────────────────────────────────┐
│  Generate API Key                    │
│                                      │
│  Name                                │
│  ┌──────────────────────────────┐   │
│  │ Production Key                │   │
│  └──────────────────────────────┘   │
│                                      │
│  Permissions                         │
│  ☑ Messages: Read                   │
│  ☑ Messages: Write                  │
│  ☐ Agents: Read                     │
│  ☐ Agents: Write                    │
│  ☐ Conversations: Read              │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Generate                      │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

#### Key Revealed State (Post-Creation)

```
┌──────────────────────────────────────┐
│  ⚠️ Copy your key now               │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ chaste_a1b2c3d4e5f6g7h8i9j0 │   │
│  │                          [📋]│   │
│  └──────────────────────────────┘   │
│                                      │
│  This key will not be shown again.   │
│                                      │
│  [I've saved it, done]              │
└──────────────────────────────────────┘
```

- Monospace font for the key
- Prominent copy button
- Warning text about not being shown again
- Security-focused visual treatment (amber border)

### 6.11 Documents

#### Document List

```
── Header ──────────────────────────────────────
Documents                    [Upload] [Search...]

── Upload Zone ─────────────────────────────────
┌──────────────────────────────────────────────┐
│  📄 Drag and drop files here, or click to    │
│     browse                                    │
│  Supports PDF, DOCX, Markdown, TXT           │
└──────────────────────────────────────────────┘

── Table ───────────────────────────────────────
┌──────────────┬──────────┬─────────┬──────────┬──────────┐
│ Name         │ Status   │ Chunks  │ Size     │ Uploaded │
├──────────────┼──────────┼─────────┼──────────┼──────────┤
│ API Docs     │ ● Ready  │ 24      │ 124 KB   │ 2h ago   │
│ handbook.pdf │           │         │          │          │
├──────────────┼──────────┼─────────┼──────────┼──────────┤
│ FAQ.md       │ ● Ready  │ 8       │ 12 KB    │ 1d ago   │
├──────────────┼──────────┼─────────┼──────────┼──────────┤
│ Policy.pdf   │ ○ Process│ —       │ 2.1 MB   │ Just now │
│              │   sing   │         │          │          │
└──────────────┴──────────┴─────────┴──────────┴──────────┘
```

#### Status Indicators

| Status     | Visual                            | Description                                    |
| ---------- | --------------------------------- | ---------------------------------------------- |
| Ready      | Green dot                         | Processed and indexed, available for retrieval |
| Processing | Spinning dot with "Processing..." | Currently being chunked and indexed            |
| Failed     | Red dot with error                | Indexing failed, tooltip shows error           |
| Queued     | Yellow dot, "Queued"              | Waiting to be processed                        |

#### Upload States

- **Drag hover:** Upload zone border turns accent, background subtle, "Drop to upload"
- **Uploading:** Progress bar with filename + percentage
- **Complete:** Brief green flash, row appears in table
- **Duplicate:** Warning message, option to re-upload
- **Error:** Red state with message

### 6.12 Embedded Widget

#### Widget States

| State         | Description                                      |
| ------------- | ------------------------------------------------ |
| **Launcher**  | Floating action button, bottom-right corner      |
| **Expanded**  | Chat panel open, showing messages                |
| **Minimized** | Collapsed to launcher, but conversation persists |

#### Launcher Button

```css
width: 56px;
height: 56px;
border-radius: 16px;
background: var(--color-accent);
box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
```

- Chat bubble icon
- Pulse animation on first load (subtle)
- Hover: slight scale (1.05)

#### Expanded Widget

```
┌────────────────────────┐
│  💬 Support           ─ │
│  ────────────────────  │
│                         │
│  ┌────────────────┐    │
│  │ Welcome! How   │    │
│  │ can we help?   │    │
│  └────────────────┘    │
│                         │
│                    ┌──┐│
│                    │Hi││
│                    └──┘│
│                         │
│  ┌────────────────┐    │
│  │ How can I      │    │
│  │ assist you     │    │
│  │ today?         │    │
│  └────────────────┘    │
│                         │
│  ────────────────────  │
│  ┌────────────┐    ┌┐  │
│  │Type a msg..│    │→│  │
│  └────────────┘    └┘  │
└────────────────────────┘
```

#### Widget Dimensions

| State              | Width | Height |
| ------------------ | ----- | ------ |
| Launcher           | 56px  | 56px   |
| Expanded (desktop) | 380px | 600px  |
| Expanded (mobile)  | 100vw | 100dvh |

#### Widget Styling

- Self-contained (no external dependencies)
- CSS variables for customization (accent color, title, greeting)
- Dark/light mode: follows system preference by default, configurable
- Smooth animations: 250ms expand/collapse, spring easing
- Mobile: expands to full screen (bottom sheet style on iOS, full overlay on Android)

#### Widget Accessibility

- **Launcher:** `<button aria-label="Open support chat">`
- **Focus management:** Focus trapped within widget when expanded, returns to launcher when minimized
- **Keyboard navigation:** `Esc` key closes/minimizes the widget
- **Screen readers:** `aria-live="polite"` region for new messages, aria-expanded state on launcher
- **Reduced motion:** `prefers-reduced-motion` disables expand/collapse animations (instant show/hide)

### 6.13 Team Management

#### Overview

Team management is a top-level operational screen, not buried in settings. It lives at `/dashboard/team` and is accessible from both the sidebar navigation (⌘8) and via invite notifications.

The screen gives workspace owners and admins full visibility into who has access and the tools to manage the team.

#### Layout

```
── Header ──────────────────────────────────────
Team                            [Invite Member]

── Pending Approvals (if any) ───────────────────
┌──────┬──────────┬──────────────────────────────┐
│ User │ Email    │ Actions                      │
├──────┼──────────┼──────────────────────────────┤
│ ⟐    │ jane@    │ [Approve] [Deny]             │
│ Jane │ corp.io  │                              │
└──────┴──────────┴──────────────────────────────┘

── Member Table ─────────────────────────────────
┌──────┬──────────┬──────────────┬──────┬──────────┬──────────┐
│ User │ Email    │ Role         │ Status│ Joined   │ Actions  │
├──────┼──────────┼──────────────┼──────┼──────────┼──────────┤
│ ⟐    │ ben@     │ Owner   ●    │ Active│ Jan 2025 │ —        │
│ Ben  │ corp.io  │ [indigo]     │       │          │          │
├──────┼──────────┼──────────────┼──────┼──────────┼──────────┤
│ ⟐    │ sarah@   │ Admin   ●    │ Active│ Feb 2025 │ [▼role]  │
│ Sarah│ corp.io  │ [blue]      │       │          │ [✕]      │
├──────┼──────────┼──────────────┼──────┼──────────┼──────────┤
│ ⟐    │ alex@    │ Member  ●    │ Active│ Mar 2025 │ [▼role]  │
│ Alex │ corp.io  │ [neutral]   │       │          │ [✕]      │
├──────┼──────────┼──────────────┼──────┼──────────┼──────────┤
│ ⟐    │ jordan@  │ Member  ○    │ Pending│ —        │ [Resend] │
│      │ corp.io  │ [neutral]   │ Invite│          │ [Revoke] │
└──────┴──────────┴──────────────┴──────┴──────────┴──────────┘
```

#### Pending Approvals Section

- Visible only when there are users who signed up (via `/signup`) and are awaiting admin approval (`status: "pending"`)
- Heading: "Pending approvals" with a count badge (amber, 12px font, rounded pill)
- Each row shows: avatar initial (24px) + name + email
- Actions: [Approve] (green button) and [Deny] (ghost button, turns red on hover)
- Clicking **Approve** opens the approval modal (see below)
- Clicking **Deny** immediately sets user status to `suspended` and removes them from the list
- Empty state: section is hidden entirely when no pending users exist

#### Approval Modal

```
┌──────────────────────────────────────┐
│  Approve user                        │
│  Jane Doe <jane@corp.io>             │
│                                      │
│  Workspace                           │
│  [My Workspace          ▼]           │
│                                      │
│  Role                                │
│  [Member                ▼]           │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Approve & add to workspace  │   │
│  └──────────────────────────────┘   │
│                                      │
│  [Cancel]                            │
└──────────────────────────────────────┘
```

**States:**

- **Idle:** Workspace pre-selected to admin's first workspace, Role defaults to "Member"
- **Submitting:** Button shows spinner, "Approving..."
- **Error:** Red inline error message
- **Success:** Modal closes, row removed from pending list, user added to member table

#### Member Table

| Column  | Spec                                          | Details                                                      |
| ------- | --------------------------------------------- | ------------------------------------------------------------ |
| User    | Avatar (24px) + name (14px semibold) + layout | Name and avatar, 200px                                       |
| Email   | 13px, `--color-text-tertiary`                 | Full email, monospace for domains                            |
| Role    | Badge with dropdown                           | Pill badge (see below) + inline dropdown to change           |
| Status  | Dot + label                                   | Active (green), Pending (yellow, "Invited"), Inactive (gray) |
| Joined  | 13px, `--color-text-tertiary`                 | "Jan 15, 2025" or "—" for pending                            |
| Actions | Icon buttons                                  | Visible on row hover                                         |

#### Role Badges

| Role   | Badge BG (Dark)         | Badge Text               | Dot Color |
| ------ | ----------------------- | ------------------------ | --------- |
| Owner  | `--color-accent-subtle` | `--color-accent-text`    | Indigo    |
| Admin  | `--color-info-subtle`   | `--color-info-text`      | Blue      |
| Member | `--color-surface-high`  | `--color-text-secondary` | Gray      |

#### Invite Flow

**Trigger:** "Invite Member" button in header → opens modal.

```
┌──────────────────────────────────────┐
│  Invite team member                  │
│                                      │
│  Email address                       │
│  ┌──────────────────────────────┐   │
│  │ colleague@company.com        │   │
│  └──────────────────────────────┘   │
│                                      │
│  Role                                │
│  [Admin ▼]                           │
│                                      │
│  Admin can manage agents, channels,  │
│  and team members.                   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Send Invite                 │   │
│  └──────────────────────────────┘   │
│                                      │
│  ──────────────────────────────      │
│  Or share this invite link:          │
│  ┌──────────────────────────────┐   │
│  │ chasteai.io/join/abc123      │   │
│  │                          [📋]│   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

**States:**

- **Sending:** Button shows spinner, "Sending..."
- **Sent:** Green checkmark, "Invitation sent" message, modal closes
- **Error:** Red inline error, "Failed to send. Try again."
- **Duplicate:** "This email is already a member of this workspace"

**Post-invite behavior:**

- Row appears in table with "Pending" status (yellow dot, "Invited")
- Actions column shows: [Resend] [Revoke]
- Invite link copyable below the email input

#### Role Change

- **Inline dropdown** on role badge (for eligible roles)
- Owner can change: Admin → Member, Member → Admin
- Admin can change: Member → Admin, Admin → Member
- Member has no dropdown (cannot self-promote)
- Last owner cannot be demoted or removed
- Confirmation for role demotion: "Are you sure? This will revoke their ability to manage [permissions]."

#### Remove Member

- **Trigger:** ✕ button on row → confirmation dialog
- **Dialog copy:** "Remove [name] from [workspace]? They will lose access to all workspace resources."
- **Confirm button:** Danger variant, "Remove"
- **Protection:** Cannot remove self if last owner; disabled tooltip explains

#### Schema Requirements

The invite flow requires a new `invitations` table in both PG and SQLite schemas + a `user_sessions` table for session management. The following schema changes were implemented:

**New `invitations` table** — tracks pending, accepted, expired, and revoked invites:

- `id`, `workspace_id` (FK→workspaces), `email`, `invited_by_user_id`, `role` (default: `member`), `status` (`pending` | `accepted` | `expired` | `revoked`), `token` (unique), `expires_at`, `accepted_at`, `created_at`, `updated_at`

**New `user_sessions` table** — enables session listing and revocation in Settings:

- `id`, `user_id`, `token` (unique), `device_name`, `device_type`, `browser`, `os`, `ip_address`, `location`, `is_revoked`, `last_active_at`, `created_at`, `expires_at`

**Columns added to `workspaces`:**

- `description` (text), `timezone` (text, default `UTC`), `deleted_at` (soft-delete support)

**Columns added to `user`:**

- `status` (text, not null, default `pending`) — `"active" | "pending" | "suspended"`. First user auto-set to `active`, subsequent signups start as `pending` until admin approves.
- `theme` (text, default `system`), `density` (text, default `comfortable`)
- `created_at` (timestamp, not null, default `now()`)

**Column added to `memberships`:**

- `updated_at` (was missing — now consistent with every other table)

#### Empty State

When the user is the only member (post-setup):

```
┌──────────────────────────────────────────┐
│                                          │
│               👥                          │
│                                          │
│     Invite your team to collaborate      │
│                                          │
│  Share this workspace with your team     │
│  members so they can help manage         │
│  agents, conversations, and settings.    │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  Invite Member                   │   │
│  └──────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

### 6.14 Settings

#### Overview

Settings lives at `/dashboard/settings` and is always visible in the sidebar (gear icon, bottom section). It provides personal account management and workspace configuration in a tabbed single-page layout.

#### Layout

```
── Tab Bar ─────────────────────────────────────
Account | Workspace | Appearance

── Content Area ─────────────────────────────────
[Active tab content fills remaining width]
```

- Tab bar: underline tabs (see §4.4), sticky below page title
- Content: single scrollable area, no nested scrolling
- Save behavior: individual save buttons per section (no global "Save All")

#### Account Tab

##### Profile Section

```
┌──────────────────────────────────────────────┐
│  Profile                                     │
│                                              │
│  ┌────────┐                                  │
│  │        │  [Change Avatar]                 │
│  │ Avatar │  [Remove]                        │
│  │  (64px)│                                  │
│  └────────┘                                  │
│                                              │
│  Name                                        │
│  ┌──────────────────────────────────────┐   │
│  │ Ben                                  │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Email                                      │
│  ┌──────────────────────────────────────┐   │
│  │ ben@corp.io                          │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Save Changes                        │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

- **Avatar:** 64px round, click to upload (crop to 1:1), drag-and-drop or file picker
- **Upload states:** idle → cropping (modal with drag-resize circle crop) → saving (progress) → saved
- **Name:** text input, 14px, validate non-empty on save
- **Email:** text input, validate email format, uniqueness check on blur
- **Save:** saves all profile fields, show success toast

##### Password Section

```
┌──────────────────────────────────────────────┐
│  Password                                    │
│                                              │
│  Current password                            │
│  ┌──────────────────────────────────────┐   │
│  │ •••••••••                             │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  New password                                │
│  ┌──────────────────────────────────────┐   │
│  │ •••••••••                             │   │
│  └──────────────────────────────────────┘   │
│  ○○●○○○  Strength: Fair                    │
│                                              │
│  Confirm new password                        │
│  ┌──────────────────────────────────────┐   │
│  │ •••••••••                             │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Update Password                    │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

- **Strength indicator:** 5 segments, filled left-to-right by complexity
  - 0/5: empty (gray)
  - 1/5: Weak (red)
  - 2/5: Fair (orange)
  - 3/5: Good (yellow)
  - 4/5: Strong (light green)
  - 5/5: Very strong (green)
- **Validation:** current password must match, new ≥ 8 chars, new ≠ current, confirm must match
- **Error:** inline on field + banner at top if server error
- **Success:** toast "Password updated", clear form

##### Active Sessions

```
┌──────────────────────────────────────────────┐
│  Active Sessions                              │
│                                              │
│  ┌──────────┬──────────┬──────────┬────────┐ │
│  │ Device   │ Location │ Last Seen│ Action │ │
│  ├──────────┼──────────┼──────────┼────────┤ │
│  │ Chrome   │ Nairobi  │ Now      │ Current│ │
│  │ on macOS │          │          │        │ │
│  ├──────────┼──────────┼──────────┼────────┤ │
│  │ Firefox  │ Nairobi  │ 2h ago   │ [Revoke│ │
│  │ on Linux │          │          │  ]     │ │
│  └──────────┴──────────┴──────────┴────────┘ │
│                                              │
│  Sessions: 2 active                          │
└──────────────────────────────────────────────┘
```

- Current session labeled with "Current" badge
- Revoke action: confirmation dialog "Sign out this device?"
- After revoke: toast "Session revoked"

#### Workspace Tab

```
┌──────────────────────────────────────────────┐
│  General                                     │
│                                              │
│  Workspace name                              │
│  ┌──────────────────────────────────────┐   │
│  │ Acme Corp                            │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Workspace slug                              │
│  ┌──────────────────────────────────────┐   │
│  │ acme-corp        [Check availability] │   │
│  └──────────────────────────────────────┘   │
│  chasteai.io/acme-corp                      │
│                                              │
│  Description (optional)                      │
│  ┌──────────────────────────────────────┐   │
│  │ Customer support for Acme Corp       │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Timezone                                    │
│  [Africa/Nairobi (UTC+3)           ▼]        │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Save Changes                        │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

- **Slug:** auto-generated from name, editable separately
- **Slug check:** "Check availability" button → green checkmark (available) or red X (taken) with suggestions
- **Timezone:** searchable select with common timezones listed first

##### Danger Zone

```
┌──────────────────────────────────────────────┐
│  ⚠  Danger Zone                              │
│                                              │
│  Deleting your workspace is permanent and     │
│  cannot be undone. All agents, conversations, │
│  channels, documents, and API keys will be    │
│  deleted.                                     │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Delete this workspace              │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  (Button opens confirmation modal)           │
└──────────────────────────────────────────────┘
```

**Confirmation modal:**

```
┌──────────────────────────────────────┐
│  ⚠  Delete workspace                 │
│                                      │
│  This action cannot be undone. This  │
│  will permanently delete:            │
│  • 8 agents                          │
│  • 142 conversations                 │
│  • 4 channels                        │
│  • 12 documents                      │
│  • 3 API keys                        │
│                                      │
│  Type "Acme Corp" to confirm:        │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  I understand, delete        │   │
│  │  this workspace              │   │
│  └──────────────────────────────┘   │
│  [Cancel]                           │
└──────────────────────────────────────┘
```

- Delete button: danger variant, disabled until exact workspace name is typed
- Lists resource counts to make consequences concrete

#### Appearance Tab

```
┌──────────────────────────────────────────────┐
│  Theme                                       │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ ○ Dark   │  │ ○ Light  │  │ ○ System │   │
│  │  [preview]│  │ [preview]│  │          │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│                                              │
│  Density                                     │
│                                              │
│  [○ Comfortable  |  ● Compact]              │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Save Preferences                    │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

- **Theme:** Card-style radio selector, each option shows a small dark/light preview thumbnail
- **Density:** Toggle between Comfortable (current default, spacious padding) and Compact (tighter padding, smaller text, more information density)
- **System theme:** Follows `prefers-color-scheme`, shows current detected mode
- **Save:** persists to localStorage + user preferences API

---

## 7. Theme Implementation Strategy

### 7.1 Approach

Use a `data-theme` attribute on `<html>` with CSS custom properties for all colors, surfaces, and borders. No Tailwind `dark:` variants — all tokens are theme-agnostic CSS variables.

```html
<html data-theme="dark"></html>
```

```css
:root,
[data-theme="dark"] {
  --color-bg: #0a0a0b;
  --color-surface: #18181b;
  /* ... all dark tokens */
}

[data-theme="light"] {
  --color-bg: #ffffff;
  --color-surface: #fafafa;
  /* ... all light tokens */
}
```

### 7.2 Migration Path from Current Codebase

1. **Phase 1 — Define tokens.** Create `tokens.css` with all dark and light CSS custom properties.
2. **Phase 2 — Replace hardcoded values.** Across every component, replace `bg-[#...]`, `text-[#...]`, `border-[#...]` with the corresponding CSS variable.
3. **Phase 3 — Theme toggle.** Implement `data-theme` switching via localStorage + system preference detection.
4. **Phase 4 — Theme-aware components.** Ensure modals, toasts, and overlays read theme context correctly.

### 7.3 Tailwind v4 Integration

Tailwind v4's `@theme` directive maps to CSS custom properties automatically. Define the tokens in `globals.css`:

The `[data-theme]` selectors define `--theme-*` prefixed variables, and the `@theme` block maps them to Tailwind-consumable names. This avoids circular references (e.g., `--color-bg: var(--color-bg)` would resolve to the initial value).

```css
@import "tailwindcss";

/* Theme-scoped variables (set by data-theme attribute) */
:root,
[data-theme="dark"] {
  --theme-bg: #0a0a0b;
  --theme-surface: #18181b;
  --theme-accent: #818cf8;
  /* ... all dark tokens with --theme- prefix */
}

[data-theme="light"] {
  --theme-bg: #ffffff;
  --theme-surface: #fafafa;
  --theme-accent: #6366f1;
  /* ... all light tokens with --theme- prefix */
}

/* Tailwind @theme maps --theme-* to utility-friendly names */
@theme {
  --color-bg: var(--theme-bg);
  --color-surface: var(--theme-surface);
  --color-accent: var(--theme-accent);
  /* ... */
}
```

Use in components: `className="bg-bg text-text-primary border-border"`

This replaces ALL `bg-[#...]`, `text-[#...]`, `border-[#...]` with semantic token names while avoiding CSS circular references.

---

## 8. Migration Plan

### Migration Risk Mitigation

**Hardcoded Color Risk:** The current codebase extensively uses Tailwind raw hex values (`bg-[#...]`) and specific colors (`bg-indigo-600`). To prevent partial migration and enforce the new token system, implement an ESLint or Biome rule in Phase 1 that warns/errors on raw hex values or non-token color scales in `className` attributes.

### Phase 1 — Foundation (Current Sprint)

| Task                                                           | Effort       |
| -------------------------------------------------------------- | ------------ |
| Create `tokens.css` with complete dark/light theme definitions | 1 day        |
| Restructure `globals.css` to use `@theme` + CSS variables      | 0.5 day      |
| Build shared component library skeleton (`packages/ui`)        | 1 day        |
| Implement Button, Input, Select, Badge, Card primitives        | 2 days       |
| Set up theme toggle infrastructure (context + localStorage)    | 1 day        |
| Update root layout to `data-theme="dark"` default              | 0.5 day      |
| Baseline accessibility audit (axe-core)                        | 0.5 day      |
| **Total**                                                      | **6.5 days** |

### Phase 2 — Entry Experience & Auth

| Task                                              | Effort       |
| ------------------------------------------------- | ------------ |
| Redesign `/` (landing page → immersive welcome)   | 1.5 days     |
| Animated background component                     | 1 day        |
| Redesign `/signin`, `/signup`, `/forgot-password` | 2 days       |
| **Total**                                         | **4.5 days** |

### Phase 3 — Setup Wizard

| Task                                  | Effort     |
| ------------------------------------- | ---------- |
| Redesign wizard card + step indicator | 1 day      |
| Animated step transitions             | 0.5 day    |
| Terminal/log feedback panels          | 1 day      |
| Form state management + animations    | 1 day      |
| Completion screen                     | 0.5 day    |
| **Total**                             | **4 days** |

### Phase 4 — Dashboard Shell

| Task                                     | Effort       |
| ---------------------------------------- | ------------ |
| Sidebar component (expanded + collapsed) | 2 days       |
| Top bar + global search                  | 1.5 days     |
| Theme toggle integration                 | 0.5 day      |
| Responsive layout system                 | 1.5 days     |
| Bottom navigation (mobile)               | 1 day        |
| Cross-browser & mobile device check      | 1 day        |
| **Total**                                | **7.5 days** |

### Phase 5 — Dashboard Screens

| Task                                             | Effort      |
| ------------------------------------------------ | ----------- |
| Overview (/dashboard) — KPI cards, activity feed | 1.5 days    |
| Analytics — charts, filters, metrics             | 2 days      |
| Agents list + detail + form                      | 3 days      |
| Conversations + chat view                        | 3 days      |
| Channels list + detail + embed                   | 2 days      |
| API Keys management                              | 1.5 days    |
| Documents upload + management                    | 2 days      |
| **Total**                                        | **15 days** |

### Phase 6 — Widget & Polish

| Task                                          | Effort      |
| --------------------------------------------- | ----------- |
| Embedded widget redesign                      | 2 days      |
| Empty states across all screens               | 1 day       |
| Loading/skeleton states                       | 1 day       |
| Toast/notification system                     | 1 day       |
| Motion pass (transitions, micro-interactions) | 1.5 days    |
| Final accessibility audit + fixes             | 2 days      |
| Final mobile & cross-browser check            | 1.5 days    |
| **Total**                                     | **10 days** |

### Overall Timeline

- **Phase 1:** Week 1
- **Phase 2:** Week 1-2
- **Phase 3:** Week 2-3
- **Phase 4:** Week 3-4
- **Phase 5:** Week 4-6
- **Phase 6:** Week 6-8

**Total estimated: 8 weeks for full redesign**

---

_This document is the single source of truth for all UI/UX decisions during the redesign. All implementation work should reference this specification. When ambiguity arises, refer back to the Core Product Philosophy: direct, operational, immersive, developer-first._
