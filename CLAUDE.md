# oleksiisedun.com

Personal portfolio site: a terminal emulator in the browser. Plain HTML/CSS/vanilla JS ES modules, no build step, no framework. `src/` is the deployed site root; everything outside it (`worker/`, `scripts/`, `tests/`, `docs/`, tooling config) is not published.

Setup, architecture overview (with diagram) and deployment live in [README.md](README.md); this file keeps only what an agent needs while editing.

## Commands

```
npm run dev     # serves src/ via `serve src`
npm run check   # aggregate: lint + lint:css + typecheck + format:check + check:sw + test (seconds, no network)
```

Run `check` after edits. Individual scripts:

- `npm run lint` — ESLint: modern-JS rules (`no-var`, `prefer-const`, `prefer-arrow-callback`, `prefer-template`) and typed JSDoc on every function (including nested arrow helpers).
- `npm run lint:css` — Stylelint (`recommended` + `color-no-hex`): raw hex colors belong only in the `:root` token block in `src/css/style.css`; use `var(--…)` elsewhere.
- `npm run typecheck` — `tsc` over `src/js/` with `checkJs` (non-strict), validating the JSDoc types. DOM lookups need a `/** @type {…} */` cast. ([ADR 0004](docs/decisions/0004-jsdoc-typecheck-non-strict.md))
- `npm run format:check` / `npm run format` — Prettier for `.js`/`.mjs`/`.json` (CSS, HTML and Markdown are not Prettier-formatted).
- `npm run check:sw` — `scripts/check-sw.mjs`: every shell file is in `sw.js`'s `CORE_ASSETS`, the analytics host in `sw.js` matches `ANALYTICS_ENDPOINT`, and `CACHE_NAME` is bumped when a precached file changed (vs `HEAD` by default, so it only sees uncommitted changes; after committing, run `npm run check:sw -- origin/main`).
- `npm test` — Node's built-in runner (`node --test`, no extra dependency) over `tests/*.test.js`: elapsed-duration math (`handlers.js`), `templates.js` output, `worker/worker.js` (CORS, caching, error paths, mocked upstream) and `scripts/check-sw.mjs` (against a fixture site). DOM-heavy code (`terminal.js`, `mochi.js`, `matrix.js`, `gestures.js`) is deliberately not unit-tested. Add a test alongside any change to the logic above.

CI (`.github/workflows/check.yml`) runs the same checks on pushes to `main` and on PRs, except `check:sw` runs against the PR base / pre-push commit rather than `HEAD`. `.github/workflows/deploy.yml` publishes `src/` to GitHub Pages on pushes to `main`.

## Architecture

- `src/index.html` — page shell: terminal screen + status bar (Mochi robot avatar).
- `src/js/config.js` — central config: prompt text, colors, sizes, and the `COMMANDS` registry.
- `src/js/terminal.js` — `Terminal` class: input handling, command dispatch, typewriter output, history.
- `src/js/handlers.js` — async handlers for dynamic commands (`analytics`, `trackers`) and static-file/unknown-command fallbacks.
- `src/js/templates.js` — HTML snippet generators for command output (e.g. analytics).
- `src/js/mochi.js` / `css/mochi.css` — the animated robot avatar in the status bar. Also binds the Matrix rain easter egg (see Gotchas).
- `src/js/script.js` — entry point; wires config values into CSS variables and bootstraps `Terminal`/`MochiRobot`.
- `src/js/matrix.js` — `openMatrixRain()`: fullscreen Matrix-style digital rain overlay (canvas-based), closed via `gestures.js`'s triple-tap or Escape.
- `src/js/gestures.js` — `onTripleTap(element, callback, windowMs)`: reusable triple-tap/triple-click detector (listens on `pointerdown`, so touch and mouse share one handler) used by both the Mochi trigger and the rain overlay's dismiss.
- `src/js/pwa.js` — `registerServiceWorker()`: registers `sw.js` on `window.load`, called from `script.js`.
- `src/css/style.css` — terminal/CRT visual styling.
- `src/commands/*.txt` — static text content for simple commands (`help`, `skills`).
- `worker/worker.js` — separate Cloudflare Worker (deployed independently) that proxies Cloudflare Analytics GraphQL API for the `analytics` command.
- `src/manifest.json` — PWA manifest (name, icons, theme colors); linked from `index.html`.
- `src/sw.js` — service worker: cache-first for the static shell, network-only (never cached) for the analytics endpoint. Classic (non-module) script that hardcodes the API hostname ([ADR 0001](docs/decisions/0001-classic-service-worker-with-hardcoded-host.md)).
- `src/icons/` — `icon.svg` is the source PWA icon (hand-drawn `>` `_` terminal-prompt glyph); `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` are rasterized from it. Regeneration procedure (no permanent `sharp` dependency): [ADR 0003](docs/decisions/0003-icons-rasterized-without-permanent-sharp.md).

## Adding a new terminal command

1. Register it in `COMMANDS` in `src/js/config.js` (with a `file` for static `.txt` content, or `null` for a custom handler; built-ins like `clear` are special-cased in `terminal.js` instead).
2. If static, add the content file under `src/commands/`.
3. If dynamic, add a handler to `COMMAND_HANDLERS` in `src/js/handlers.js` following the pattern of existing dynamic commands (`analytics`, `trackers`).
4. Update `src/commands/help.txt` to document the new command.

## Decision records

Why things that look wrong are intentional: [docs/decisions/](docs/decisions/) (service worker as a classic script, Mochi click-through, icon regeneration, non-strict `checkJs`). Read the relevant one before changing that area.

## Gotchas

- Easter egg: triple-tapping (touch) or triple-clicking (mouse) the Mochi robot opens a fullscreen Matrix digital rain overlay (`src/js/matrix.js`); triple-tapping/clicking anywhere while it's open closes it. It's not a terminal command, so it doesn't touch `COMMANDS`/`help.txt`. `.mochi-wrapper` is click-through and `.mochi-head` opts back in — see [ADR 0002](docs/decisions/0002-mochi-wrapper-click-through.md).
- `matrix.js` can optionally request the Fullscreen API to hide the mobile browser's own address bar/toolbar, gated by `MATRIX_HIDE_BROWSER_CHROME` in `config.js` (off by default). When enabled, this only works on Android Chrome — iOS Safari doesn't support fullscreening an arbitrary element, so the request silently no-ops there; on iOS the browser chrome only fully disappears when the site is launched from the home screen as the installed PWA (`display: standalone` in `manifest.json`).
- Any change to a file listed in `sw.js`'s `CORE_ASSETS` (e.g. `src/commands/help.txt`, any `src/js/*.js` shell file) must be paired with bumping `CACHE_NAME` in `sw.js` (`npm run check:sw` fails if you forget). A new shell file must also be added to `CORE_ASSETS` (same check). Without it, returning visitors keep getting the old cached version served cache-first — the deploy looks broken client-side even though the source is correct.