# Code Conventions

> Mapped: 2026-05-21

## Component Patterns

### "use client" Directive

All interactive components explicitly declare `"use client"` at the top of the file. Server components (pages with direct Prisma access) omit the directive.

**Client components** (with `"use client"`):
- `components/NavBar.tsx`
- `components/PageWrapper.tsx`
- `components/TimezoneBanner.tsx`
- All `components/fixtures/*.tsx`
- All `components/groups/GroupGrid.tsx`, `GroupTable.tsx`, `TeamRow.tsx`
- All `components/live/*.tsx` (except `LiveScoreBadge.tsx` which doesn't need client hooks)
- `components/pathway/PathwayBracket.tsx`
- `components/search/SearchModal.tsx`
- `components/squad/SquadView.tsx`
- `hooks/useFavorites.ts`

**Server components** (no directive):
- `app/groups/page.tsx` — async server component with direct Prisma query
- `app/teams/[teamId]/page.tsx` — server component with Prisma validation
- `components/groups/GroupGridServer.tsx` — thin server-to-client bridge
- `components/live/LiveScoreBadge.tsx` — pure presentational, no hooks

### Component Interface Pattern

Props are defined inline or via named `Props` interface directly above the component:

```tsx
interface Props {
  match: MatchWithTeams;
}

export function FixtureCard({ match }: Props) { ... }
```

### Data Fetching in Client Components

Client components follow a consistent pattern using `useEffect` + `fetch` + cleanup flag:

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

Key conventions:
- `active` flag prevents state updates after unmount
- Loading state managed with `useState(true)` (optimistic loading)
- Errors logged to console, not surfaced to UI (except `SquadView` which sets an error state)
- `finally` always resets loading state

### Loading States

Components render consistent loading spinners using Lucide `Loader2`:

```tsx
if (loading) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      <span className="text-sm font-medium tracking-wide">Loading...</span>
    </div>
  );
}
```

### Empty States

Empty states use a consistent dashed-border container with an icon:

```tsx
<div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500
     border border-dashed border-white/5 rounded-3xl bg-slate-900/10">
  <Icon className="h-10 w-10 text-slate-600" />
  <span className="text-sm font-semibold">No data available.</span>
</div>
```

---

## Naming Conventions

| Element | Convention | Examples |
|---------|-----------|---------|
| Components | PascalCase, named exports | `export function FixtureCard()` |
| Hooks | camelCase, `use` prefix | `useFavorites`, `useLiveScores` |
| Helper functions | camelCase, file-scoped | `stageName()`, `groupByDate()`, `ordinal()` |
| Type interfaces | PascalCase | `MatchWithTeams`, `TeamPathway`, `LiveScore` |
| Type aliases | PascalCase + `Type` suffix | `StageType`, `MatchStatusType`, `PositionType` |
| API routes | RESTful path segments | `/api/teams/[teamId]/pathway` |
| CSS classes | Tailwind utility-first | No custom class names except `animate-fade-in` |
| Constants | UPPER_SNAKE_CASE | `BRACKET`, `ID_MAP_TTL_MS`, `STAGES` |
| Env variables | UPPER_SNAKE_CASE | `DATABASE_URL`, `FOOTBALL_DATA_API_KEY` |

---

## Error Handling

### API Routes

All API route handlers use try-catch with consistent error response:

```tsx
export async function GET() {
  try {
    // ... business logic
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error description:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### External API Client

`lib/football-api.ts` uses defensive patterns:
- Returns empty array `[]` on any API error
- Returns mock `{ matches: [] }` if no API key configured
- Catches errors silently in `getLiveScores()` to prevent app crashes

### Client Components

- Errors are logged via `console.error` — no user-facing error toasts
- `SquadView` is the only component that sets an error state string for display
- Other components silently fall back to empty/default states

---

## Import Patterns

### Path Alias

All internal imports use the `@/` path alias:

```tsx
import { prisma } from "@/lib/db";
import type { MatchWithTeams } from "@/types";
import { FixtureCard } from "@/components/fixtures/FixtureCard";
```

### Type-Only Imports

`import type` is used consistently for type-only imports:

```tsx
import type { Metadata } from "next";
import type { LiveScore } from "@/types";
import type { TeamPathway, PathwayRound } from "@/types";
```

### Barrel Exports

- `types/index.ts` exports all shared types from a single file
- Component directories do NOT use barrel exports (direct file imports)

---

## Styling Conventions

### Tailwind CSS v4

- All styling is via Tailwind utility classes inline
- No CSS modules, no styled-components, no separate `.css` files per component
- Single `globals.css` with minimal custom CSS (variables + 1 keyframe animation)

### Design System Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | `bg-slate-950` (#020617) | App background, dark mode |
| Text primary | `text-slate-100` | Body text |
| Text muted | `text-slate-400` / `text-slate-500` | Secondary text, labels |
| Accent gold | `text-amber-400`, `bg-amber-500/10` | Active states, highlights, points |
| Live/danger | `text-red-400`, `bg-red-500/10` | Live match indicators |
| Success/qualify | `text-emerald-400`, `bg-emerald-500/10` | Qualification zone |
| Warning | `text-amber-300`, `bg-amber-500/5` | Third-place conditional |
| Border subtle | `border-white/5`, `border-white/10` | Card borders, dividers |
| Glassmorphism | `backdrop-blur-md`, `bg-slate-950/80` | NavBar, modals |

### Responsive Pattern

Mobile-first with Tailwind breakpoints:
- Mobile: icon-only nav items, collapsed badges, stacked layouts
- `sm:` — show nav labels, expand badges
- `md:` — side-by-side fixture card layout
- `lg:` — wider content area
- `xl:` — 3-column group grid

### Animation Classes

| Class | Source | Usage |
|-------|-------|-------|
| `animate-fade-in` | Custom keyframe in `globals.css` | Page transitions via `PageWrapper` |
| `animate-spin` | Tailwind built-in | Loading spinners |
| `animate-pulse` | Tailwind built-in | Live indicator, preliminary squad badge |
| `animate-ping` | Tailwind built-in | Live dot ripple effect |

---

## SEO Patterns

Each page exports metadata via the `Metadata` type:

```tsx
export const metadata: Metadata = {
  title: "Page Title — FIFA World Cup 2026™",
  description: "Page description for search engines.",
};
```

- Root layout sets base metadata with keywords and authors
- Team detail page uses `generateMetadata()` for dynamic team-specific metadata
- `<h1>` used once per page with gradient text treatment

---

## Hydration Safety

Components that depend on browser APIs (timezone, localStorage) use the pattern:

```tsx
const [clientData, setClientData] = useState<T | null>(null);

useEffect(() => {
  // Browser-only logic
  setClientData(computedValue);
}, []);

if (!clientData) return <ServerSafeFallback />;
```

Used in: `KickoffTime`, `TimezoneBanner`, `Countdown`, `useFavorites`
