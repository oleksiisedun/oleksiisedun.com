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
- `js/handlers.js` — async handlers for dynamic commands (`analytics`, `smoke`, `certificates`) and static-file/unknown-command fallbacks.
- `js/templates.js` — HTML snippet generators for command output (e.g. analytics).
- `js/mochi.js` / `css/mochi.css` — the animated robot avatar in the status bar.
- `js/script.js` — entry point; wires config values into CSS variables and bootstraps `Terminal`/`MochiRobot`.
- `css/style.css` — terminal/CRT visual styling.
- `commands/*.txt` — static text content for simple commands (`about`, `help`, `skills`).
- `worker/worker.js` — separate Cloudflare Worker (deployed independently) that proxies Cloudflare Analytics GraphQL API for the `analytics` command.

## Adding a new terminal command

1. Register it in `COMMANDS` in `js/config.js` (with a `file` for static `.txt` content, or `null` for a custom handler).
2. If static, add the content file under `commands/`.
3. If dynamic, add a handler to `COMMAND_HANDLERS` in `js/handlers.js` following the pattern of existing dynamic commands (`analytics`, `smoke`, `certificates`).
4. Update `commands/help.txt` to document the new command.

## Deployment

- Static site is deployed via GitHub Pages (custom domain configured in `CNAME`).
- `worker/worker.js` is deployed separately to Cloudflare Workers and is not part of the static site build.
