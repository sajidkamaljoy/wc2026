# Roadmap: World Cup 2026 Theme & Responsiveness

## Overview

A cohesive roadmap designed to implement a high-contrast, premium light theme toggle alongside comprehensive mobile responsiveness testing and visual polishing across all views of the World Cup 2026 application.

## Phases

- [ ] **Phase 1: Light Theme Toggle & Responsive Polishing** - Integrate a hydration-safe theme toggle, establish a beautiful slate-50/white & gold light palette, and polish responsiveness for all views.

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
- [ ] 01-01: Implement theme hook, provider, and Lucide toggle button in `NavBar.tsx` (next to Favorites).
- [ ] 01-02: Map light/dark theme custom properties in `globals.css` and style individual page layouts (Groups, Teams, News) for high-contrast light mode.
- [ ] 01-03: Responsive audit and UI polish across all pages (Bracket overflow, Squad grid, News Feed) on mobile viewports.

## Progress

**Execution Order:**
Phases execute in numeric order: 1

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Light Theme Toggle & Responsive Polishing | 0/3 | Not started | - |
