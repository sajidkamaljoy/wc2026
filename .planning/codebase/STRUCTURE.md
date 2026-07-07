# Project Structure

> Mapped: 2026-05-21 | Updated: 2026-07-07

## Directory Layout

```
wc2026/
├── .env                          # Environment variables (DB URL, API keys)
├── .env.local                    # Local overrides (gitignored)
├── .gitignore                    # Standard Next.js ignores + .env*
├── AGENTS.md                     # Agent instructions
├── CLAUDE.md                     # Claude instructions
├── README.md                     # Project readme
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript config (strict, path aliases)
├── next.config.ts                # Next.js configuration (empty/default)
├── next-env.d.ts                 # Next.js TypeScript declarations
├── postcss.config.mjs            # PostCSS with Tailwind v4
├── eslint.config.mjs             # Flat ESLint config
├── prisma.config.ts              # Prisma config with seed command
├── vitest.config.ts              # Vitest testing environment configuration
├── package-lock.json             # Locked npm dependencies
│
├── prisma/                       # Database layer
│   ├── schema.prisma             # Data model (8 models, 4 enums)
│   ├── seed.ts                   # Full tournament seeder (groups, teams, venues, matches, players)
│   ├── squadsData.ts             # Raw squad data for confirmed/preliminary teams
│   └── migrations/               # Prisma migration history
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Inter font, NavBar, BottomNav, LiveScoreProvider)
│   ├── page.tsx                  # Home → redirect to /fixtures
│   ├── globals.css               # Tailwind import, CSS vars, fade-in animation
│   ├── icon.svg                  # Custom gold/amber soccer trophy SVG favicon
│   ├── sitemap.ts                # Dynamic sitemap.xml generator (crawls teams + static)
│   ├── robots.ts                 # Dynamic robots.txt crawler boundaries
│   ├── error.tsx                 # Route segment level error boundary fallback
│   ├── not-found.tsx             # 404 page
│   │
│   ├── fixtures/                 # Fixtures page
│   │   ├── page.tsx              # Server shell with <NewsFeed /> RSC + <FixtureList /> client
│   │   └── loading.tsx           # Streaming loading skeleton
│   │
│   ├── groups/                   # Group standings page
│   │   ├── page.tsx              # Async server component with direct Prisma query
│   │   └── loading.tsx           # Streaming loading skeleton
│   │
│   ├── teams/                    # Team detail pages
│   │   ├── loading.tsx           # Streaming loading skeleton
│   │   └── [teamId]/
│   │       └── page.tsx          # PathwayBracket + TeamForm + FanMood + SquadView
│   │
│   ├── bracket/                  # Knockout bracket page
│   │   └── page.tsx              # Server component → FullBracketTree
│   │
│   ├── pickem/                   # Match & Bracket prediction pick'em page
│   │   ├── page.tsx              # Interactive prediction page
│   │   └── error.tsx             # Error fallback UI for pick'em page
│   │
│   ├── watch/                    # Live streams page
│   │   ├── page.tsx              # Streaming hubs, live streams, and iframe embeds
│   │   └── error.tsx             # Error boundary for streaming hubs
│   │
│   └── api/                      # API route handlers
│       ├── fixtures/
│       │   └── route.ts          # GET /api/fixtures — cached match list with filters
│       ├── groups/
│       │   └── route.ts          # GET /api/groups — cached group standings
│       ├── h2h/
│       │   └── route.ts          # GET /api/h2h — CSV-based head-to-head records
│       ├── leaderboard/
│       │   └── route.ts          # GET /api/leaderboard — fan points standings
│       ├── predict/
│       │   └── bracket/
│       │       └── route.ts      # GET/POST /api/predict/bracket — save bracket prediction
│       ├── predictions/
│       │   └── route.ts          # GET/POST /api/predictions — save individual match score picks
│       ├── scores/
│       │   ├── route.ts          # GET /api/scores — cached live scores
│       │   └── stream/
│       │       └── route.ts      # GET /api/scores/stream — SSE live score stream
│       ├── teams/
│       │   ├── route.ts          # GET /api/teams — all team names
│       │   └── [teamId]/
│       │       ├── route.ts      # GET /api/teams/:id — team details
│       │       ├── pathway/      # GET /api/teams/:id/pathway
│       │       ├── squad/        # GET /api/teams/:id/squad
│       │       ├── form/         # GET /api/teams/:id/form — last 5 real matches
│       │       └── sentiment/    # GET /api/teams/:id/sentiment — fan mood score
│       └── watch/
│           ├── live/
│           │   └── route.ts      # GET /api/watch/live — returns streamed matches
│           └── streams/
│               └── route.ts      # GET /api/watch/streams?matchId=... — returns embed links
│
├── components/                   # React components
│   ├── NavBar.tsx                # Desktop and sticky top-level navigation
│   ├── BottomNav.tsx             # Responsive bottom navigation bar for mobile viewports
│   ├── PageWrapper.tsx           # Fade-in page transition via pathname key
│   ├── TimezoneBanner.tsx        # User timezone display banner
│   ├── Footer.tsx                # Global responsive theme-aware footer
│   ├── ErrorState.tsx            # Standard UI error reporting layout
│   │
│   ├── fixtures/                 # Fixture-related components
│   │   ├── FixtureList.tsx       # Master fixture list with filtering, tabs, and grouping
│   │   ├── FixtureCard.tsx       # Match card with live score and prediction options
│   │   ├── FixtureFilters.tsx    # Stage/team/favorites filter toolbar
│   │   ├── FixturesTabsContainer.tsx # tab container for dates/groups/stages
│   │   ├── KickoffTime.tsx       # Local time display (hydration-safe)
│   │   ├── Countdown.tsx         # Live countdown timer to kickoff
│   │   ├── HeadToHead.tsx        # Comparative H2H drawer panel
│   │   ├── PredictionInput.tsx   # Scoring input slots on match fixtures
│   │   └── PredictionModal.tsx   # Modal frame wrapping score pick submissions
│   │
│   ├── groups/                   # Group standings components
│   │   ├── GroupGridServer.tsx   # Server data receiver that renders GroupTable grid
│   │   ├── GroupTable.tsx        # Single group standings grid table
│   │   └── TeamRow.tsx           # Team standings row with favorites toggler
│   │
│   ├── live/                     # Live score infrastructure
│   │   ├── LiveScoreProvider.tsx # Root-level SSE/polling context provider
│   │   ├── useLiveScores.ts     # Hook to consume LiveScoreContext
│   │   └── LiveScoreBadge.tsx   # Status badge (LIVE, HT, FT)
│   │
│   ├── pathway/                  # Tournament pathway
│   │   └── PathwayBracket.tsx    # Visual knockout pathway timeline
│   │
│   ├── search/                   # Search functionality
│   │   └── SearchModal.tsx       # Spotlight search (Ctrl+K)
│   │
│   ├── squad/                    # Team squad
│   │   ├── SquadView.tsx         # Position-grouped squad roster
│   │   └── PlayerCard.tsx        # Individual player card
│   │
│   ├── bracket/                  # Knockout bracket components
│   │   ├── FullBracketTree.tsx   # Stage-by-stage static bracket grid (R32 → Final)
│   │   ├── BracketChallenge.tsx  # Dynamic interactive simulation picking widget
│   │   ├── BracketLeaderboard.tsx# List of leading pick'em players
│   │   ├── BracketMatchCard.tsx  # Drag-n-drop/click selector card for predictions
│   │   ├── BracketProgressBar.tsx# Completion bar for bracket submissions
│   │   └── SharedBracketView.tsx # Immutable shareable pick sheet view
│   │
│   ├── news/                     # News feed
│   │   └── NewsFeed.tsx          # RSC (Server Component) — renders top 3 news articles
│   │
│   ├── team/                     # Team detail widgets
│   │   ├── TeamForm.tsx          # Last 5 real match W/D/L form display
│   │   └── FanMood.tsx           # Sentiment gauge with expandable headline list
│   │
│   └── pickem/                   # Prediction game dashboard widgets
│       └── PredictionHistory.tsx # Displays aggregate status and history of user guesses
│
├── lib/                          # Shared libraries and utilities
│   ├── db.ts                     # Prisma client singleton
│   ├── football-api.ts           # football-data.org API client
│   ├── news-api.ts               # GNews API client with mock fallbacks
│   ├── streamed-api.ts           # streamed.pk live streams parser
│   ├── pathway.ts                # Bracket pathway calculation engine
│   ├── timezone.ts               # Intl-based timezone formatting utilities
│   ├── constants.ts              # BRACKET seeding constant (R32→SF mappings)
│   ├── bracket-prediction.ts     # Rules, algorithms, and models for bracket challenge
│   ├── fallback-data.ts          # Mock backups for offline/unconfigured environments
│   ├── fixtures.ts               # Local fixture utilities
│   ├── gradePredictions.ts       # Grades match picks against real scores
│   ├── knockout-resolver.ts      # Advances teams through bracket rounds as games finish
│   ├── mem-cache.ts              # In-memory shared data caching layer
│   ├── rate-limit.ts             # In-memory API request rate limiter
│   ├── standings.ts              # Team standings computation helpers
│   └── validations.ts            # Zod validation schemas for predictions
│
├── hooks/                        # Custom React hooks
│   └── useFavorites.ts           # LocalStorage-backed team favorites
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All shared interfaces and type aliases
│
├── scripts/                      # Utility scripts
│   ├── test-api.ts               # Verify football-data.org API connectivity
│   ├── verify-db.ts              # Verify database seed integrity
│   ├── update-squad.ts           # Update squad data for teams
│   ├── count-players.ts          # Seeding statistics from DB
│   ├── check-finished-match.ts   # Checks and triggers grading on finished games
│   ├── check-knockouts.ts        # Audits status of knockout slots
│   ├── check-raw.ts              # Dumps raw football-data fixtures
│   ├── fix-knockout-times.ts     # Repairs kickoff timestamps for knockout matches
│   ├── populate-knockouts.ts     # Populates mock knockout configurations
│   ├── populate-r16.ts           # Helper to seed Round of 16 placeholders
│   ├── simulate-load.ts          # Simulates live load activity
│   └── sync-scores.ts            # Pulls live scores and resolves dependencies
│
├── tests/                        # Vitest automated test suite
│   ├── setup.ts                  # LocalStorage, Fetch mocking, and jest-dom matchers setup
│   ├── lib/
│   │   ├── timezone.test.ts      # Tests for localized date/time conversions
│   │   ├── pathway.test.ts       # Tests for seeding and tournament bracket paths
│   │   ├── news-api.test.ts      # Tests for news fetching, deduplication & mocks
│   │   └── gradePredictions.test.ts # Tests for scoring match score guesses
│   ├── hooks/
│   │   └── useFavorites.test.ts  # Tests for favorites array toggles and caching
│   ├── api/
│   │   ├── predictions-route.test.ts # Tests for POST/GET predictions
│   │   └── sentiment-route.test.ts # Tests for fan mood sentiment analysis
│   └── components/
│       ├── Countdown.test.tsx    # Tests for kickoff countdown timer
│       ├── FixtureList.test.tsx  # Tests for sorting/filtering fixtures list
│       └── LiveMatchBanner.test.tsx # Tests for live match banner rendering
│
└── public/                       # Static assets
    ├── fifa-2026-logo.svg
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── og-image.jpg              # OpenGraph/Twitter preview banner (1200x630, 137KB)
    ├── vercel.svg
    └── window.svg
```

## Key Locations

| What | Where |
|------|-------|
| Database schema | `prisma/schema.prisma` |
| All type definitions | `types/index.ts` |
| API routes | `app/api/` |
| Live score stream | `app/api/scores/stream/route.ts` |
| Prediction pages | `app/pickem/`, `app/watch/` |
| Core utilities | `lib/` |
| Verification tests | `tests/` |
| Management scripts | `scripts/` |

## Naming Conventions

- **Component files**: PascalCase (e.g., `BracketChallenge.tsx`, `BottomNav.tsx`)
- **Hook files**: camelCase with `use` prefix (e.g., `useFavorites.ts`)
- **Library files**: kebab-case (e.g., `knockout-resolver.ts`, `grade-predictions.ts` equivalent `gradePredictions.ts`)
- **API route files**: `route.ts` in named directory (e.g., `app/api/h2h/route.ts`)
- **Test files**: Suffix with `.test.ts` or `.test.tsx` in matching subfolders of `tests/`
- **DB model fields**: camelCase (e.g., `pointsEarned`, `submittedAt`)
- **DB model names**: PascalCase (e.g., `BracketPrediction`, `Prediction`, `User`)
- **Enum values**: UPPER_SNAKE_CASE (e.g., `ROUND_OF_16`, `FINISHED`)
