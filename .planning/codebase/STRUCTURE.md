# Project Structure

> Mapped: 2026-05-21 | Updated: 2026-05-22

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
│
├── prisma/                       # Database layer
│   ├── schema.prisma             # Data model (5 models, 4 enums)
│   ├── seed.ts                   # Full tournament seeder (groups, teams, venues, matches, players)
│   ├── squadsData.ts             # Raw squad data for confirmed/preliminary teams
│   └── migrations/               # Prisma migration history
│       ├── 20260520084157_init/
│       └── 20260520175741_add_players/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Inter font, NavBar, LiveScoreProvider, PageWrapper, Footer)
│   ├── page.tsx                  # Home → redirect to /fixtures
│   ├── globals.css               # Tailwind import, CSS vars, fade-in animation
│   ├── favicon.ico               # App icon
│   ├── sitemap.ts                # [NEW] Dynamic sitemap.xml generator (crawls teams + static)
│   ├── robots.ts                 # [NEW] Dynamic robots.txt crawler boundaries
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
│   ├── bracket/                  # [NEW] Knockout bracket page
│   │   └── page.tsx              # Server component → FullBracketTree
│   │
│   └── api/                      # API route handlers
│       ├── fixtures/
│       │   └── route.ts          # GET /api/fixtures — cached match list with filters
│       ├── groups/
│       │   └── route.ts          # GET /api/groups — cached group standings
│       ├── scores/
│       │   ├── route.ts          # GET /api/scores — cached live scores
│       │   └── stream/
│       │       └── route.ts      # GET /api/scores/stream — SSE live score stream
│       └── teams/
│           ├── route.ts          # GET /api/teams — all team names
│           └── [teamId]/
│               ├── route.ts      # GET /api/teams/:id — team details
│               ├── pathway/      # GET /api/teams/:id/pathway
│               ├── squad/        # GET /api/teams/:id/squad
│               ├── form/         # [NEW] GET /api/teams/:id/form — last 5 real matches
│               └── sentiment/    # [NEW] GET /api/teams/:id/sentiment — fan mood score
│
├── components/                   # React components (all client components)
│   ├── NavBar.tsx                # Sticky nav with links, search, live indicator (+ Bracket link)
│   ├── PageWrapper.tsx           # Fade-in page transition via pathname key
│   ├── TimezoneBanner.tsx        # User timezone display banner
│   ├── Footer.tsx                # [NEW] Global responsive theme-aware footer with email contact & copy utility
│   │
│   ├── fixtures/                 # Fixture-related components
│   │   ├── FixtureList.tsx       # Master fixture list with filtering and grouping
│   │   ├── FixtureCard.tsx       # Individual match card with live score overlay
│   │   ├── FixtureFilters.tsx    # Stage/team/favorites filter toolbar
│   │   ├── KickoffTime.tsx       # Local time display (hydration-safe)
│   │   └── Countdown.tsx         # Live countdown timer to kickoff
│   │
│   ├── groups/                   # Group standings components
│   │   ├── GroupGrid.tsx         # Client-side group grid (unused — replaced by server version)
│   │   ├── GroupGridServer.tsx   # Server data receiver that renders GroupTable grid
│   │   ├── GroupTable.tsx        # Single group table with header
│   │   └── TeamRow.tsx           # Team row with favorites, flags, zone highlights
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
│   │   └── SearchModal.tsx       # Spotlight-style search (Ctrl+K)
│   │
│   ├── squad/                    # Team squad
│   │   ├── SquadView.tsx         # Position-grouped squad roster
│   │   └── PlayerCard.tsx        # Individual player card
│   │
│   ├── bracket/                  # [NEW] Full knockout bracket
│   │   └── FullBracketTree.tsx   # Stage-by-stage bracket grid (R32 → Final)
│   │
│   ├── news/                     # [NEW] News feed
│   │   └── NewsFeed.tsx          # RSC (Server Component) — renders top 3 news articles
│   │
│   └── team/                     # [NEW] Team detail widgets
│       ├── TeamForm.tsx           # Last 5 real match W/D/L form display
│       └── FanMood.tsx            # Sentiment gauge with expandable headline list
│
├── lib/                          # Shared libraries and utilities
│   ├── db.ts                     # Prisma client singleton
│   ├── football-api.ts           # football-data.org API client
│   ├── news-api.ts               # [NEW] GNews API client with mock fallbacks
│   ├── pathway.ts                # Bracket pathway calculation engine
│   ├── timezone.ts               # Intl-based timezone formatting utilities
│   └── constants.ts              # BRACKET seeding constant (R32→SF mappings)
│
├── hooks/                        # Custom React hooks
│   └── useFavorites.ts           # LocalStorage-backed team favorites
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All shared interfaces and type aliases
│
├── scripts/                      # Utility scripts
│   ├── test-api.ts               # Verify football-data.org API connectivity
│   ├── verify-db.ts              # Verify database seed integrity + pathway calculation
│   ├── update-squad.ts           # Update squad data for teams
│   └── count-players.ts          # [NEW] Report player/squad seeding statistics from DB
│
└── public/                       # Static assets
    ├── fifa-2026-logo.svg
    ├── file.svg
    ├── globe.svg
    ├── next.svg
    ├── og-image.jpg              # [NEW] Premium optimized OpenGraph/Twitter preview banner (1200x630, 137KB)
    ├── vercel.svg
    └── window.svg
```

## Key Locations

| What | Where |
|------|-------|
| Database schema | `prisma/schema.prisma` |
| All type definitions | `types/index.ts` |
| API routes | `app/api/` |
| Page routes | `app/fixtures/`, `app/groups/`, `app/teams/[teamId]/`, `app/bracket/` |
| Root layout + providers | `app/layout.tsx` |
| Live score infrastructure | `components/live/` |
| Bracket seeding logic | `lib/constants.ts` + `lib/pathway.ts` |
| News & sentiment logic | `lib/news-api.ts` |
| Team detail widgets | `components/team/` |
| Utility scripts | `scripts/` |
| Seed data | `prisma/seed.ts` + `prisma/squadsData.ts` |

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------| 
| Component files | PascalCase | `FixtureCard.tsx`, `NavBar.tsx` |
| Hook files | camelCase with `use` prefix | `useFavorites.ts`, `useLiveScores.ts` |
| Library files | kebab-case | `football-api.ts`, `news-api.ts`, `timezone.ts` |
| API route files | `route.ts` in named directory | `app/api/fixtures/route.ts` |
| Page files | `page.tsx` in named directory | `app/fixtures/page.tsx` |
| Loading skeletons | `loading.tsx` co-located with page | `app/fixtures/loading.tsx` |
| Type files | `index.ts` barrel export | `types/index.ts` |
| Script files | kebab-case | `test-api.ts`, `count-players.ts` |
| CSS variables | `--kebab-case` | `--background`, `--foreground` |
| DB model fields | camelCase | `kickoffUtc`, `homeTeamId`, `goalsFor` |
| DB model names | PascalCase | `Team`, `Match`, `Player` |
| Enum values | UPPER_SNAKE_CASE | `ROUND_OF_32`, `HALF_TIME` |

## Component Organization Pattern

Components are organized by **feature domain**, not by component type:

```
components/
├── fixtures/     # Everything related to match fixtures
├── groups/       # Everything related to group standings
├── live/         # Live score infrastructure (provider, hook, badge)
├── pathway/      # Tournament bracket pathway
├── search/       # Search functionality
├── squad/        # Team squad display
├── bracket/      # [NEW] Full knockout bracket viewer
├── news/         # [NEW] News feed (RSC)
├── team/         # [NEW] Team detail widgets (form, fan mood)
├── NavBar.tsx    # Shared navigation (top-level)
├── PageWrapper.tsx # Shared page wrapper (top-level)
└── TimezoneBanner.tsx # Shared timezone banner (top-level)
```

Shared/cross-cutting components live at the `components/` root level.
