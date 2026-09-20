# 0003. PWA icons are rasterized with a throwaway `sharp` install

Status: accepted

## Context

`src/icons/icon.svg` is the hand-drawn source for the PWA icons. The PNGs (`icon-192.png`, `icon-512.png`,
`apple-touch-icon.png`) must be derived from it, since manifests and iOS need raster icons. The icons change rarely,
and the project is otherwise a static site with no image tooling.

## Decision

Don't keep an image-processing dependency in the repo. To regenerate the PNGs:

1. `npm install --save-dev sharp`
2. Run a one-off script: `sharp(svg).resize(...).png().toFile(...)` for each size.
3. `npm uninstall sharp` so `package.json` and the lockfile stay clean.

## Consequences

- `package.json` stays lean; `sharp` is a large native dependency that would otherwise be installed by every
  `npm ci` (including CI).
- Regenerating icons is a manual step; the PNGs are committed, so it is only needed when `icon.svg` changes.
- If icons start changing often, revisit this and add a permanent script.
