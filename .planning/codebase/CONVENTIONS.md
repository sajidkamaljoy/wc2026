---
last_mapped_date: "2026-05-22"
---

# Conventions

## Code Style
- **TypeScript Strictness**: TypeScript 5 with strict mode enabled.
- **Linting**: ESLint v9 with `eslint-config-next` applied.
- **Formatting**: Adheres to standard Next.js and Prisma formatting.

## React Patterns
- **Server vs Client**: App Router default to Server Components. Components needing interactivity (hooks, state) include the `"use client"` directive.
- **Styling**: Tailwind CSS classes directly on JSX elements.

## Database Access
- All database queries are done asynchronously using `prisma` client.
- Avoid exposing database internal IDs directly to the client if sensitive, though here `id` fields are sometimes natural keys (e.g., "A", "MEX", "metlife").

## Error Handling
- Use try/catch blocks in API routes and Server Actions.
- Client-side data fetching errors should be handled gracefully, likely displaying a fallback UI.

## Naming
- Database fields: camelCase (e.g., `goalsFor`, `homeTeamId`).
- Database models: PascalCase (e.g., `Team`).
- Component files: PascalCase with `.tsx` extension.
- Utility files: camelCase or kebab-case with `.ts` extension.
