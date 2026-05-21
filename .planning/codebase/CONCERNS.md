# Concerns & Technical Debt

> Mapped: 2026-05-21

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

### 2. No Automated Tests

**Coverage:** Zero automated tests of any kind.

No unit tests, integration tests, component tests, or E2E tests exist. The only verification is manual scripts (`scripts/test-api.ts`, `scripts/verify-db.ts`).

**Impact:** High regression risk, especially for:
- `lib/pathway.ts` — complex bracket calculation with nested lookups
- `lib/football-api.ts` — external API mapping and ID translation
- SSE stream behavior and fallback logic
- Timezone formatting across locales

**Recommendation:** Add at minimum:
- Unit tests for `lib/pathway.ts` (pure logic, easy to test)
- Unit tests for `lib/constants.ts` bracket mapping completeness
- Integration tests for API route handlers
- Consider Playwright for E2E flows

---

## 🟡 Medium Priority

### 3. Unused Dependencies

**Files:** `package.json`

- `date-fns` (^4.2.1) and `date-fns-tz` (^3.2.0) are declared as production dependencies but the codebase uses the native `Intl` API in `lib/timezone.ts` instead. No import of `date-fns` or `date-fns-tz` was found in any application file.
- `zod` (^4.4.3) is declared but not imported anywhere in the codebase.

**Impact:** Bundle bloat, misleading dependency list.

**Recommendation:** Remove `date-fns`, `date-fns-tz`, and `zod` from `package.json` if not planned for imminent use.

---

### 4. Orphaned Client Component: `GroupGrid.tsx`

**File:** `components/groups/GroupGrid.tsx`

The client-side `GroupGrid` component fetches group data via `/api/groups` and renders it. However, the groups page (`app/groups/page.tsx`) uses `GroupGridServer` which receives server-fetched data as props instead. `GroupGrid.tsx` appears to be the original implementation that was replaced but not deleted.

**Impact:** Dead code, potential confusion.

**Recommendation:** Delete `components/groups/GroupGrid.tsx` if confirmed unused.

---

### 5. SSE Stream Cleanup Behavior

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

### 6. In-Memory State in SSE Module

**File:** `app/api/scores/stream/route.ts`

Module-level state (`latestScores`, `listeners`, `pollInterval`) persists across requests but will be lost on:
- Serverless function cold starts (Vercel edge)
- Multi-instance deployments
- Hot module reloads in development

The current setup assumes a single long-lived Node.js process.

**Impact:** SSE may not work correctly in serverless/edge deployments. Not an issue for local dev or single-instance hosting.

**Recommendation:** Document deployment requirements (single Node.js process preferred). If deploying to serverless, consider external pub/sub (Redis, etc.) or switch to pure polling.

---

### 7. `unstable_cache` API Usage

**Files:** `app/api/fixtures/route.ts`, `app/api/groups/route.ts`, `app/api/scores/route.ts`, `app/groups/page.tsx`

The `unstable_cache` import from `next/cache` is used extensively. This API may change or be removed in future Next.js versions.

**Impact:** Potential breaking changes on Next.js upgrades.

**Recommendation:** Monitor Next.js release notes for `unstable_cache` stabilization. Consider wrapping in a utility function for easy migration.

---

### 8. Missing Error Boundaries

No React Error Boundaries are implemented. A runtime error in any client component (e.g., malformed API response, null reference) will crash the entire page.

**Impact:** Poor user experience on unexpected errors.

**Recommendation:** Add error boundaries at the route segment level using Next.js `error.tsx` files, and wrap critical client components.

---

## 🟢 Low Priority

### 9. Search Modal Links to Home Team Only

**File:** `components/search/SearchModal.tsx`

When a search result is clicked, it navigates to `/teams/${m.homeTeam.id}`. If the user searched for the away team, the link still goes to the home team's page. If there's no home team (knockout placeholder), it falls back to `/fixtures`.

```tsx
href={m.homeTeam?.id ? `/teams/${m.homeTeam.id}` : `/fixtures`}
```

**Impact:** Minor UX issue — clicking a search result for "Argentina" when they're the away team navigates to the wrong team page.

**Recommendation:** Consider highlighting the matched team and linking to their page instead.

---

### 10. No Rate Limiting on API Routes

**Files:** All `app/api/*/route.ts`

API routes have no rate limiting, authentication, or abuse protection. While acceptable for a personal/fan project, this could be exploited if publicly deployed.

**Impact:** Low for personal use; medium for public deployment.

**Recommendation:** Add basic rate limiting middleware if deploying publicly.

---

### 11. Hardcoded Locale Strings

**Files:** `lib/timezone.ts`, `components/search/SearchModal.tsx`

Date formatting uses hardcoded locale `"en-GB"` and `"en-US"`:

```typescript
new Intl.DateTimeFormat("en-GB", { ... })
```

**Impact:** Non-English users see English date formats regardless of browser locale.

**Recommendation:** Use `undefined` as the locale to respect the user's browser settings, or make locale configurable.

---

### 12. Large Seed File

**File:** `prisma/seed.ts` (407 lines) + `prisma/squadsData.ts` (13,471 bytes)

The seed file contains inline data for all 12 groups, 48 teams, 16 venues, 104 matches, and knockout bracket mappings. Combined with `squadsData.ts`, this is a substantial amount of hardcoded data.

**Impact:** Maintenance burden when fixture details change. No single source of truth if data also exists in the external API.

**Recommendation:** Consider loading fixture data from a JSON file or fetching from the football-data.org API during seeding.

---

### 13. No Favicon or Open Graph Images

**File:** `app/layout.tsx`

The root layout metadata doesn't include:
- Open Graph images for social media sharing
- Twitter card meta tags
- Custom favicon beyond the default Next.js one

**Impact:** Poor social media sharing appearance.

**Recommendation:** Add OG image generation and social meta tags.
