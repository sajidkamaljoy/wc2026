---
last_mapped_date: "2026-05-22"
---

# Concerns

## Technical Debt & Architecture
- **Missing Testing**: The codebase completely lacks an automated testing suite. Setting up unit and E2E tests should be prioritized before launch to ensure reliability during the tournament.
- **Live Score Polling**: The architecture for live score polling (`app/api/scores/` + `Match.externalId`) needs to be robust. Frequent client-side polling could cause high DB load if not cached or optimized (e.g., using Redis or Next.js ISR/cache).
- **Timezone Management**: Match kickoffs are stored in UTC, which is good. However, client-side rendering of these times must handle user local timezones correctly. `date-fns-tz` and `TimezoneBanner.tsx` indicate awareness, but this is a common source of bugs.

## Security
- Need to ensure any endpoints modifying match scores or data (if not fetched from an external API automatically) are properly authenticated and secured.

## Performance
- **Database Scalability**: During live matches, the database might see high concurrent reads. Caching strategies should be validated to minimize direct DB hits.
- **Images/Assets**: Ensuring flags and crests are optimized (Next.js `<Image>`) to keep loading times low on mobile networks.
