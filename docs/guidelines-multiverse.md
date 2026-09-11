# Multiverse study design guidelines (`index-multiverse.html`)

**Status:** Experimental **duplicate** study only — not production.  
**Scope:** `index-multiverse.html`, `assets/css/landing-multiverse.css`, `assets/js/landing-multiverse.js`, `assets/js/iris-motion-multiverse.js`, multiverse img assets (`assets/img/multiverse-*.svg`).  
**Layout exception:** My Work, `landing-chrome`, edge-dock geometry, and `--rise` live in `landing.css` (dual `html.is-light-home` / `html.is-multiverse` selectors). Edit those there. Do **not** re-specify `position` / `transform` / `--rise` on `.work-cta` in this sheet.  
**Forbidden:** Copying Multiverse glitch into cream `iris-motion.js` / cream home classes. Do not load Multiverse IrisMotion on cream.

Also read [`guidelines-index.md`](./guidelines-index.md) so shared layout (hero words, teal accent, theme meaning, My Work) does not drift.

---

## Product intent

Same portfolio information architecture as cream home, with a comic **dimensional glitch** on type, web, and loaders. Ben-Day is content-tied and subtle — not a wallpaper, not a blast/starburst. Idle type is clean Latin; glitch is episodic.

---

## Hard locks (do not change without a new lock)

1. **Duplicate only.** Never merge multiverse effects into production cream home unless Tanishk explicitly ships that decision.
2. **Theme parity with `index.html`:**
   - Light / print = cream ground (not a dark plate pretending to be light)
   - Dark = night ink
   - Toggle labels/icons must not feel inverted vs production
3. **Hero shout parity:**
   - `I DESIGN` / `THOUGHTFUL` / `EXPERIENCES`
   - **`THOUGHTFUL` = teal `#00a0a0`** in light and dark (not cyan, not coffee ink fill)
   - `EXPERIENCES` = body ink
4. **No Ben-Day / halftone dots on any curtain** — home loader and project/study loaders. Solid plates only.
5. **One glitch system for both loaders.** Project loader and main loader must share the same glitch language (RGB fringe, multilingual letter swaps, hitch). Do not ship a weaker/different project-only effect.
6. **No glitch on project / work-card titles.**
7. **Background web ≈ cream home constellation** (not comic-ink restyle).
8. **No blast / starburst / explosion graphic.**
9. Softboard / hologram are dead for this study’s case chrome unless reopened.

---

## Glitch behavior (current lock)

### Idle
- Latin spelling restored (`data-latin` / aria).
- No permanent red/cyan fringe on type.

### Multilingual letter flash
- Scripts allowed: Devanagari, Cyrillic, Greek, Arabic (sparse), light CJK lookalikes.
- Unpredictable: random letter subset, mixed scripts, staggered delays, uneven hold; occasional double-flash.
- Always restore Latin after the burst.

### Cadence
- Landing **header / masthead** regular glitches: **~15 seconds** between hits (landing header only).
- Nav labels (Work / About / Resume) glitch on the same cadence, slightly offset.
- Web hitch uses the same cadence on its own clock (async from type).
- During web hitch, **threads and knots** both glitch (shear, dropout, RGB split).
- Small organic bursts elsewhere may still jitter; do not use ~10s for the landing header cadence.
- **Bigger slam ~every 30s** (light jitter ~28–34s) on logo / shout / nav targets.
- **Logo (“Tanishq Bafna”)** glitches on that ~30s pulse on **landing and portfolio/case pages** that share multiverse chrome.
- **My Work** uses the same comic dock language as Go Home / theme tabs / project cards: square ink edge, cyan offset, episodic RGB plates + letter hitch. Idle fill stays teal with a cream label. Do **not** set `position` / `transform` / `--rise` on `.work-cta` here.

### Intensity
- Keep the study readable; prefer slightly soft over seizure slam.
- Reduce intensity only by dialing fringe/swap aggression — do not remove the system.

### Main brand loader timing
- Whole main loader ~**10 seconds** before lift/fly-in completes.
- Curtain name cycles these **exact Latin forms**, **3.0 seconds each**:
  1. `Tanishk Bafnaa`
  2. `Tanish Bafna`
  3. `Tanishq Bafna`
- Then settle to full brand `Tanishq Bafna` for masthead fly-in.
- Multilingual RGB hitch may play *on* those strings; it must not replace this sequence.
- Project loader that shows the same brand mark uses the **same** sequence, gaps, and glitch system.

---

## Files & cache

- Always bump `?v=mvN` on multiverse CSS/JS when shipping a study pass.
- Prefer shared helpers so home curtain and project veil cannot drift.

---

## Cursor rules for this surface

1. **Read this file + `guidelines-index.md` before editing** multiverse files.
2. Touch Scope files for glitch/skin. Chrome layout (My Work / `landing-chrome` / `--rise`) is edited in `landing.css`.
3. After any glitch change, verify:
   - Home loader and project loader look like the same system
   - `THOUGHTFUL` still `#00a0a0`
   - Curtains have **no** dots
   - Light mode is real cream
   - Project titles do not glitch
4. If a request would break a hard lock, **stop and ask** rather than “improving” past the lock.

---

## Relationship to cream home

Multiverse is a **glitch skin** on the same IA and the same chrome layout. Shared copy, teal accent, theme meaning, web behavior, **My Work**, **dock**, and **`--rise`** come from cream home (`landing.css`). Glitch, multilingual flashes, comic print on type/cards, and Multiverse particles are this sheet + IrisMotion only.

Same control = same code. If My Work floats over `THOUGHTFUL`, a Multiverse layout fork is the bug — delete it, do not patch a second transform.

Both worlds load `landing.css`. This file stacks after it as skin. Phase B (later): collapse remaining duplicated layout in this file toward glitch-only overrides.
