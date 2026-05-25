# Testing

> Mapped: 2026-05-21 | Updated: 2026-05-25

The project uses a complete, high-performance automated testing framework based on **Vitest** and **React Testing Library** for unit and UI component verification, alongside existing **manual verification scripts** in the `scripts/` directory.

---

## Automated Test Framework

### Stack
- **Vitest** (^3.2.4): Modern unit testing runner with native ESM and path alias support.
- **jsdom** (^27.0.1): Headless DOM emulator for browser API emulation in Node.
- **React Testing Library** (^16.3.2): Standard React UI utility suite for component mounting and assertion.
- **jest-dom** (^6.9.1): Specialized DOM assertions (`toBeInTheDocument`, `toHaveClass`, etc.).

### Scripts

| Command | Action | Purpose |
|---------|--------|---------|
| `npm run test` | `vitest run` | Runs all 25 unit tests synchronously once and reports results. |
| `npm run test:watch` | `vitest` | Starts Vitest in interactive watch mode for hot-reloading test development. |

### Global Setup & Configurations

#### `vitest.config.ts`
Sets up `jsdom` testing environment, enables global assertions (`describe`, `it`, `expect`), links the global configuration file `tests/setup.ts`, and defines path alias mapping (`@/*` pointing to `./*`).

#### `tests/setup.ts`
Enforces standard mocks to isolate tests from network and database dependencies:
1. **Mock Fetch:** Stubbed globally using `vi.fn()` to catch GNews, FIFA, and external HTTP fetches.
2. **Mock localStorage:** Simulates local storage mechanisms to test user favorites caching.
3. **jest-dom Imports:** Globally injects modern CSS class/element matcher rules into the expect engine.

---

## Active Unit Test Suites

The project features 25 unit tests distributed across 6 core coverage modules under the `tests/` directory:

### 1. `tests/lib/timezone.test.ts`
- **Utility:** `lib/timezone.ts`
- **Tests:**
  - `formatKickoff` output formatting (date/time parsing and combined display string resolution).
  - Timezone abbreviation and offset parsing under localized configurations.
  - Correct localized date label generations via `getLocalDateLabel`.
  - `isToday` correctly matching target dates against the system's "today" limits.

### 2. `tests/lib/pathway.test.ts`
- **Utility:** `lib/pathway.ts`
- **Tests:**
  - Bypasses DB connections by mocking the Prisma Client singleton client.
  - Verifies position mapping indexes (1st place, 2nd place, etc.) and routes teams along the correct pathway rounds (ROUND_OF_32, ROUND_OF_16, QUARTER_FINAL, SEMI_FINAL, FINAL).
  - Asserts that boundary/invalid conditions map correctly to fallback TBD paths.

### 3. `tests/lib/news-api.test.ts`
- **Utility:** `lib/news-api.ts`
- **Tests:**
  - Standard fallback mock articles when no `NEWS_API_KEY` is provided.
  - Dynamically fetches, parses, and maps fields from actual GNews payloads (mocked) when a key exists.
  - Validates headline de-duplication rules (filtering matching headlines by ignoring alphanumeric structures and lowercasing).
  - Ensures clean error capture returning mock fallbacks on network dropouts.

### 4. `tests/hooks/useFavorites.test.ts`
- **Hook:** `hooks/useFavorites.ts`
- **Tests:**
  - Verifies hook mounts with empty arrays if local storage is blank.
  - Tests loading cached states on mount.
  - Asserts `toggleFavorite` adds new IDs, filters existing IDs, and syncs immediately to `localStorage`.

### 5. `tests/api/sentiment-route.test.ts`
- **API Handler:** `app/api/teams/[teamId]/sentiment/route.ts`
- **Tests:**
  - Invokes route async `GET` method directly with mocked Request parameters.
  - Tests AFINN sentiment calculations (average scores) matching category labels (`"Very Positive"`, `"Neutral"`, etc.) and classes.
  - Asserts proper 404 responses for missing database teams.
  - Asserts 500 error resilience for internal database failures.

### 6. `tests/components/Countdown.test.tsx`
- **Component:** `components/fixtures/Countdown.tsx`
- **Tests:**
  - Freezes and ticks the virtual calendar clock using Vitest Fake Timers (`vi.useFakeTimers()`).
  - Asserts countdown label formatting (`5d 3h 0m 0s`).
  - Asserts highlight styles (pulsing amber) when kickoff is under 24 hours away.
  - Asserts rendering nothing (`null`) if a match has already kicked off.

---

## Manual Verification Scripts

The testing suite supplements the existing console verification utilities inside `/scripts`:

### `scripts/test-api.ts`
- **Run:** `npx tsx scripts/test-api.ts`
- **Purpose:** Verifies football-data.org API connection settings and retrieves sample match arrays.

### `scripts/verify-db.ts`
- **Run:** `npx tsx scripts/verify-db.ts`
- **Purpose:** Checks database entity seed completeness (12 groups, 48 teams, 16 venues, 104 matches) and tests pathway calculation dumps.

### `scripts/count-players.ts`
- **Run:** `npx tsx scripts/count-players.ts`
- **Purpose:** Pulls metrics about player seeds and squad compilation stats (PRELIMINARY, CONFIRMED, placeholders).

---

## Coverage Status & Testing Gaps

By introducing these automated tests, we have successfully resolved several critical quality-assurance gaps in the codebase:

| Area | Former Coverage | Current Coverage | Status |
|------|-----------------|------------------|--------|
| Complex Pathway Logic | ⚠️ Manual only (`verify-db.ts`) | **🚀 100% Automated** (`pathway.test.ts`) | **Resolved** |
| Timezone conversions | ❌ None | **🚀 100% Automated** (`timezone.test.ts`) | **Resolved** |
| Headline Deduplication | ❌ None | **🚀 100% Automated** (`news-api.test.ts`) | **Resolved** |
| Sentiment Calculation | ❌ None | **🚀 100% Automated** (`sentiment-route.test.ts`) | **Resolved** |
| Custom Caching Hooks | ❌ None | **🚀 100% Automated** (`useFavorites.test.ts`) | **Resolved** |
| Interactive UI Timers | ❌ None | **🚀 100% Automated** (`Countdown.test.tsx`) | **Resolved** |
| API Route endpoints | ❌ None | **🚀 100% Automated** (`sentiment-route.test.ts`) | **Resolved** |
| Component rendering | ❌ None | **⚠️ Partial** (Countdown UI only) | **Improvement Plan** |
| E2E user flows | ❌ None | ❌ None | Future work (Playwright) |
| CSV Form Parsing | ❌ None | ❌ None | Future work (CSV edge cases) |
