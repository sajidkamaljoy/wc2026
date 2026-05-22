# World Cup 2026 Fan Companion

## What This Is

An interactive, premium web application built for soccer fans to follow the 104-match FIFA World Cup 2026™ in real-time. It features live scores via Server-Sent Events (SSE), active group standings, dynamic knockout seeding bracket pathways, customized favorite teams, interactive squads, and sentiment-analyzed tournament news.

## Core Value

Empower fans with beautiful, real-time, and personalized World Cup insights that adapt flawlessly to their viewing environment and device.

## Requirements

### Validated

- ✓ **Real-time Live Scores**: Live score streaming via SSE and mock generator.
- ✓ **Active Group Standings**: Accurate calculations of group standings based on matches.
- ✓ **Knockout Bracket Seeding**: Dynamic visual path tracker for the knockout brackets.
- ✓ **Personalized Favorites**: Star and pin favorite teams with local storage memory.
- ✓ **Timezone Kickoff Conversion**: Localized match kickoff times.
- ✓ **Sentiment-Analyzed News Feed**: Fetching news with positive/negative sentiment highlights.
- ✓ **Interactive Squad View**: Detailed squad roster and tactical lineup viewing.

### Active

- [ ] **THEME-01**: Implement light/dark theme state with localStorage persistence (`wc2026_theme`, default `dark`).
- [ ] **THEME-02**: Add a premium light theme palette: crisp white/slate-50 background, slate-950 text, keeping our signature amber-400 gold highlights and dark border contrasts.
- [ ] **THEME-03**: Create a Lucide Sun/Moon toggle button positioned in the Header-Right next to the favorites icon, fully accessible and interactive on both desktop and mobile headers.
- [ ] **THEME-04**: Adapt all components and pages to support light mode seamlessly without breaking the layout or visual premium feel.
- [ ] **THEME-05**: Ensure full mobile responsiveness across all pages (fixtures, groups, team details, bracket, squads, news) under both light and dark themes.

### Out of Scope

- **System Preference Sync**: Excluded by user design choice in favor of an explicit toggler.
- **Custom Theme Colors**: Custom color themes or dynamic primary color selection.
- **Real-time Global Chat**: Deferred due to high complexity and server overhead.

## Context

- **Technical Environment**: Next.js 16.2.6 (React 19 App Router), Prisma 6 ORM, PostgreSQL (Neon serverless), Tailwind CSS v4 via PostCSS.
- **Current State**: The application is currently dark-only, hardcoded with the `dark` class on the `<html>` element in `app/layout.tsx`. Colors are hardcoded using slate-950 for backgrounds and slate-100 for texts.
- **Theme Mechanics**: Tailwind v4 uses the `dark:` variant. The toggle will programmatically append/remove the `dark` class from `document.documentElement` and persist the setting in `localStorage` using a custom client hook.

## Constraints

- **Styling**: Tailwind CSS v4 utility classes only. All theme colors and dark/light classes must be defined via Tailwind v4 custom properties or `dark:` modifiers. No third-party theme packages (like next-themes) to maintain maximum lightweight speed and simplicity.
- **Hydration Safety**: Ensure browser localStorage access is hydration-safe to avoid React 19 hydration mismatches. Use mounted guards.
- **Performance**: Theme loading must be instantaneous, avoiding FOUC (Flash of Unstyled Content) on initial load by executing theme resolution inline or using a lightweight layout hydration step.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Clean Slate & Gold Palette** | Retains high-end visual aesthetic by pairing crisp clean white backgrounds with signature World Cup gold highlights and sharp dark borders. | — Pending |
| **Header-Right Toggle Placement** | Places the Sun/Moon toggle next to favorites in the persistent navigation bar for instant accessibility on all screen sizes. | — Pending |
| **Explicit Toggle Mode** | Simplifies user experience by toggling directly between Light and Dark mode without a convoluted third "System" choice. | — Pending |
| **Pure Tailwind v4 Class-toggling** | Leverages Tailwind v4's native `dark` class selector logic, minimizing build complexity and external runtime hooks. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-22 after initialization*
