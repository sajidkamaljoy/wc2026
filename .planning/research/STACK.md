# Stack Research: Bracket Auto-Sync

> Mapped: 2026-07-07

## Proposed Stack Additions & Integration

To implement the auto-sync capability for bracket predictions, we do not require any new external npm packages or framework layers. The existing robust stack is fully sufficient.

### Core Stack Components Used

| Technology | Role | Version | Integration Method |
|------------|------|---------|---------------------|
| **Next.js API Routes** | Match Data & Prediction endpoints | 16.2.6 | `/api/predictions` and `/api/predict/bracket` endpoints serve and ingest JSON payloads. |
| **Prisma Client** | Database operations | ^6.19.3 | Used to query the actual resolved knockout matches and standings from Neon PostgreSQL. |
| **React Hooks** | Client state management | 19.2.4 | `useState`, `useEffect`, and `useMemo` in `useBracketPrediction` coordinate state changes and recalculations. |
| **Lucide React Icons** | UI visual elements | ^1.16.0 | Icons like `RefreshCw`, `CheckCircle`, and `AlertCircle` provide real-time UI feedback. |
| **Local Storage APIs** | Client offline cache | — | Serializes predictions state to localStorage to prevent lost picks. |

---

## Technical Feasibility

1. **No External Overhead**: Bypassing third-party bracket packages ensures the bundle size remains low and Tailwind utility class loading stays fast.
2. **Offline Resilience**: Since the database could be offline or unconfigured on local developer checkouts, the client components must gracefully fall back using `localStorage` caching and mock representations without breaking page layout.
3. **API Routing Optimization**: Uses the existing database models (`Match`, `Team`) to determine the resolved bracket flow without creating schema changes.
