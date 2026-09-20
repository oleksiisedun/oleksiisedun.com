# 0001. Service worker is a classic script with a hardcoded analytics host

Status: accepted

## Context

The rest of the site is ES modules and shares constants through `js/config.js`. `sw.js` looks like it should import
`ANALYTICS_ENDPOINT` from there, and look like a module too.

## Decision

`sw.js` stays a classic (non-module) script, registered without `{ type: 'module' }`, and hardcodes the analytics
hostname in `NETWORK_ONLY_HOSTS` instead of importing it.

- Classic workers run everywhere; module service workers need newer browser support, and this file has no other reason
  to need it.
- A classic script can't `import` `config.js`, so the hostname is duplicated by necessity.

## Consequences

- The duplicate can drift. `npm run check:sw` (`scripts/check-sw.mjs`) fails if `NETWORK_ONLY_HOSTS` doesn't include the
  host of `ANALYTICS_ENDPOINT`.
- `sw.js` can't use `import`; keep it dependency-free.
- Precached files and `CACHE_NAME` are checked by the same script (see the Gotchas in `CLAUDE.md`).
