# External Integrations

> Mapped: 2026-05-21

## Database — PostgreSQL (Neon)

| Property | Value |
|----------|-------|
| Provider | PostgreSQL via Neon (serverless) |
| ORM | Prisma Client `@prisma/client` ^6.19.3 |
| Connection | `DATABASE_URL` env variable, SSL required |
| Region | `us-east-1` (AWS) |
| Client Singleton | `lib/db.ts` — global singleton pattern to prevent connection exhaustion in dev |
| Logging | Query + error in development, error-only in production |
| Migrations | `prisma/migrations/` — 2 migrations (`init`, `add_players`) |

### Schema Models

| Model | Primary Key | Records | Purpose |
|-------|------------|---------|---------|
| `Group` | String ("A"–"L") | 12 | Tournament groups |
| `Team` | String (FIFA 3-letter code) | 48 | National teams with standings |
| `Venue` | String (slug) | 16 | Stadium locations across 3 countries |
| `Match` | CUID (auto) | 104 | All tournament fixtures (group + knockout) |
| `Player` | CUID (auto) | 48×26 = 1248 | Squad rosters per team |

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

## CDN — Flag Images

| Property | Value |
|----------|-------|
| Source | `https://flagcdn.com/w40/{code}.png` |
| Usage | Team `flagUrl` field in database |
| Loading | `<img>` tags with `loading="lazy"` |
| Examples | `mx.png`, `gb-eng.png`, `gb-sct.png` |

---

## Real-Time Data Delivery

### SSE (Server-Sent Events) — Primary

| Property | Value |
|----------|-------|
| Endpoint | `GET /api/scores/stream` |
| Runtime | Node.js (`export const runtime = "nodejs"`) |
| Polling Interval | 30 seconds (server-side poller) |
| Broadcast | Module-level `listeners` Set; only broadcasts on data change |
| Headers | `Content-Type: text/event-stream`, `X-Accel-Buffering: no` |

### Polling — Fallback

| Property | Value |
|----------|-------|
| Endpoint | `GET /api/scores` |
| Interval | 30 seconds (client-side) |
| Trigger | Falls back when SSE `EventSource` errors or is unavailable |

### Client Provider

`LiveScoreProvider` (wraps entire app at root layout level):
1. Attempts SSE connection to `/api/scores/stream`
2. On SSE error → closes EventSource, starts 30s polling to `/api/scores`
3. Applies scores via immutable state update with change detection
4. Exposes `LiveScoreContext` consumed by `useLiveScores()` hook

---

## Client-Side Storage

| Property | Value |
|----------|-------|
| Storage | `localStorage` |
| Key | `wc2026_favorites` |
| Format | JSON array of team ID strings (e.g., `["ARG", "ENG"]`) |
| Hook | `hooks/useFavorites.ts` |
| Usage | Favorites filtering on fixtures page, star indicators on team rows |

---

## Caching Strategy

| Layer | Mechanism | TTL |
|-------|-----------|-----|
| Fixtures API | `unstable_cache` + `Cache-Control: s-maxage=30, stale-while-revalidate=300` | 30s server, 5min stale |
| Groups API | `unstable_cache` | 60s |
| Scores API | `unstable_cache` | 30s |
| Teams List | `unstable_cache` | 1 hour |
| Groups Page (SSR) | `unstable_cache` with tags `["groups"]` | 60s |
| ID Map (in-memory) | Manual TTL check | 10 minutes |
