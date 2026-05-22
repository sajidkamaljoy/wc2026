---
last_mapped_date: "2026-05-22"
---

# Testing

## Framework
- Currently, there is no explicit test framework listed in `devDependencies` (e.g., Jest, Vitest, Cypress, Playwright).
- The `package.json` scripts do not include a standard `test` script.

## Structure
- No `__tests__` or `*.test.ts` files have been identified in the high-level directories.

## Mocking
- Without a testing framework, no explicit mocking setup is configured.

## Coverage
- Zero. Test coverage tools (like istanbul/nyc) are not present.

## Recommendations
- Add Vitest or Jest for unit testing of utilities in `/lib/` and `/hooks/`.
- Add React Testing Library for component testing in `/components/`.
- Consider Playwright or Cypress for E2E testing of the application flow (viewing fixtures, standings, live scores).
