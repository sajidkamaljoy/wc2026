# Code Conventions

> Mapped: 2026-05-21 | Updated: 2026-07-07

## Component Patterns

### "use client" Directive

All interactive components explicitly declare `"use client"` at the top of the file. Server components (pages with direct Prisma access, dynamic routes without hooks, error overlays) omit the directive.

**Client components** (with `"use client"`):
- `components/NavBar.tsx`, `components/BottomNav.tsx`
- `components/PageWrapper.tsx`, `components/TimezoneBanner.tsx`
- All `components/fixtures/*.tsx` (including `HeadToHead.tsx`, `PredictionModal.tsx`, `PredictionInput.tsx`)
- All `components/groups/GroupGrid.tsx`, `GroupTable.tsx`, `TeamRow.tsx`
- All `components/live/*.tsx` (except presentational badges)
- All `components/bracket/*.tsx` (including `BracketChallenge.tsx`, `SharedBracketView.tsx`)
- `components/pickem/PredictionHistory.tsx`
- `app/pickem/page.tsx`
- `app/watch/page.tsx`
- `hooks/useFavorites.ts`

**Server components** (no directive):
- `app/groups/page.tsx` — async server component with direct Prisma query
- `app/teams/[teamId]/page.tsx` — server component with Prisma validation
- `app/bracket/page.tsx` — async server component with direct Prisma query
- `app/pickem/error.tsx`, `app/watch/error.tsx` — route-level error boundaries
- `components/groups/GroupGridServer.tsx` — thin server-to-client bridge
- `components/live/LiveScoreBadge.tsx` — pure presentational, no hooks
- `components/news/NewsFeed.tsx` — RSC that calls `getWorldCupNews()`

### Data Fetching & State Synchronization

Client components follow consistent async patterns using `useEffect` + `fetch` + cleanup flag:

```tsx
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  let active = true;
  setLoading(true);

  fetch(`/api/endpoint`)
    .then((r) => {
      if (!r.ok) throw new Error("Failed to fetch");
      return r.json();
    })
    .then((d) => {
      if (active && d) setData(d);
    })
    .catch((err) => console.error(err))
    .finally(() => {
      if (active) setLoading(false);
    });

  return () => { active = false; };
}, [dependency]);
```

### Hydration Safety (Mounted Guard Pattern)

For components consuming browser APIs, user cookies (`deviceId`), or local storage values, a double `useEffect` mount guard is mandated to prevent hydration mismatches:

```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return <ServerSafeFallback />;
```

Used in: `KickoffTime`, `TimezoneBanner`, `Countdown`, `useFavorites`, `FanMood`, `PredictionInput`, `BracketChallenge`, `PredictionHistory`.

---

## Naming Conventions

| Element | Convention | Examples |
|---------|-----------|---------|
| Components | PascalCase, named exports | `export function BracketChallenge()` |
| Hooks | camelCase, `use` prefix | `useFavorites`, `useLiveScores` |
| Helper functions | camelCase, file-scoped | `getWinner()`, `gradePredictionsForMatch()` |
| Type interfaces | PascalCase | `MatchWithTeams`, `BracketPredictionState` |
| Type aliases | PascalCase + `Type` suffix | `StageType`, `MatchStatusType` |
| API routes | RESTful path segments | `/api/predict/bracket`, `/api/watch/streams` |
| Validation schemas | camelCase + `Schema` suffix | `predictionSchema`, `bracketPredictionSchema` |
| Constants | UPPER_SNAKE_CASE | `BRACKET`, `STREAMED_API_BASE` |

---

## Error Handling

### API Routes

All API route handlers use try-catch with consistent error responses:

```tsx
export async function GET() {
  try {
    // Business logic
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error description:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### Route-Level Error Boundaries

Next.js page folders include a co-located `error.tsx` (a client component that receives the error and reset callback) to prevent minor page glitches from crashing the entire browser session.

---

## Caching & Rate Limiting

### Shared In-Memory Caching (`lib/mem-cache.ts`)

For slow or rate-limited external resources (like fetching the martj42 match CSV file), utilize `mem-cache.ts` with a TTL value:

```typescript
const text = await memCache("cache-key", fetchFunction, 3600_000); // 1 hour
```

### In-Memory Rate Limiting (`lib/rate-limit.ts`)

Protect mutable endpoints (submissions, form postings) against script abuses:

```typescript
const ip = getClientIp(req);
const limitResult = rateLimit(ip, 10); // 10 request limit per minute
if (!limitResult.success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

---

## Import Patterns

All internal imports use the `@/` path alias pointing to the workspace root:

```tsx
import { prisma } from "@/lib/db";
import type { BracketPredictionState } from "@/types";
import { BracketChallenge } from "@/components/bracket/BracketChallenge";
```

Consistently use `import type` for type definitions.
Do not use barrel exports in individual component subfolders; import directly from component paths (e.g. `import { Countdown } from "@/components/fixtures/Countdown"`).
