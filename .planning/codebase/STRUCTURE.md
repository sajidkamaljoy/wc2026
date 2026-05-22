---
last_mapped_date: "2026-05-22"
---

# Structure

## Directory Layout
- `/app/`: Next.js App Router structure.
  - `/app/api/`: API route handlers (fixtures, groups, scores, teams).
  - `/app/bracket/`, `/app/fixtures/`, `/app/groups/`, `/app/teams/`: Page routes.
  - `/app/globals.css`: Global styles including Tailwind directives.
- `/components/`: Reusable React components.
  - Contains domain-specific subdirectories: `/bracket/`, `/fixtures/`, `/groups/`, `/live/`, `/news/`, `/pathway/`, `/search/`, `/squad/`, `/team/`.
  - Also contains shared UI like `NavBar.tsx`, `PageWrapper.tsx`, `TimezoneBanner.tsx`.
- `/hooks/`: Custom React hooks.
- `/lib/`: Utility functions and shared logic (e.g., Prisma client initialization, date formatters).
- `/prisma/`: Prisma schema and database configuration.
- `/public/`: Static assets (images, flags, favicon).
- `/scripts/`: Build or maintenance scripts.
- `/types/`: TypeScript definitions.

## Naming Conventions
- **Components**: PascalCase (e.g., `NavBar.tsx`, `TimezoneBanner.tsx`).
- **Routes/Directories**: kebab-case or lowercase (e.g., `/api/fixtures/`).
- **Hooks**: camelCase starting with `use` (e.g., `useScore.ts`).
- **Database Models**: PascalCase (e.g., `Match`, `Team`) with camelCase fields.
