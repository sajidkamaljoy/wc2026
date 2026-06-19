<!-- GSD:project-start source:PROJECT.md -->
## Project

**World Cup 2026 Fan Companion**

An interactive, premium web application built for soccer fans to follow the 104-match FIFA World Cup 2026™ in real-time. It features live scores via Server-Sent Events (SSE), active group standings, dynamic knockout seeding bracket pathways, customized favorite teams, interactive squads, and sentiment-analyzed tournament news.

**Core Value:** Empower fans with beautiful, real-time, and personalized World Cup insights that adapt flawlessly to their viewing environment and device.

### Constraints

- **Styling**: Tailwind CSS v4 utility classes only. All theme colors and dark/light classes must be defined via Tailwind v4 custom properties or `dark:` modifiers. No third-party theme packages (like next-themes) to maintain maximum lightweight speed and simplicity.
- **Hydration Safety**: Ensure browser localStorage access is hydration-safe to avoid React 19 hydration mismatches. Use mounted guards.
- **Performance**: Theme loading must be instantaneous, avoiding FOUC (Flash of Unstyled Content) on initial load by executing theme resolution inline or using a lightweight layout hydration step.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages & Runtime
| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Primary Language | TypeScript | ^5 | Strict mode enabled in `tsconfig.json` |
| Runtime | Node.js | — | Target ES2017, module resolution "bundler" |
| JSX | react-jsx | — | Configured in `tsconfig.json` |
## Frameworks
| Framework | Version | Role |
|-----------|---------|------|
| **Next.js** | 16.2.6 | Full-stack React framework (App Router) |
| **React** | 19.2.4 | UI library |
| **React DOM** | 19.2.4 | Browser rendering |
| **Prisma** | ^6.19.3 | ORM & database toolkit |
## Key Dependencies
### Production
| Package | Version | Purpose |
|---------|---------|---------|
| `@prisma/client` | ^6.19.3 | Auto-generated DB client for PostgreSQL |
| `date-fns` | ^4.2.1 | Date utility library — **now actively used** in `FanMood.tsx`, `TeamForm.tsx`, `NewsFeed.tsx`, `FullBracketTree.tsx` |
| `date-fns-tz` | ^3.2.0 | Timezone-aware date formatting (declared but still unused — `lib/timezone.ts` uses raw Intl API) |
| `lucide-react` | ^1.16.0 | Icon library (Trophy, Calendar, Star, etc.) |
| `sentiment` | ^5.0.2 | **[NEW]** Natural language sentiment scoring for news headlines |
| `zod` | ^4.4.3 | Schema validation (declared but not yet used in application code) |
### Development
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind v4 |
| `prisma` | ^6.19.3 | Prisma CLI (migrations, generate, seed) |
| `tsx` | ^4.22.3 | TypeScript execution engine for scripts/seeding |
| `dotenv` | ^17.4.2 | Environment variable loading in scripts |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 16.2.6 | Next.js ESLint rules (core-web-vitals + TypeScript) |
## Build & Development
| Task | Command | Notes |
|------|---------|-------|
| Dev Server | `npm run dev` → `next dev` | Hot reload on `http://localhost:3000` |
| Production Build | `npm run build` → `prisma generate && next build` | Prisma client generated before Next build |
| Start Production | `npm run start` → `next start` | Serves production bundle |
| Lint | `npm run lint` → `eslint` | Uses `eslint.config.mjs` flat config |
| DB Seed | `tsx prisma/seed.ts` | Configured via `prisma.config.ts` |
## Configuration Files
| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript strict mode, path aliases (`@/*` → `./*`) |
| `next.config.ts` | Next.js config (currently empty/default) |
| `postcss.config.mjs` | PostCSS with `@tailwindcss/postcss` plugin |
| `eslint.config.mjs` | Flat ESLint config with core-web-vitals + TypeScript |
| `prisma.config.ts` | Prisma config with seed command and datasource URL |
| `.env` / `.env.local` | Environment variables (DATABASE_URL, API keys) |
| `.gitignore` | Excludes `node_modules`, `.next`, `.env*`, build artifacts |
## Path Aliases
## CSS & Styling
- **Tailwind CSS v4** via PostCSS plugin
- Global styles in `app/globals.css`:
- **Dark mode**: Applied globally via `dark` class on `<html>` element
- **Typography**: Google Fonts `Inter` loaded via `next/font/google`
## Font Loading
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Component Patterns
### "use client" Directive
- `components/NavBar.tsx`
- `components/PageWrapper.tsx`
- `components/TimezoneBanner.tsx`
- All `components/fixtures/*.tsx`
- All `components/groups/GroupGrid.tsx`, `GroupTable.tsx`, `TeamRow.tsx`
- All `components/live/*.tsx` (except `LiveScoreBadge.tsx` which doesn't need client hooks)
- `components/pathway/PathwayBracket.tsx`
- `components/search/SearchModal.tsx`
- `components/squad/SquadView.tsx`
- `components/bracket/FullBracketTree.tsx` **[NEW]**
- `components/team/TeamForm.tsx` **[NEW]**
- `components/team/FanMood.tsx` **[NEW]**
- `hooks/useFavorites.ts`
- `app/groups/page.tsx` — async server component with direct Prisma query
- `app/teams/[teamId]/page.tsx` — server component with Prisma validation
- `app/bracket/page.tsx` — async server component with direct Prisma query **[NEW]**
- `components/groups/GroupGridServer.tsx` — thin server-to-client bridge
- `components/live/LiveScoreBadge.tsx` — pure presentational, no hooks
- `components/news/NewsFeed.tsx` — RSC that calls `getWorldCupNews()` **[NEW]**
### Component Interface Pattern
### Data Fetching in Client Components
- `active` flag prevents state updates after unmount
- Loading state managed with `useState(true)` (optimistic loading)
- Errors logged to console, not surfaced to UI (except `SquadView` which sets an error state)
- `finally` always resets loading state
### Loading States
### Empty States
## Naming Conventions
| Element | Convention | Examples |
|---------|-----------|---------|
| Components | PascalCase, named exports | `export function FixtureCard()` |
| Hooks | camelCase, `use` prefix | `useFavorites`, `useLiveScores` |
| Helper functions | camelCase, file-scoped | `stageName()`, `groupByDate()`, `ordinal()` |
| Type interfaces | PascalCase | `MatchWithTeams`, `TeamPathway`, `LiveScore` |
| Type aliases | PascalCase + `Type` suffix | `StageType`, `MatchStatusType`, `PositionType` |
| API routes | RESTful path segments | `/api/teams/[teamId]/pathway` |
| CSS classes | Tailwind utility-first | No custom class names except `animate-fade-in` |
| Constants | UPPER_SNAKE_CASE | `BRACKET`, `ID_MAP_TTL_MS`, `STAGES` |
| Env variables | UPPER_SNAKE_CASE | `DATABASE_URL`, `FOOTBALL_DATA_API_KEY`, `NEWS_API_KEY` |
## Error Handling
### API Routes
### External API Client
- Returns empty array `[]` on any API error
- Returns mock `{ matches: [] }` if no API key configured
- Catches errors silently in `getLiveScores()` to prevent app crashes
- Returns mock articles array if `NEWS_API_KEY` is absent (never null/crash)
- Logs errors and returns a single fallback mock on any API error
- De-duplicates by normalized title to avoid repeated headlines
### Client Components
- Errors are logged via `console.error` — no user-facing error toasts
- `SquadView` is the only component that sets an error state string for display
- Other components silently fall back to empty/default states
## Import Patterns
### Path Alias
### Type-Only Imports
### Barrel Exports
- `types/index.ts` exports all shared types from a single file
- Component directories do NOT use barrel exports (direct file imports)
## Styling Conventions
### Tailwind CSS v4
- All styling is via Tailwind utility classes inline
- No CSS modules, no styled-components, no separate `.css` files per component
- Single `globals.css` with minimal custom CSS (variables + 1 keyframe animation)
### Design System Tokens
| Token | Value | Usage |
|-------|-------|-------|
| Background | `bg-slate-950` (#020617) | App background, dark mode |
| Text primary | `text-slate-100` | Body text |
| Text muted | `text-slate-400` / `text-slate-500` | Secondary text, labels |
| Accent gold | `text-amber-400`, `bg-amber-500/10` | Active states, highlights, points |
| Live/danger | `text-red-400`, `bg-red-500/10` | Live match indicators, negative sentiment |
| Success/qualify | `text-emerald-400`, `bg-emerald-500/10` | Qualification zone, positive sentiment |
| Warning | `text-amber-300`, `bg-amber-500/5` | Third-place conditional |
| Border subtle | `border-white/5`, `border-white/10` | Card borders, dividers |
| Glassmorphism | `backdrop-blur-md`, `bg-slate-950/80` | NavBar, modals |
### Responsive Pattern
- Mobile: icon-only nav items, collapsed badges, stacked layouts
- `sm:` — show nav labels, expand badges
- `md:` — side-by-side fixture card layout, TeamForm horizontal scroll
- `lg:` — wider content area
- `xl:` — 3-column group grid
### Animation Classes
| Class | Source | Usage |
|-------|-------|-------|
| `animate-fade-in` | Custom keyframe in `globals.css` | Page transitions via `PageWrapper` |
| `animate-spin` | Tailwind built-in | Loading spinners |
| `animate-pulse` | Tailwind built-in | Live indicator, preliminary squad badge, FanMood skeleton |
| `animate-ping` | Tailwind built-in | Live dot ripple effect, sentiment indicator dot |
## SEO Patterns
- Root layout sets base metadata with keywords and authors
- Team detail page uses `generateMetadata()` for dynamic team-specific metadata
- Bracket page **[NEW]** exports static metadata
- `<h1>` used once per page with gradient text treatment
## Hydration Safety
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Architectural Pattern
### Rendering Strategy
| Page | Rendering | Data Fetching |
|------|-----------|---------------|
| `/` (Home) | Server → redirect to `/fixtures` | None |
| `/fixtures` | Mixed: RSC shell + client `FixtureList`, RSC `NewsFeed` | `fetch("/api/fixtures")` from browser; `getWorldCupNews()` server-side |
| `/groups` | **Async Server Component** | Direct Prisma query via `unstable_cache` |
| `/teams/[teamId]` | Server component shell, client children | Server validates team; client fetches pathway, form, sentiment, squad |
| `/bracket` | **[NEW] Async Server Component** | Direct Prisma query for knockout matches |
### Key Architectural Decision: Server vs Client
- **Groups page** uses direct Prisma access in the server component (zero client spinner)
- **Fixtures page** delegates to a fully client-side `FixtureList` component + a server-side `NewsFeed` RSC component
- **Team detail page** is a server component that validates team existence, then renders client components (`PathwayBracket`, `TeamForm`, `FanMood`, `SquadView`) that each fetch their own data
- **Bracket page** (new) is a pure server component that fetches all knockout matches directly from Prisma and passes to a client-side `FullBracketTree`
## Layers
```
```
## Data Flow
### 1. Initial Page Load — Fixtures
```
```
### 2. Live Score Updates
```
```
### 3. Team Pathway Calculation
```
```
### 4. Group Standings (Server-Side)
```
```
### 5. [NEW] Team Recent Form
```
```
### 6. [NEW] Fan Mood Sentiment
```
```
### 7. [NEW] Knockout Bracket Page
```
```
## Key Abstractions
### LiveScoreProvider / useLiveScores
### BRACKET Constant (`lib/constants.ts`)
- `BRACKET.R32[groupId][position]` → R32 slot + opponents
- `BRACKET.R16[r32Slot]` → R16 slot + opponents
- `BRACKET.QF[r16Slot]` → QF slot + opponents
- `BRACKET.SF[qfSlot]` → SF slot + opponents
### calculatePathway (`lib/pathway.ts`)
### [NEW] news-api.ts
- `getWorldCupNews()` — used by `NewsFeed` RSC on Fixtures page
- `getTeamNews(teamName)` — used by `/api/teams/[teamId]/sentiment` route
## Entry Points
| Entry | File | Type |
|-------|------|------|
| App root | `app/layout.tsx` | Root layout with providers, nav, page wrapper |
| Home page | `app/page.tsx` | Redirect to `/fixtures` |
| Fixtures | `app/fixtures/page.tsx` | Server shell with `NewsFeed` RSC + client `FixtureList` |
| Groups | `app/groups/page.tsx` | Server-rendered standings |
| Team detail | `app/teams/[teamId]/page.tsx` | Pathway + Form + FanMood + Squad |
| **Bracket** | `app/bracket/page.tsx` | **[NEW]** Server-rendered knockout bracket |
| Fixtures API | `app/api/fixtures/route.ts` | REST endpoint |
| Groups API | `app/api/groups/route.ts` | REST endpoint |
| Scores API | `app/api/scores/route.ts` | REST endpoint |
| SSE Stream | `app/api/scores/stream/route.ts` | SSE endpoint |
| Teams API | `app/api/teams/route.ts` | REST endpoint |
| Team detail API | `app/api/teams/[teamId]/route.ts` | REST endpoint |
| **Form API** | `app/api/teams/[teamId]/form/route.ts` | **[NEW]** Recent match results from martj42 CSV |
| **Sentiment API** | `app/api/teams/[teamId]/sentiment/route.ts` | **[NEW]** Fan mood score via news + NLP |
| DB Seed | `prisma/seed.ts` | Database seeding script |
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tools** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them. `codegraph_node` returns one symbol's source + callers, or reads a whole file with line numbers. If the tools are listed but deferred, load them by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` and `codegraph node <symbol-or-file>` print the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
