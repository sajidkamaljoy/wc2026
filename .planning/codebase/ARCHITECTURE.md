# Architecture

> Mapped: 2026-05-21

## Architectural Pattern

**Next.js App Router (Hybrid SSR + Client)** — The application follows a standard Next.js 16 architecture using the App Router with a mix of server components, async server pages, and client components.

### Rendering Strategy

| Page | Rendering | Data Fetching |
|------|-----------|---------------|
| `/` (Home) | Server → redirect to `/fixtures` | None |
| `/fixtures` | Client-side via `FixtureList` | `fetch("/api/fixtures")` from browser |
| `/groups` | **Async Server Component** | Direct Prisma query via `unstable_cache` |
| `/teams/[teamId]` | Server component shell, client children | Server validates team, client fetches pathway + squad |

### Key Architectural Decision: Server vs Client

- **Groups page** uses direct Prisma access in the server component (zero client spinner)
- **Fixtures page** delegates to a fully client-side `FixtureList` component that fetches from API routes (enables live score overlay and dynamic filtering without full page reloads)
- **Team detail page** is a server component that validates team existence, then renders client components (`PathwayBracket`, `SquadView`) that fetch their own data

---

## Layers

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│  ┌───────────────────────────────────────────┐  │
│  │  Client Components (React 19)             │  │
│  │  NavBar, FixtureList, GroupGrid,          │  │
│  │  PathwayBracket, SquadView, SearchModal   │  │
│  │  LiveScoreProvider (SSE/polling)          │  │
│  └─────────────┬─────────────────────────────┘  │
│                │ fetch()                        │
├────────────────┼────────────────────────────────┤
│                ▼                                │
│  ┌───────────────────────────────────────────┐  │
│  │  Next.js App Router                       │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ │  │
│  │  │ Server Pages    │ │ API Routes      │ │  │
│  │  │ /groups (SSR)   │ │ /api/fixtures   │ │  │
│  │  │ /teams/[id]     │ │ /api/groups     │ │  │
│  │  │                 │ │ /api/scores     │ │  │
│  │  │                 │ │ /api/scores/    │ │  │
│  │  │                 │ │   stream (SSE)  │ │  │
│  │  │                 │ │ /api/teams      │ │  │
│  │  │                 │ │ /api/teams/     │ │  │
│  │  │                 │ │   [id]/pathway  │ │  │
│  │  │                 │ │   [id]/squad    │ │  │
│  │  └─────────────────┘ └────────┬────────┘ │  │
│  └──────────────────────────────┬┘──────────┘  │
│                                 │               │
├─────────────────────────────────┼───────────────┤
│  ┌──────────────────────────────▼────────────┐  │
│  │  Service / Library Layer                  │  │
│  │  lib/db.ts         (Prisma singleton)     │  │
│  │  lib/football-api.ts (external API)       │  │
│  │  lib/pathway.ts    (bracket calculation)  │  │
│  │  lib/timezone.ts   (Intl formatting)      │  │
│  │  lib/constants.ts  (bracket seeding map)  │  │
│  └──────────────────────────────┬────────────┘  │
│                                 │               │
├─────────────────────────────────┼───────────────┤
│  ┌──────────────────────────────▼────────────┐  │
│  │  Data Layer                               │  │
│  │  PostgreSQL (Neon Serverless)             │  │
│  │  5 tables: Group, Team, Venue, Match,     │  │
│  │            Player                         │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  External API                             │  │
│  │  football-data.org/v4 (live scores)       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Initial Page Load — Fixtures

```
Browser → GET /fixtures (Next.js page, renders shell)
       → FixtureList client component mounts
       → fetch("/api/teams") + fetch("/api/fixtures?sort=date")
       → API routes query Prisma (unstable_cache)
       → JSON responses render FixtureCard components
```

### 2. Live Score Updates

```
LiveScoreProvider mounts at root layout level
  → new EventSource("/api/scores/stream")
     → Server: ensurePoller() starts 30s interval
     → Server: getLiveScoresMapped() → football-data.org API
     → Server: broadcasts via SSE to all connected clients
  → On SSE error: fallback to 30s polling via GET /api/scores
  → Updates LiveScoreContext → all FixtureCard components re-render
```

### 3. Team Pathway Calculation

```
Browser → /teams/ARG (server validates team exists)
       → PathwayBracket mounts
       → fetch("/api/teams/ARG/pathway")
       → API: calculatePathway("ARG")
              → Load team + group + standings from Prisma
              → Determine current position in group
              → Map through BRACKET constant (R32→R16→QF→SF→Final)
              → Return PathwayRound[] with bracket slots
```

### 4. Group Standings (Server-Side)

```
Browser → GET /groups
       → Server component: fetchGroups() via unstable_cache
       → Direct Prisma query (no API route)
       → GroupGridServer renders with pre-fetched data
       → Zero client-side loading spinner
```

---

## Key Abstractions

### LiveScoreProvider / useLiveScores

The **single most important architectural abstraction**. A React Context provider at the root layout that maintains ONE connection (SSE or polling) for the entire app. Any component can call `useLiveScores()` to get current scores without creating duplicate connections.

### BRACKET Constant (`lib/constants.ts`)

A deeply nested constant that encodes the entire FIFA World Cup 2026 knockout bracket seeding rules:
- `BRACKET.R32[groupId][position]` → R32 slot + opponents
- `BRACKET.R16[r32Slot]` → R16 slot + opponents
- `BRACKET.QF[r16Slot]` → QF slot + opponents
- `BRACKET.SF[qfSlot]` → SF slot + opponents

This static mapping is the foundation of the pathway feature.

### calculatePathway (`lib/pathway.ts`)

Computes a team's full tournament pathway from group stage to Final by:
1. Loading current standings from DB
2. Determining position in group
3. Walking through BRACKET maps to project bracket slots

---

## Entry Points

| Entry | File | Type |
|-------|------|------|
| App root | `app/layout.tsx` | Root layout with providers, nav, page wrapper |
| Home page | `app/page.tsx` | Redirect to `/fixtures` |
| Fixtures | `app/fixtures/page.tsx` | Client-side fixture list |
| Groups | `app/groups/page.tsx` | Server-rendered standings |
| Team detail | `app/teams/[teamId]/page.tsx` | Pathway + squad view |
| Fixtures API | `app/api/fixtures/route.ts` | REST endpoint |
| Groups API | `app/api/groups/route.ts` | REST endpoint |
| Scores API | `app/api/scores/route.ts` | REST endpoint |
| SSE Stream | `app/api/scores/stream/route.ts` | SSE endpoint |
| Teams API | `app/api/teams/route.ts` | REST endpoint |
| Team detail API | `app/api/teams/[teamId]/route.ts` | REST endpoint |
| DB Seed | `prisma/seed.ts` | Database seeding script |
