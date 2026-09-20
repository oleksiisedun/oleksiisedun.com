# 0004. Type-check JSDoc with `tsc --checkJs`, non-strict

Status: accepted

## Context

The project is plain JS with no build step. Typed JSDoc is mandatory on every function (global convention), so the types
already exist, but nothing verified them. Full `strict` mode reported about 40 issues, almost all "possibly null" on
`document.getElementById(...)` in `terminal.js`, which would mean restructuring the DOM-access code.

## Decision

`tsconfig.json` runs `tsc --noEmit` with `allowJs`, `checkJs` and `strict: false`, over `src/js/` only. It validates JSDoc
types, import paths and property access. Null-safety is not enforced, and DOM lookups need a
`/** @type {HTMLInputElement} */` cast where the element type matters.

Node scripts (`scripts/`, `eslint.config.js`), `sw.js` and `worker/` are excluded: they target other runtimes and are
covered by ESLint.

## Consequences

- No build step or emitted files; `tsc` is a dev-only check inside `npm run check`.
- Adopting `strict` later means handling nullable DOM lookups (e.g. asserting once in the constructor); do it as its own
  change.
