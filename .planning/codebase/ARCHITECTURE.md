# Architecture

> Mapped: 2026-05-21 | Updated: 2026-07-07

## Architectural Pattern

**Next.js App Router (Hybrid SSR + Client)** — The application follows a Next.js App Router architecture using a combination of Server Components, API routes, Client Components, and real-time streaming integrations.

### Rendering Strategy

| Page / Route | Rendering | Data Fetching |
|--------------|-----------|---------------|
| `/` (Home) | Server | Redirects to `/fixtures` |
| `/fixtures` | Mixed | RSC shell fetches news headlines; client `FixtureList` pulls API fixtures |
| `/groups` | Server (Async) | Queries Prisma directly with `unstable_cache` |
| `/teams/[teamId]` | Server shell | Server validates team existence; client mounts pathway, recent form, sentiment, and squad details |
| `/bracket` | Server (Async) | Direct database query for knockout matches rendered dynamically |
| `/pickem` | Client | Renders interactive match prediction list and full bracket predictor challenge |
| `/watch` | Client | Real-time live sports stream viewer with embedded players |
| `/api/h2h` | API Route | Queries `martj42` historical CSV to calculate face-to-face records |
| `/api/leaderboard` | API Route | Returns top fan points leaders from DB |
| `/api/predict/bracket` | API Route | Handles user bracket submissions with rate-limiting and DB upserts |
| `/api/predictions` | API Route | Saves individual match score predictions |
| `/api/watch/live` | API Route | Lists matches currently streaming live via `streamed.pk` API |
| `/api/watch/streams` | API Route | Resolves player embed URLs for active fixtures |

---

## Layers

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│  ┌───────────────────────────────────────────┐  │
│  │  Client Components (React 19)             │  │
│  │  NavBar, BottomNav, FixtureList,          │  │
│  │  PathwayBracket, SquadView, SearchModal,  │  │
│  │  LiveScoreProvider, TeamForm, FanMood,    │  │
│  │  BracketChallenge, SharedBracketView,     │  │
│  │  PredictionHistory, ErrorState            │  │
│  └─────────────┬─────────────────────────────┘  │
│                │ fetch()                        │
│ ├──────────────┼──────────────────────────────┤ │
│ │              ▼                              │ │
│ │  ┌────────────────────────────────────────┐  │ │
│ │  │  Next.js App Router                    │  │ │
│ │  │  ┌────────────────┐ ┌────────────────┐ │  │ │
│ │  │  │ Server Pages   │ │ API Routes     │ │  │ │
│ │  │  │ /groups (SSR)  │ │ /api/fixtures  │ │  │ │
│ │  │  │ /teams/[id]    │ │ /api/groups    │ │  │ │
│ │  │  │ /bracket (SSR) │ │ /api/scores    │ │  │ │
│ │  │  │ /pickem (SPA)  │ │ /api/predict/  │ │  │ │
│ │  │  │ /watch (SPA)   │ │   bracket      │ │  │ │
│ │  │  │                │ │ /api/watch/    │ │  │ │
│ │  │  │                │ │   streams      │ │  │ │
│ │  │  │                │ │ /api/h2h       │ │  │ │
│ │  │  └────────────────┘ └────────┬───────┘ │  │ │
│ │  └──────────────────────────────┼─────────┘  │ │
│ └─────────────────────────────────┼─────────────┘
│                                   │             │
├───────────────────────────────────┼─────────────┤
│  ┌────────────────────────────────▼──────────┐  │
│  │  Service / Library Layer                  │  │
│  │  lib/db.ts         (Prisma Client)        │  │
│  │  lib/football-api.ts (football-data API)  │  │
│  │  lib/news-api.ts   (GNews API client)     │  │
│  │  lib/streamed-api.ts (streamed.pk client)  │  │
│  │  lib/knockout-resolver.ts                 │  │
│  │                    (dynamic progression)  │  │
│  │  lib/gradePredictions.ts                  │  │
│  │                    (prediction scoring)   │  │
│  │  lib/rate-limit.ts (in-memory rate limit) │  │
│  │  lib/pathway.ts    (bracket pathways)     │  │
│  │  lib/timezone.ts   (localized dates)      │  │
│  │  lib/constants.ts  (bracket mappings)     │  │
│  └────────────────────────────────┬──────────┘  │
│                                   │             │
├───────────────────────────────────┼─────────────┤
│  ┌────────────────────────────────▼──────────┐  │
│  │  Data Layer                               │  │
│  │  PostgreSQL (Neon serverless DB)          │  │
│  │  8 tables: User, BracketPrediction,       │  │
│  │            Prediction, Match, Team, Group,│  │
│  │            Venue, Player                  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Initial Page Load — Fixtures
```
Browser → GET /fixtures (Next.js page, renders shell)
       → NewsFeed RSC fetches getWorldCupNews() server-side
       → FixtureList client component mounts
       → fetch("/api/teams") + fetch("/api/fixtures?sort=date")
       → API routes query Prisma (unstable_cache)
       → JSON responses render FixtureCard components
```

### 2. Live Score Updates & Progression Resolver
```
LiveScoreProvider mounts at root layout level
  → new EventSource("/api/scores/stream")
     → Server: ensurePoller() starts 30s interval
     → Server: getLiveScoresMapped() → football-data.org API
     → Server: updates MatchStatus, grades predictions, resolves knockouts
     → Server: broadcasts via SSE to all connected clients
  → On SSE error: fallback to 30s polling via GET /api/scores
```

### 3. Prediction & Scoring Engine
```
User submits a score prediction for Match 1
  → fetch("/api/predictions", { method: "POST" })
  → rateLimit(clientIp) check passed
  → predictionSchema validation passed
  → prisma.prediction.upsert() stores scores against deviceId
...
Match 1 moves to FINISHED in DB
  → autoResolveKnockouts() called (progresses winners along bracket slots)
  → gradePredictionsForMatch() runs
     → 3 points for exact score; 1 point for correct winner/draw outcome
     → prisma.user.update() increments aggregate user points cache
```

### 4. Interactive Bracket Simulation & Submission
```
User navigates to `/pickem` and customizes bracket challenge picks
  → Renders list of groups and draggable bracket slots
  → BracketPrediction schema validation parses the JSON picking states
  → prisma.bracketPrediction.upsert() stores full tree picks under User account
```

---

## Key Abstractions

### LiveScoreProvider / useLiveScores
A central React Context provider at the root layout that maintains one unified SSE (or fallback polling) stream. Prevents multiple open connections by exposing a shared scoring hook.

### Knockout Stage Resolver (`lib/knockout-resolver.ts`)
Tracks match dependencies and advances winning teams to subsequent brackets:
- Map-based progression tracks which match numbers supply home/away teams for matches 89 to 104.
- `autoResolveKnockouts()` is invoked during live score synchronizations, automating knockout seeding when group games wrap up.

### Prediction Grader (`lib/gradePredictions.ts`)
Calculates earned score sheets once matches are finished:
- Rewards 3 points for exact score match.
- Rewards 1 point for correct match outcome (win/lose/draw).
- Automatically updates User aggregate points cache for leaderboard rendering.

### Rate Limiter (`lib/rate-limit.ts`)
Protects prediction endpoints and submission forms with an in-memory client IP rate limiter (e.g., limits bracket saves to 10/min and match picks to 20/min).

### Stream Aggregator (`lib/streamed-api.ts`)
Orchestrates live video queries:
- Normalizes spelling variations across external titles and internal team names.
- Filters target events within 4-hour kickoff offsets.
- Pulls streaming embed payloads in parallel.
