# Roadmap: World Cup 2026 Theme, Responsiveness & Gamification

## Overview

A cohesive roadmap designed to implement a high-contrast, premium light theme toggle, comprehensive mobile responsiveness testing, visual polishing, and an interactive match prediction Pick'em game with a global leaderboard.

## Phases

- [x] **Phase 1: Light Theme Toggle & Responsive Polishing** - Integrate a hydration-safe theme toggle, establish a beautiful slate-50/white & gold light palette, and polish responsiveness for all views.
- [x] **Phase 2: Match Predictions & Fan Pick'em Game** - Implement a login-free match outcome prediction system with an anonymous device-session cookie, scoring calculations, and a global leaderboard.
- [ ] **Phase 3: Bracket Predictions Auto-Sync** - Add a button to synchronize the user's bracket challenge prediction picks with actual tournament results from the database.

## Phase Details

### Phase 1: Light Theme Toggle & Responsive Polishing
**Goal**: Integrate a fully functional, premium light theme toggle and ensure every page is beautifully styled and 100% mobile responsive.
**Mode**: mvp
**Depends on**: Nothing (existing brownfield codebase is stable)
**Requirements**: [THEME-01, THEME-02, THEME-03, THEME-04, THEME-05, RESP-01, RESP-02, RESP-03]
**Success Criteria** (what must be TRUE):
  1. User can switch between Light and Dark mode by clicking a Sun/Moon toggle next to favorites.
  2. Theme choice persists across browser sessions via localStorage and loads without visible flash (FOUC).
  3. Every component and text element is fully legible with high contrast under both Light and Dark modes.
  4. The layout adapts perfectly on mobile screen widths (320px to 768px) with no unwanted overflows or broken alignments.
**Plans**: 3 plans

Plans:
- [x] 01-01: Implement theme hook, provider, and Lucide toggle button in `NavBar.tsx` (next to Favorites).
- [x] 01-02: Map light/dark theme custom properties in `globals.css` and style individual page layouts (Groups, Teams, News) for high-contrast light mode.
- [x] 01-03: Responsive audit and UI polish across all pages (Bracket overflow, Squad grid, News Feed) on mobile viewports.

---

### Phase 2: Match Predictions & Fan Pick'em Game
**Goal**: Implement a frictionless, login-free match outcome prediction game and a real-time global leaderboard.
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: [PRED-01, PRED-02, PRED-03, PRED-04, PRED-05]
**Success Criteria** (what must be TRUE):
  1. Fans can make predictions (+ and - buttons) on any upcoming (scheduled) match on the fixtures page.
  2. Predictions are linked via a frictionless anonymous `deviceId` cookie/session.
  3. A dedicated `/pickem` page displays the top 50 global leaderboard, user's nickname, and user's past predictions.
  4. Scoring calculates correctly (+3 exact score, +1 correct outcome) when a match's score is updated.
**Plans**: 1 plan

Plans:
- [x] 02-01: Build database schema, backend API routes, grading logic, and frontend interactive components for Pick'em game.

---

### Phase 3: Bracket Predictions Auto-Sync
**Goal**: Add a button to synchronize the user's bracket challenge prediction picks with actual tournament results from the database.
**Mode**: standard
**Depends on**: Phase 2
**Requirements**: [SYNC-01, SYNC-02, SYNC-03, SYNC-04]
**Success Criteria** (what must be TRUE):
  1. User can click a "Sync with Real Knockouts" button in the Bracket Challenge UI.
  2. Auto-sync populates all completed knockout matches using actual database outcomes.
  3. User's manual picks for upcoming matches are retained.
  4. Confirmation dialog warns user before overwriting manual selections.
**Plans**: 1 plan

Plans:
- [ ] 03-01: Build bracket sync logic, confirmation modal, and lock visual states in the client/server hooks and Bracket Challenge UI.

## Progress

**Execution Order:**
Phases execute in numeric order: 1, 2, 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Light Theme Toggle & Responsive Polishing | 3/3 | Completed | 2026-05-22 |
| 2. Match Predictions & Fan Pick'em Game | 1/1 | Completed | 2026-05-22 |
| 3. Bracket Predictions Auto-Sync | 0/1 | Active | — |

