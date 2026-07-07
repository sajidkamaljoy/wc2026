# External Integrations

> Mapped: 2026-05-21 | Updated: 2026-07-07

## Database — PostgreSQL (Neon)

| Property | Value |
|----------|-------|
| Provider | PostgreSQL via Neon (serverless) |
| ORM | Prisma Client `@prisma/client` ^6.19.3 |
| Connection | `DATABASE_URL` env variable, SSL required |
| Region | `us-east-1` (AWS) |
| Client Singleton | `lib/db.ts` — global singleton pattern to prevent connection exhaustion in dev |
| Logging | Query + error in development, error-only in production |
| Migrations | `prisma/migrations/` — migrations history (`init`, `add_players`, plus model expansions) |

### Schema Models

| Model | Primary Key | Relations | Purpose |
|-------|------------|-----------|---------|
| `Group` | String ("A"–"L") | `Team[]` | Tournament groups |
| `Team` | String (FIFA 3-letter code) | `Group`, `Match[]`, `Player[]` | National teams with standings and rosters |
| `Venue` | String (slug) | `Match[]` | Stadium locations across USA, Mexico, and Canada |
| `Match` | CUID (auto) | `Team` (home/away), `Venue`, `Prediction[]` | All tournament fixtures (group + knockout) |
| `Player` | CUID (auto) | `Team` | Squad rosters (up to 26 players per team) |
| `User` | UUID (auto) | `Prediction[]`, `BracketPrediction?` | App users identified by unique `deviceId` cookies |
| `Prediction` | CUID (auto) | `User`, `Match` | Individual match score predictions |
| `BracketPrediction` | CUID (auto) | `User` | Full tournament group + knockout bracket challenge pick sheet |

### Enums

- `Stage`: GROUP, ROUND_OF_32, ROUND_OF_16, QUARTER_FINAL, SEMI_FINAL, THIRD_PLACE, FINAL
- `MatchStatus`: SCHEDULED, LIVE, HALF_TIME, FINISHED, POSTPONED, CANCELLED
- `Position`: GK, DEF, MID, FWD
- `SquadStatus`: CONFIRMED, PRELIMINARY, TBD

---

## External API — football-data.org

| Property | Value |
|----------|-------|
| Base URL | `https://api.football-data.org/v4` (env: `FOOTBALL_DATA_BASE_URL`) |
| Auth | API key via `X-Auth-Token` header (env: `FOOTBALL_DATA_API_KEY`) |
| Competition | ID `2000` — FIFA World Cup (env: `FOOTBALL_DATA_COMPETITION_ID`) |
| Client | `lib/football-api.ts` |
| Rate Limit | Free tier limits apply |

### Endpoints Used

| Function | Endpoint | Purpose |
|----------|----------|---------| 
| `getLiveScores()` | `GET /competitions/{id}/matches?status=IN_PLAY,PAUSED,FINISHED` | Fetch live/recent match scores |

### ID Mapping Strategy

The football-data.org API returns its own match IDs (`externalId`). The app maintains an in-memory cache (`idMap`) that maps external IDs → internal Prisma match IDs.

- **TTL**: 10 minutes (`ID_MAP_TTL_MS`)
- **Source**: `prisma.match.findMany()` filtering on non-null `externalId`
- **Exposed via**: `getLiveScoresMapped()` which translates external IDs to internal IDs

### Graceful Degradation

- If no API key is configured, `fdFetch()` returns `{ matches: [] }` — no crash
- If API call fails, `getLiveScores()` catches errors and returns `[]`
- All errors are logged to console

---

## External API — GNews.io

| Property | Value |
|----------|-------|
| Base URL | `https://gnews.io/api/v4/search` |
| Auth | API key via `?apikey=` query param (env: `NEWS_API_KEY`) |
| Client | `lib/news-api.ts` |
| Revalidation | 1 hour (`next: { revalidate: 3600 }`) |
| Fallback | Returns mock articles if `NEWS_API_KEY` is unset — app never crashes |

### Functions

| Function | Purpose |
|----------|---------|
| `getWorldCupNews()` | Fetches 3 top World Cup 2026 news articles for the Fixtures page |
| `getTeamNews(teamName)` | Fetches up to 10 team-specific articles, de-duplicated by normalized title |

---

## External API & Streams — streamed.pk (NEW)

| Property | Value |
|----------|-------|
| Base URL | `https://streamed.pk/api` |
| Client | `lib/streamed-api.ts` |
| Revalidation | 30 seconds (`next: { revalidate: 30 }`) |
| Purpose | Feeds live video streaming links directly to matches |

### Endpoints Used

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `getLiveStreamsForMatch()` | `GET /matches/football` & `GET /stream/{source}/{id}` | Resolves current stream sources for a given match |
| `getLiveMatchesFromStreamed()` | `GET /matches/live` | Retrieves matches currently being streamed live |
| `getStreamsForStreamedMatchId()` | `GET /matches/all` & `GET /stream/{source}/{id}` | Resolves streams by specific stream ID |

### Synonyms & Time Window Matcher

- **Team Name Synonyms**: Resolves spelling variations between our database names and streamed.pk payload titles (e.g., handles `"United States"`, `"United States of America"`, `"USA"`, `"South Korea"`, `"Korea Republic"`).
- **Time Offset Safety**: Matches are aligned to database fixtures within a **±4-hour window** of kickoff to avoid matching different historical or league games between the same national teams.

---

## External Data Source — martj42/international_results CSV

| Property | Value |
|----------|-------|
| Source | `https://raw.githubusercontent.com/martj42/international_results/master/results.csv` |
| Client | `app/api/teams/[teamId]/form/route.ts` & `app/api/h2h/route.ts` |
| Revalidation | 1 hour (`next: { revalidate: 3600 }`) |
| Purpose | Provides last 5 real match results for a team's "Recent Form" widget and parses head-to-head match histories |

---

## CDN — Flag Images

| Property | Value |
|----------|-------|
| Source | `https://flagcdn.com/w40/{code}.png` |
| Usage | Team `flagUrl` field in database |
| Loading | `<img>` tags with `loading="lazy"` |

---

## Real-Time Data Delivery

### SSE (Server-Sent Events) — Primary

- **Endpoint**: `GET /api/scores/stream`
- **Runtime**: Node.js (`export const runtime = "nodejs"`)
- **Polling Interval**: 30 seconds (server-side poller)
- **Broadcast**: Module-level `listeners` Set; only broadcasts on data change
- **Headers**: `Content-Type: text/event-stream`, `X-Accel-Buffering: no`

### Polling — Fallback

- **Endpoint**: `GET /api/scores`
- **Interval**: 30 seconds (client-side)
- **Trigger**: Falls back when SSE `EventSource` errors or is unavailable

### Client Provider

`LiveScoreProvider` (wraps entire app at root layout level):
1. Attempts SSE connection to `/api/scores/stream`
2. On SSE error → closes EventSource, starts 30s polling to `/api/scores`
3. Applies scores via state update with change detection
4. Exposes `LiveScoreContext` consumed by `useLiveScores()` hook

---

## Client-Side Storage

- **Storage**: `localStorage`
- **Key**: `wc2026_favorites`
- **Format**: JSON array of team ID strings (e.g., `["ARG", "ENG"]`)
- **Hook**: `hooks/useFavorites.ts`

---

## Caching Strategy

| Layer | Mechanism | TTL |
|-------|-----------|-----|
| Fixtures API | `unstable_cache` + `Cache-Control: s-maxage=30` | 30s |
| Groups API | `unstable_cache` | 60s |
| Scores API | `unstable_cache` | 30s |
| Teams List | `unstable_cache` | 1 hour |
| Groups Page (SSR) | `unstable_cache` with tags `["groups"]` | 60s |
| ID Map (in-memory) | Manual TTL check | 10 minutes |
| CSV Mappings (in-memory) | `lib/mem-cache.ts` | 1 hour |
| GNews Fetch | Next.js `fetch` revalidate | 1 hour |
| streamed.pk Fetch | Next.js `fetch` revalidate | 30 seconds |
