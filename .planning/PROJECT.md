# World Cup 2026 Fan Companion

## What This Is

An interactive, premium web application built for soccer fans to follow the 104-match FIFA World Cup 2026™ in real-time. It features live scores via Server-Sent Events (SSE), active group standings, dynamic knockout seeding bracket pathways, customized favorite teams, interactive squads, sentiment-analyzed tournament news, and a frictionless Match Predictions "Pick'em" game with global leaderboards.

## Core Value

Empower fans with beautiful, real-time, and personalized World Cup insights that adapt flawlessly to their viewing environment and device.

## Current Milestone: v1.1 Bracket Auto-Sync

**Goal:** Enable fans to automatically synchronize their bracket predictions with the latest real-time database knockout fixtures.

**Target features:**
- UI button in Bracket Challenge to trigger auto-sync
- Pull actual database match results to resolve completed knockouts in the user's prediction sheet
- Transition seamlessly from group standings sync to knockout stage progression

## Requirements

### Validated

- ✓ **Real-time Live Scores**: Live score streaming via SSE and mock generator.
- ✓ **Active Group Standings**: Accurate calculations of group standings based on matches.
- ✓ **Knockout Bracket Seeding**: Dynamic visual path tracker for the knockout brackets.
- ✓ **Personalized Favorites**: Star and pin favorite teams with local storage memory.
- ✓ **Timezone Kickoff Conversion**: Localized match kickoff times.
- ✓ **Sentiment-Analyzed News Feed**: Fetching news with positive/negative sentiment highlights.
- ✓ **Interactive Squad View**: Detailed squad roster and tactical lineup viewing.
- ✓ **Light/Dark Theme Toggling**: Hydration-safe theme toggle next to favorites with instant persistence (Phase 1).
- ✓ **Mobile Responsiveness**: Thorough visual audit and scaling optimizations for all pages under both themes (Phase 1).
- ✓ **Pick'em Gamification**: Frictionless predictions on upcoming matches with anonymous device cookies (Phase 2).
- ✓ **Scoring Engine**: Precise backend scoring (+3 exact, +1 outcome) running when results update (Phase 2).
- ✓ **Global Leaderboard**: Standings page (`/pickem`) showing top 50 fans, nicknames, and past submissions (Phase 2).

### Active

- [ ] **SYNC-01**: Add a "Sync with Real Knockouts" button to the Bracket Challenge interface.
- [ ] **SYNC-02**: Pull current database knockout results to auto-populate played matches.
- [ ] **SYNC-03**: Retain user's custom picks for all upcoming/unplayed matches during sync.


### Out of Scope

- **System Preference Sync**: Excluded by user design choice in favor of an explicit toggler.
- **Custom Theme Colors**: Custom color themes or dynamic primary color selection.
- **Real-time Global Chat**: Deferred due to high complexity and server overhead.
- **Traditional Social Login**: Frictionless cookie-based session selected instead.

## Context

- **Technical Environment**: Next.js 16.2.6 (React 19 App Router), Prisma 6 ORM, PostgreSQL (Neon serverless), Tailwind CSS v4 via PostCSS.
- **Theme Mechanics**: Tailwind v4 uses the `dark:` variant. The theme context provider toggles the `dark` class on `document.documentElement` and persists preference in `localStorage` using the custom key `wc2026_theme`.
- **Gamification Mechanics**: Frictionless database identity mapped via a long-lived `wc2026_device_id` cookie. Prediction limits checked based on match start time.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Clean Slate & Gold Palette** | Retains high-end visual aesthetic by pairing crisp clean white backgrounds with signature World Cup gold highlights and sharp dark borders. | ✓ Validated (Phase 1) |
| **Header-Right Toggle Placement** | Places the Sun/Moon toggle next to favorites in the persistent navigation bar for instant accessibility on all screen sizes. | ✓ Validated (Phase 1) |
| **Explicit Toggle Mode** | Simplifies user experience by toggling directly between Light and Dark mode without a convoluted third "System" choice. | ✓ Validated (Phase 1) |
| **Pure Tailwind v4 Class-toggling** | Leverages Tailwind v4's native `dark` class selector logic, minimizing build complexity and external runtime hooks. | ✓ Validated (Phase 1) |
| **Anonymous Device Identity** | Bypasses all signup/login friction, dramatically improving prediction submission rates. | ✓ Validated (Phase 2) |
| **+3 / +1 Points Scoring Engine** | Provides simple, standard game mechanics (+3 for exact score, +1 for correct outcome/winner) easy for fans to track. | ✓ Validated (Phase 2) |
| **Dedicated `/pickem` Standings Hub** | Provides a comprehensive dashboard for user profiles, nicknames editing, prediction histories, and global top 50. | ✓ Validated (Phase 2) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-05-22 after Phase 2 completion*
