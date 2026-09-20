# 0002. `.mochi-wrapper` is click-through; `.mochi-head` opts back in

Status: accepted

## Context

The Mochi robot sits in the status bar inside `.mochi-wrapper`, a 300px-wide absolutely positioned box centered over the
bar. Left alone, that box would swallow clicks meant for the terminal and the status-bar links beneath it. But the
Matrix rain easter egg needs the robot's head to receive `pointerdown` for the triple-tap/triple-click.

## Decision

- `.mochi-wrapper` has `pointer-events: none` so clicks pass through to whatever is underneath.
- `.mochi-head` sets `pointer-events: auto` unconditionally (in `src/css/style.css`), so only the visible head is a target.
- The global click handler in `terminal.js` skips refocusing the hidden input for taps on `.mochi-head` or
  `.matrix-overlay`, and blurs it instead (avoids the mobile keyboard reopening).

## Consequences

- Looking at `.mochi-wrapper { pointer-events: none }` alone suggests the robot can't be clicked; that is intentional.
- The `.mochi-head` override lives in `style.css`, not `mochi.css`, next to the Matrix overlay rules it supports.
- Any new interactive behavior on Mochi must target `.mochi-head` (or a child of it), not the wrapper.
