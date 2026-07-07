# Architecture Research: Bracket Auto-Sync

> Mapped: 2026-07-07

## Integration Patterns & Data Flow

To enable predictions auto-syncing, we integrate the client-side state machine in the bracket challenge with actual tournament matches.

```
┌────────────────────────────────────────────────────────┐
│                        Browser                         │
│  ┌─────────────────────────┐   ┌────────────────────┐  │
│  │   BracketChallenge      │   │   useLiveScores    │  │
│  │   "Sync with Live"      │   │   (real-time hook) │  │
│  └────────────┬────────────┘   └─────────┬──────────┘  │
│               │ click                    │ scores change
│               ▼                          ▼             │
│  ┌──────────────────────────────────────────────────┐  │
│  │   useBracketPrediction                           │  │
│  │     - syncKnockoutsWithActual()                  │  │
│  │     - Recalculates paths (cascades)              │  │
│  │     - Saves to localStorage & database           │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │ fetch()                                │
└───────────────┼────────────────────────────────────────┘
                ▼
┌────────────────────────────────────────────────────────┐
│                   Next.js App Server                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │   API Routes:                                    │  │
│  │     - GET /api/fixtures                          │  │
│  │     - GET /api/predict/bracket                   │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │ Prisma Query                           │
│               ▼                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │   PostgreSQL Database                            │  │
│  │     - Query resolved Match & Team entities       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## Architectural Changes & Components

### 1. API Extensions
We can leverage `/api/fixtures` to load all matches. To get resolved knockout matches specifically, the client can filter matches where `stage !== "GROUP"` and check their `status === "FINISHED"`.

### 2. Hook Updates (`hooks/useBracketPrediction.ts`)
Add a new method `syncKnockoutsWithActual()` that:
1. Performs a fetch to `/api/fixtures` (or relies on actual fixtures data if pre-loaded).
2. Filters actual tournament matches that are `FINISHED` in the knockout stages (matches 73–104).
3. Iterates over these finished matches:
   - Sets the user's `knockoutPicks[matchNumber]` to the actual winner of the match (calculated by comparing `homeScore`/`awayScore` and extra-time/penalty metrics).
4. Cascades changes down the bracket tree to update subsequent match home/away slots.
5. Saves the updated state to `localStorage` and triggers the database upsert to sync the user's remote profile.

### 3. Component Integration (`components/bracket/BracketChallenge.tsx`)
1. Insert a visual "Sync Live Status" toolbar at the top of the groups/bracket tabs.
2. Render a "Sync with Real Tournament" button featuring a rotating `RefreshCw` icon.
3. Lock synced matches in the UI by preventing click actions on matches that have already completed in real life, rendering them with a read-only lock badge.
