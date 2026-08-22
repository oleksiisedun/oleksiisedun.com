# oleksiisedun.com

Personal portfolio site: a terminal emulator in the browser. Plain HTML/CSS/vanilla JS ES modules, no build step, no framework.

## Run locally

```
npm run dev   # serves the static site via `serve .`
```

## Architecture

- `index.html` — page shell: terminal screen + status bar (Mochi robot avatar).
- `js/config.js` — central config: prompt text, colors, sizes, and the `COMMANDS` registry.
- `js/terminal.js` — `Terminal` class: input handling, command dispatch, typewriter output, history.
- `js/handlers.js` — async handlers for dynamic commands (`analytics`, `smoking`) and static-file/unknown-command fallbacks.
- `js/templates.js` — HTML snippet generators for command output (e.g. analytics).
- `js/mochi.js` / `css/mochi.css` — the animated robot avatar in the status bar. Also binds the mobile-only Matrix rain easter egg (see Gotchas).
- `js/script.js` — entry point; wires config values into CSS variables and bootstraps `Terminal`/`MochiRobot`.
- `js/matrix.js` — `openMatrixRain()`: fullscreen Matrix-style digital rain overlay (canvas-based), closed via `gestures.js`'s triple-tap or Escape.
- `js/gestures.js` — `onTripleTap(element, callback, windowMs)`: reusable triple-tap detector used by both the Mochi trigger and the rain overlay's dismiss.
- `js/pwa.js` — `registerServiceWorker()`: registers `sw.js` on `window.load`, called from `script.js`.
- `css/style.css` — terminal/CRT visual styling.
- `commands/*.txt` — static text content for simple commands (`help`, `skills`).
- `worker/worker.js` — separate Cloudflare Worker (deployed independently) that proxies Cloudflare Analytics GraphQL API for the `analytics` command.
- `manifest.json` — PWA manifest (name, icons, theme colors); linked from `index.html`.
- `sw.js` — service worker: cache-first for the static shell, network-only (never cached) for the analytics endpoint. Classic (non-module) script, so it hardcodes that API hostname rather than importing it from `config.js`.
- `icons/` — `icon.svg` is the source PWA icon (hand-drawn `>` `_` terminal-prompt glyph); `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` are rasterized from it. Regenerate by temporarily `npm install --save-dev sharp`, running a one-off script through `sharp(svg).resize(...).png().toFile(...)`, then uninstalling `sharp` again — no permanent image-processing dependency is kept in the repo.

## Adding a new terminal command

1. Register it in `COMMANDS` in `js/config.js` (with a `file` for static `.txt` content, or `null` for a custom handler).
2. If static, add the content file under `commands/`.
3. If dynamic, add a handler to `COMMAND_HANDLERS` in `js/handlers.js` following the pattern of existing dynamic commands (`analytics`, `smoking`).
4. Update `commands/help.txt` to document the new command.

## Deployment

- Static site is deployed via GitHub Pages (custom domain configured in `CNAME`).
- `worker/worker.js` is deployed separately to Cloudflare Workers and is not part of the static site build.

## Gotchas

- Easter egg: on touch devices, triple-tapping the Mochi robot opens a fullscreen Matrix digital rain overlay (`js/matrix.js`); triple-tapping anywhere while it's open closes it. It's not a terminal command, so it doesn't touch `COMMANDS`/`help.txt`. `.mochi-wrapper` has `pointer-events: none` so clicks pass through to the terminal; `css/style.css` re-enables `pointer-events: auto` on `.mochi-head` inside the mobile media query so the tap can be targeted, without changing desktop's click-through behavior.
- `matrix.js` can optionally request the Fullscreen API to hide the mobile browser's own address bar/toolbar, gated by `MATRIX_HIDE_BROWSER_CHROME` in `config.js` (off by default). When enabled, this only works on Android Chrome — iOS Safari doesn't support fullscreening an arbitrary element, so the request silently no-ops there; on iOS the browser chrome only fully disappears when the site is launched from the home screen as the installed PWA (`display: standalone` in `manifest.json`).