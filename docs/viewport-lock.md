# Viewport lock

**viewport = browser pane, not device screen.**

iPad / phone Safari draws a status bar and bottom browser chrome around the page. Layout, breakpoints, and “full height” math use that visible pane — never the device’s `screen` resolution.

Locked 2026-09-13 (cream My Work cards on iPad).

## Never

- `screen.width`
- `screen.height`
- `screen.availWidth`
- `screen.availHeight`

## CSS

Full-viewport geometry uses `--vvh` / `--vvw`:

- Default: `100svh` / `100svw`
- Upgrade: `100dvh` / `100dvw` when supported
- JS may overwrite both in **px** from `visualViewport`

Do not use legacy `100vh` / `100vw` for full-pane layout or off-screen parks.

## JS

`assets/js/viewport.js` exposes `window.layoutViewport` (`height`, `width`, `offsetTop`, `size`, `sync`).

Order:

1. `window.visualViewport` (`.height`, `.width`, `.offsetTop`) when scale ≈ 1
2. `document.documentElement.clientHeight` / `clientWidth`
3. `window.innerHeight` / `innerWidth`

Pinch-zoom (`scale > 1`) keeps the unzoomed layout pane so cards do not shrink.

## Surfaces

Cream home, Multiverse home (same layout CSS; Multiverse only adds glitch), and opened case / CBX300 `--study-stage`.
