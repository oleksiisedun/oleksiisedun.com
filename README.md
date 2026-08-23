# oleksiisedun.com

Personal portfolio site, built as an interactive terminal emulator in the browser. Visitors type commands to explore info about me — work, projects, contact, and more.

Live at [oleksiisedun.com](https://oleksiisedun.com).

## Features

- Terminal-style UI with a retro CRT monitor aesthetic
- Commands: `help`, `skills`, `analytics`, `trackers`, `clear`
- Site analytics proxied through a Cloudflare Worker
- Installable PWA: the terminal shell works offline; analytics always fetches live
- Easter egg: triple-tap the Mochi robot on mobile for a fullscreen Matrix digital rain effect; triple-tap anywhere to dismiss

## Tech

Plain HTML, CSS, and vanilla JavaScript. No framework, no build step — just static files served directly.

## Architecture

`script.js` bootstraps the app by reading `config.js` and wiring CSS variables, then instantiates `Terminal` and `MochiRobot`, and calls `registerServiceWorker()` from `pwa.js`. `Terminal` dispatches typed commands: static commands fetch `.txt` files from `commands/`; dynamic ones delegate to handlers in `handlers.js`. The `analytics` handler calls the Cloudflare Worker proxy; `trackers` is self-contained. On mobile, `MochiRobot` also wires up a triple-tap easter egg (via the shared `gestures.js` tap detector) that opens a fullscreen Matrix rain overlay from `matrix.js`. `sw.js` caches the static shell for offline use and always lets analytics requests go straight to the network.

```mermaid
graph TD
  Entry["script.js\n(entry point)"] --> Config["config.js\n(COMMANDS registry,\ncolors, sizes)"]
  Entry --> Terminal["terminal.js\n(Terminal class:\ninput, dispatch, output)"]
  Entry --> Mochi["mochi.js + mochi.css\n(animated robot avatar)"]
  Entry --> PWA["pwa.js\n(registerServiceWorker)"]

  Terminal -->|static commands| StaticFiles[("commands/*.txt\n(help, skills)")]
  Terminal -->|dynamic commands| Handlers["handlers.js\n(COMMAND_HANDLERS)"]

  Mochi -->|triple-tap, mobile only| Gestures["gestures.js\n(onTripleTap)"]
  Gestures --> Matrix["matrix.js\n(fullscreen rain overlay)"]

  Handlers -->|analytics| Worker["worker/worker.js\n(Cloudflare Worker)"]
  Worker -->|proxies| CFAnalytics[("Cloudflare\nAnalytics GraphQL")]

  Handlers --> Templates["templates.js\n(HTML snippet generators)"]

  PWA -->|registers| SW["sw.js\n(cache-first shell,\nnetwork-only APIs)"]
  SW -.->|precaches| Manifest[("manifest.json + icons/")]
```

## Run locally

```
npm install
npm run dev   # serves the static site via `serve .`
```

## Deployment

- The static site deploys via GitHub Pages (custom domain in `CNAME`).
- `worker/worker.js` is a separate Cloudflare Worker, deployed independently — it's not part of the static site build.
