# System Architecture

## Overview
High-level architectural decisions and patterns for the World Cup 2026 Fan Companion project.

## Architecture Style
Mixed Server/Client Components (Next.js App Router)

The project leverages the App Router's paradigm:
- **Server Components (RSC)**: Used for heavy lifting, direct database queries (e.g., `/groups`, `/bracket`), and rendering shells. They are used to validate data before rendering client components.
- **Client Components**: Used for interactivity, real-time fetching (e.g., `FixtureList`, `SquadView`), and managing local state (e.g., `TeamForm`).

## API Design
RESTful & Server-Sent Events (SSE)

Standard RESTful endpoints (`/api/teams/[teamId]/...`) handle most data fetching. An SSE endpoint (`/api/scores/stream`) handles the live score streaming functionality without requiring client polling.

## State Management
React Context & Local State

- **LiveScoreProvider**: Used to wrap and distribute live SSE score data globally (`useLiveScores`).
- **Local State**: Managed with `useState`/`useEffect` hooks (e.g., `useFavorites`). 
- **Server State**: Hydrated directly from the server or fetched locally.

## Caching Strategy
Next.js `unstable_cache` & Optimistic Loading

Direct Prisma queries inside server components often leverage Next.js caching (`unstable_cache`). Client components load with optimistic `useState(true)` spinners and gracefully fail silently.
