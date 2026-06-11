# Coding Standards

## Overview
Coding conventions and patterns tailored for the World Cup 2026 Fan Companion project, optimizing for maintainability, type safety, and real-time frontend reliability.

## Code Formatting

**Tool**: Tailwind v4 via PostCSS + Next.js default formatting patterns
**Enforcement**: Handled via editor extensions and basic ESLint rules.

## Linting

**Tool**: ESLint
**Base Config**: `eslint.config.mjs` flat config using core-web-vitals + TypeScript
**Strictness**: Strict

**Key Rules**:
- **TypeScript Strict Mode**: Enabled in `tsconfig.json` to prevent runtime type errors.

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `FixtureCard` |
| Hooks | camelCase with `use` | `useFavorites` |
| Helper functions | camelCase, file-scoped | `groupByDate()` |
| Type interfaces | PascalCase | `MatchWithTeams` |
| Type aliases | PascalCase + `Type` suffix | `StageType` |
| API routes | RESTful path segments | `/api/teams/[teamId]` |
| Constants | UPPER_SNAKE_CASE | `BRACKET` |
| Env variables | UPPER_SNAKE_CASE | `DATABASE_URL` |

**File Naming**:
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`

## File Organization

**Pattern**: Next.js App Router (Feature/Route-based) + Shared Utilities

**Structure**:
```text
app/          # Next.js routes, pages, and API endpoints
components/   # Reusable UI components
hooks/        # Custom React hooks
lib/          # Helper functions, constants, utility classes
types/        # Shared TypeScript definitions
prisma/       # Database schemas and seeders
```

**Conventions**:
- Types: Centralized in `types/index.ts` (Barrel export).
- Components: NO barrel exports. Direct file imports are required.

## Testing Strategy

**Framework**: Vitest + React Testing Library
**Coverage Target**: High coverage on core utilities, critical UI components, and API routing logic.

**Test Types**:

| Type | Tool | When to Use |
|------|------|-------------|
| Unit | Vitest | Helper functions, formatters, domain logic |
| Component | React Testing Library | UI components and rendering states |

## Error Handling

**Pattern**: Graceful degradation over noisy failure.

**API Errors**:
- APIs return empty arrays `[]` or mock objects instead of crashing.
- They catch errors silently. 

**Client Component Errors**:
- Errors are logged via `console.error`.
- No user-facing error toasts except for explicit failure boundaries (e.g. `SquadView`).
- Fall back silently to empty/default states when things go wrong.

## Styling

**Tool**: Tailwind CSS v4
**Rules**:
- All styling is done inline via Tailwind utility classes.
- No CSS modules, no styled-components.
- Single `globals.css` with minimal custom CSS.
