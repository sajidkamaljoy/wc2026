# Testing

> Mapped: 2026-05-21 | Updated: 2026-05-22

## Test Framework

**No automated testing framework is configured.** The project does not have Jest, Vitest, Playwright, Cypress, or any other test runner installed.

- No `test` script in `package.json`
- No `__tests__/` directories
- No `*.test.ts` or `*.spec.ts` files
- No test configuration files

## Manual Verification Scripts

The project relies on **manual verification scripts** in the `scripts/` directory:

### `scripts/test-api.ts`

**Purpose:** Verify football-data.org API connectivity and key configuration.

**Run:** `npx tsx scripts/test-api.ts`

**What it checks:**
1. API key presence and prefix display
2. Base URL and competition ID configuration
3. Live connection test to football-data.org
4. Returns sample match data or confirms no active matches

**Output:** Console-based pass/fail with emoji indicators (🎉 / ❌)

### `scripts/verify-db.ts`

**Purpose:** Verify database seed integrity and pathway calculation logic.

**Run:** `npx tsx scripts/verify-db.ts`

**What it checks:**
1. Entity counts match expected values:
   - Groups: 12
   - Teams: 48
   - Venues: 16
   - Matches: 104
2. Dynamic pathway calculation for sample teams (ARG, ENG, BRA, MEX)
3. Bracket slot assignments and opponent resolution

**Output:** Console-based count verification + pathway samples

### `scripts/update-squad.ts`

**Purpose:** Update squad/player data for specific teams.

**Run:** `npx tsx scripts/update-squad.ts`

### `scripts/count-players.ts` **[NEW]**

**Purpose:** Report player and squad seeding statistics from the database.

**Run:** `npx tsx scripts/count-players.ts`

**What it checks:**
1. Total player records
2. Actual players vs. placeholder slots
3. Squad status breakdown: PRELIMINARY, CONFIRMED, TBD

**Output:** Formatted stats table with counts per category

## CI/CD

- No CI/CD pipeline configuration files (`.github/workflows/`, `vercel.json`, etc.)
- No pre-commit hooks (`husky`, `lint-staged`)
- Build command runs `prisma generate && next build` which provides compile-time type checking

## Linting

| Tool | Config File | Scope |
|------|-------------|-------|
| ESLint | `eslint.config.mjs` | TypeScript + Next.js core-web-vitals rules |
| TypeScript | `tsconfig.json` | Strict mode enabled — provides type safety at compile time |

**Run:** `npm run lint`

## Type Safety as Testing

TypeScript strict mode (`"strict": true`) provides the primary safety net:
- All files included: `**/*.ts`, `**/*.tsx`, `**/*.mts`
- Prisma generates typed client from schema
- Shared types in `types/index.ts` used consistently across API routes and components
- `import type` enforced for type-only imports

## Testing Gaps

| Area | Coverage | Risk |
|------|----------|------|
| Component rendering | ❌ None | High — no visual regression detection |
| API route handlers | ❌ None | Medium — only type-checked at build |
| Pathway calculation | ⚠️ Manual only (`verify-db.ts`) | Medium — complex bracket logic |
| Live score flow | ❌ None | High — SSE/polling untested |
| Database operations | ⚠️ Manual only (`verify-db.ts`) | Low — Prisma handles query safety |
| External API client | ⚠️ Manual only (`test-api.ts`) | Low — graceful degradation built in |
| E2E user flows | ❌ None | High — no automated browser testing |
| Timezone formatting | ❌ None | Medium — depends on Intl API behavior |
| **News API / mocks** | ❌ None | **[NEW]** Low — mock fallback path, but GNews integration untested |
| **Sentiment scoring** | ❌ None | **[NEW]** Low — `sentiment` library is well-tested, but score mapping thresholds untested |
| **Team Form (CSV)** | ❌ None | **[NEW]** Medium — CSV parsing logic and edge cases (name mismatches, missing data) untested |
| **Bracket page** | ❌ None | **[NEW]** Low — simple SSR data pass-through |
