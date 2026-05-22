---
last_mapped_date: "2026-05-22"
---

# Integrations

## Databases
- **PostgreSQL**: Relational database for core data models (Groups, Teams, Matches, Venues, Players). Connected via Prisma ORM using the `DATABASE_URL` environment variable.

## Potential External APIs
- **Football Data APIs**:
  The schema has an `externalId` field on the `Match` model `// External API match ID for live score polling`. This indicates an integration with an external live score provider (like football-data.org or similar API, as hinted by `flagUrl` comment: `URL from football-data.org or local /public/flags/`).

## Internal APIs
- `/app/api/fixtures/`
- `/app/api/groups/`
- `/app/api/scores/`
- `/app/api/teams/`

These handle data retrieval and potentially live score polling/updates for the frontend application.
