# Testing

> Mapped: 2026-05-21 | Updated: 2026-07-07

The project runs an automated testing framework based on **Vitest** and **React Testing Library** for unit, UI component, and route handler verification, along with console utilities in `scripts/`.

---

## Automated Test Framework

### Stack
- **Vitest** (^3.2.4): ESM-compatible test runner with native path resolution.
- **jsdom** (^27.0.1): Headless DOM emulation.
- **React Testing Library** (^16.3.2): React UI mount and query suite.
- **jest-dom** (^6.9.1): Specialized DOM assertions (`toBeInTheDocument`, etc.).

### Scripts

| Command | Action | Purpose |
|---------|--------|---------|
| `npm run test` | `vitest run` | Runs all 37 tests synchronously and displays execution summaries. |
| `npm run test:watch` | `vitest` | Interactive watch loop for hot-reloading development. |

### Global Setup & Configurations

#### `vitest.config.ts`
Sets up the testing environment, registers global hooks, and maps the `@/*` path alias to root.

#### `tests/setup.ts`
Stubs API fetch calls and the browser's `localStorage` to isolate tests from third-party networks or database connectivity.

---

## Active Unit & Integration Test Suites

The project features **37 automated tests** distributed across **10 test files**:

### 1. `tests/lib/timezone.test.ts`
- **Target**: `lib/timezone.ts`
- **Tests**:
  - `formatKickoff` output date-time combined string formatting.
  - Correct localized date label generation via `getLocalDateLabel`.
  - Date offsets and `isToday` boundary checks.

### 2. `tests/lib/pathway.test.ts`
- **Target**: `lib/pathway.ts`
- **Tests**:
  - Mocking the Prisma Client singleton to bypass database requests.
  - Verifying group placement mapping (1st, 2nd, etc.) routes teams along the correct knockout pathways.
  - Ensuring boundary or invalid placements return TBD placeholders.

### 3. `tests/lib/news-api.test.ts`
- **Target**: `lib/news-api.ts`
- **Tests**:
  - Verifying fallback mocks when `NEWS_API_KEY` is missing.
  - Ensuring headline de-duplication works by ignoring spaces and lowercasing titles.
  - Asserts clean error capture when fetch requests throw network exceptions.

### 4. `tests/lib/gradePredictions.test.ts` (NEW)
- **Target**: `lib/gradePredictions.ts`
- **Tests**:
  - Checks scoring mechanics: +3 points for exact score match, +1 point for correct outcome (win/lose/draw).
  - Asserts correct grading for knockout matches decided in extra time or penalty shootout scenarios.
  - Verifies database aggregation recalculates and saves user cached points after grading.

### 5. `tests/hooks/useFavorites.test.ts`
- **Target**: `hooks/useFavorites.ts`
- **Tests**:
  - Hook mounts with blank array if storage is clear.
  - `toggleFavorite` pushes new IDs, removes existing ones, and updates `localStorage`.

### 6. `tests/api/predictions-route.test.ts` (NEW)
- **Target**: `app/api/predictions/route.ts`
- **Tests**:
  - POST requests successfully save score picks and create user device accounts.
  - GET requests correctly load the prediction history array for a user.
  - Asserts that predictions for already started matches are rejected with `403 Forbidden`.

### 7. `tests/api/sentiment-route.test.ts`
- **Target**: `app/api/teams/[teamId]/sentiment/route.ts`
- **Tests**:
  - Checks mood scoring translates average sentiment score into categories (`"Neutral"`, `"Very Positive"`).
  - Verifies 404 responses for invalid teams.
  - Asserts 500 error resilience during database crashes.

### 8. `tests/components/Countdown.test.tsx`
- **Target**: `components/fixtures/Countdown.tsx`
- **Tests**:
  - Uses Vitest Fake Timers (`vi.useFakeTimers()`) to tick time down.
  - Asserts formatted output (`5d 3h 0m 0s`).
  - Asserts amber highlight animations when under 24 hours to kickoff.

### 9. `tests/components/FixtureList.test.tsx` (NEW)
- **Target**: `components/fixtures/FixtureList.tsx`
- **Tests**:
  - Renders master list of matches.
  - Verifies sorting and filtering actions on date, stage, and favorites selections.

### 10. `tests/components/LiveMatchBanner.test.tsx` (NEW)
- **Target**: `components/fixtures/LiveMatchBanner.tsx` (implied under live score widgets)
- **Tests**:
  - Asserts live match status indicators show current game scores.
  - Verifies links to the streaming hubs navigate to the stream page correctly.

---

## Manual Verification Scripts

Automated tests are complemented by the console scripts inside `/scripts`:
- `test-api.ts`: Tests basic connectivity to football-data.org.
- `verify-db.ts`: Audits seeder counts (12 groups, 48 teams, 16 venues, 104 matches).
- `count-players.ts`: Prints metrics on seeded rosters.
- `sync-scores.ts`: Pulls live results and advances tournament state.
- `populate-knockouts.ts` & `populate-r16.ts`: Generates dummy matches for bracket testing.
- `simulate-load.ts`: Heavy load simulation script.
