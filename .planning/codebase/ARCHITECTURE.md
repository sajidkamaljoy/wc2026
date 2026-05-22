---
last_mapped_date: "2026-05-22"
---

# Architecture

## Pattern
- **Full-Stack Next.js App**: Uses the Next.js App Router paradigm (`app/` directory).
- **Client/Server Components**: Utilizes React Server Components (RSC) heavily for data fetching directly from Prisma, supplemented by Client Components where interactivity is required.
- **Route Handlers**: API routes are defined in `app/api/...` to serve data or act as webhooks/polling endpoints.

## Data Flow
- **Database Layer**: PostgreSQL managed by Prisma (`prisma/schema.prisma`).
- **Data Access Layer**: Direct Prisma Client calls in Server Components or Route Handlers.
- **Presentation Layer**: React components (`app/`, `components/`) rendering the data. TailwindCSS handles styling.

## Key Abstractions
- **Data Models**:
  - `Group`: World Cup groups (A-L).
  - `Team`: National teams with standings and relations to groups and matches.
  - `Venue`: Stadiums hosting matches.
  - `Match`: Match schedules, scores, and status (scheduled, live, finished). Kickoff stored in UTC.
  - `Player`: Roster with position and squad status.

## Entry Points
- `app/layout.tsx`: Root layout, likely including the global `NavBar.tsx` and `PageWrapper.tsx`.
- `app/page.tsx`: Landing page.
- `app/api/...`: API endpoints for client-side fetching.
