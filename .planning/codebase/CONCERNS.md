# Concerns & Technical Debt

> Mapped: 2026-05-21 | Updated: 2026-07-07

## 🔴 High Priority

### 1. Secrets Committed in `.env`

**File:** `.env`

The `.env` file contains real credentials committed to the repository:
- PostgreSQL connection string with username/password for Neon database
- football-data.org API key

Although `.env*` is in `.gitignore`, the `.env` file itself is present in the working tree and could be committed if `.gitignore` rules are bypassed. The actual credentials should be rotated if they were ever pushed to a remote.

**Impact:** Security risk — credential exposure if repo becomes public or is shared.

**Recommendation:**
- Rotate all credentials immediately if repo history contains them
- Use `.env.example` with placeholder values for documentation
- Verify `.gitignore` properly excludes `.env` files in all git operations

---

## 🟡 Medium Priority

### 2. Unused Dependency: `date-fns-tz`

**File:** `package.json`

- `date-fns-tz` (^3.2.0) is declared as a production dependency but the codebase uses the native `Intl` API in `lib/timezone.ts` instead. No import of `date-fns-tz` was found in any application file.
- **Note**: `zod` and `date-fns` were previously flagged as unused but are now actively used in the predictions validation (`lib/validations.ts`) and widgets.

**Impact:** Bundle bloat, misleading dependency list.

**Recommendation:** Remove `date-fns-tz` from `package.json` if not planned for imminent use.

---

### 3. Orphaned Client Component: `GroupGrid.tsx`

**File:** `components/groups/GroupGrid.tsx`

The client-side `GroupGrid` component fetches group data via `/api/groups` and renders it. However, the groups page (`app/groups/page.tsx`) uses `GroupGridServer` which receives server-fetched data as props instead. `GroupGrid.tsx` appears to be the original implementation that was replaced but not deleted.

**Impact:** Dead code, potential confusion.

**Recommendation:** Delete `components/groups/GroupGrid.tsx` if confirmed unused.

---

### 4. SSE Stream Cleanup Behavior

**File:** `app/api/scores/stream/route.ts`

The SSE poller (`pollInterval`) is module-level and never cleaned up. Once `ensurePoller()` is called, the 30-second interval runs indefinitely for the lifetime of the Node.js process, even if zero clients are connected.

```typescript
let pollInterval: ReturnType<typeof setInterval> | null = null;

function ensurePoller() {
  if (pollInterval) return;  // Never stops once started
  pollInterval = setInterval(poll, 30_000);
}
```

**Impact:** Unnecessary API calls to football-data.org when no clients are connected, potentially hitting rate limits.

**Recommendation:** Track `listeners.size` and clear the interval when it reaches zero. Restart when a new client connects.

---

### 5. In-Memory State in SSE Module

**File:** `app/api/scores/stream/route.ts`

Module-level state (`latestScores`, `listeners`, `pollInterval`) persists across requests but will be lost on serverless cold starts (Vercel edge), multi-instance deployments, or hot module reloads in development. The current setup assumes a single long-lived Node.js process.

**Impact:** SSE may not work correctly in serverless/edge deployments. Not an issue for local dev or single-instance hosting.

**Recommendation:** Document deployment requirements (single Node.js process preferred). If deploying to serverless, consider external pub/sub (Redis, etc.) or switch to pure polling.

---

### 6. `unstable_cache` API Usage

**Files:** `app/api/fixtures/route.ts`, `app/api/groups/route.ts`, `app/api/scores/route.ts`, `app/groups/page.tsx`

The `unstable_cache` import from `next/cache` is used extensively. This API may change or be removed in future Next.js versions.

**Impact:** Potential breaking changes on Next.js upgrades.

**Recommendation:** Monitor Next.js release notes for `unstable_cache` stabilization. Consider wrapping in a utility function for easy migration.

---

### 7. Team Form — Brittle Name Matching

**File:** `app/api/teams/[teamId]/form/route.ts`

The form feature fetches the martj42 CSV and matches rows by comparing `homeTeam === teamName` against our database's `Team.name` field. If the CSV uses a different spelling (e.g., "United States" vs "USA" vs "United States of America"), no matches will be found and the form will silently return `[]`.

**Impact:** Medium — some teams may have zero form entries even if they have recent match history.

**Recommendation:**
- Add a name alias mapping (`lib/teamNameAliases.ts`) between the CSV naming convention and our DB names
- Consider adding a `verify-form.ts` script to audit name matches for all 48 teams

---

## 🟢 Low Priority

### 8. Search Modal Links to Home Team Only

**File:** `components/search/SearchModal.tsx`

When a search result is clicked, it navigates to `/teams/${m.homeTeam.id}`. If the user searched for the away team, the link still goes to the home team's page. If there's no home team (knockout placeholder), it falls back to `/fixtures`.

```tsx
href={m.homeTeam?.id ? `/teams/${m.homeTeam.id}` : `/fixtures`}
```

**Impact:** Minor UX issue — clicking a search result for "Argentina" when they're the away team navigates to the wrong team page.

**Recommendation:** Consider highlighting the matched team and linking to their page instead.

---

### 9. No Rate Limiting on Standard API Routes

**Files:** All `app/api/*/route.ts` (except predictions, watch streams, and bracket endpoints)

API routes have no rate limiting, authentication, or abuse protection. While acceptable for a personal/fan project, this could be exploited if publicly deployed.

**Impact:** Low for personal use; medium for public deployment.

**Recommendation:** Extend `rate-limit.ts` check across all database queries and external fetch routes.

---

### 10. Hardcoded Locale Strings

**Files:** `lib/timezone.ts`, `components/search/SearchModal.tsx`

Date formatting uses hardcoded locale `"en-GB"` and `"en-US"`.

**Impact:** Non-English users see English date formats regardless of browser locale.

**Recommendation:** Use `undefined` as the locale to respect the user's browser settings, or make locale configurable.

---

### 11. Large Seed File

**File:** `prisma/seed.ts` (407 lines) + `prisma/squadsData.ts` (13,471 bytes)

The seed file contains inline data for all 12 groups, 48 teams, 16 venues, 104 matches, and knockout bracket mappings. Combined with `squadsData.ts`, this is a substantial amount of hardcoded data.

**Impact:** Maintenance burden when fixture details change. No single source of truth if data also exists in the external API.

**Recommendation:** Consider loading fixture data from a JSON file or fetching from the football-data.org API during seeding.

---

### 12. FullBracketTree Uses `any` Typing

**File:** `components/bracket/FullBracketTree.tsx`

The `Props` interface and internal `MatchCard` component use `any` for the `matches` array and `match` object.

**Impact:** Loss of TypeScript type safety in the bracket component.

**Recommendation:** Define a proper `BracketMatch` interface (similar to `MatchWithTeams` in `types/index.ts`) and apply it to both the array and card props.

---

### 13. `NEWS_API_KEY` Not Documented in `.env.example`

The new `NEWS_API_KEY` environment variable required by `lib/news-api.ts` is not documented anywhere (no `.env.example` exists in the project).

**Impact:** New contributors or deployments won't know this key is available and will silently get mock data.

**Recommendation:** Create a `.env.example` file listing all required env vars: `DATABASE_URL`, `FOOTBALL_DATA_API_KEY`, `FOOTBALL_DATA_BASE_URL`, `FOOTBALL_DATA_COMPETITION_ID`, `NEWS_API_KEY`.

---

## 🟢 Resolved Concerns

- **No Automated Tests (Resolved 2026-07-07)**: Integrated a comprehensive Vitest automated unit and UI component verification suite featuring 37 tests across 10 modules covering timezone conversions, bracket pathway algorithms, prediction grading mechanics, API endpoints, favorites hooks, and interactive timers.
- **Missing Error Boundaries (Resolved 2026-07-07)**: Implemented route segment boundaries utilizing Next.js `error.tsx` templates rendering a reusable `<ErrorState />` layout segment.
- **No Favicon or Open Graph Images (Resolved 2026-05-24)**: Configured root layout SEO metadata containing base URLs, site maps, robots rules, and open graph image assets.
