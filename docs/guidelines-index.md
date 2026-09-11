# Cream home design guidelines (`index.html`)

**Status:** Production direction. Cursor must not deviate without an explicit Tanishk / Iris lock update.  
**Scope:** `index.html`, `assets/css/landing.css`, `assets/js/landing.js`, `assets/js/iris-motion.js` (and shared assets those files already use).  
**Shared with Multiverse:** chrome **layout** for My Work, `landing-chrome`, edge dock geometry, and `--rise`. Those rules live in `landing.css` under `html.is-light-home` + `html.is-multiverse`. Glitch / comic skin stays in [`guidelines-multiverse.md`](./guidelines-multiverse.md).

---

## Product intent

A calm, editorial product-designer portfolio. Cream paper, coffee ink, teal accent. Syne for shouts; Outfit / Newsreader for body where already used. Motion is purposeful (curtain → masthead fly-in, drifting constellation web), never gimmicky.

---

## Hard locks (do not change without a new lock)

1. **Do not replace cream home with Multiverse.** Glitch / Ben-Day / comic RGB live only on the multiverse duplicate.
2. **Hero shout** stays exactly:
   - Kicker: `I DESIGN`
   - Accent: `THOUGHTFUL` in **teal `#00a0a0`**
   - Word: `EXPERIENCES` in body ink (coffee on light, cream on dark)
3. **Three-color lock (light):** cream `#f4efe6`, teal `#00a0a0`, dark coffee `#1E1510`.
4. **Theme semantics match light/dark intent:**
   - Light = cream ground, coffee type, teal accent
   - Dark = coffee ground, cream type, teal accent retained for `THOUGHTFUL` / brand accents
5. **Curtain:** brand mark `Tanishq Bafna` types / settles, then flies into the smaller masthead logo. No Ben-Day dots, no RGB glitch plates, no multilingual letter swaps on production.
6. **Background web** = soft constellation / node mesh (cream-home behavior). Do not restyle it into comic ink or Multiverse fringe.
7. **No glitch on project / work-card titles.**
8. Softboard / hologram / flip-book experiments are **dead** for this home unless Tanishk reopens them.
9. Briefs and visible product language stay non-code for Tanishk; implementation stays in these production files only when the job is cream home.

---

## Tokens (light home)

| Token | Value | Use |
|-------|--------|-----|
| `--cream` / `--bg` | `#f4efe6` | Page ground |
| `--coffee` / `--fg` | `#1E1510` | Primary type |
| `--teal` / `--accent` | `#00a0a0` | `THOUGHTFUL`, brand accents, indicators |
| `--shout` | `8vw` (as locked) | Hero shout size |
| Font shout | Syne 700/800 | Hero + logo weight family |

Dark (`html.is-light-home.is-dark`): swap bg/fg to coffee/cream; keep teal accents.

---

## Structure to preserve

- `html` classes: `is-light-home` (+ `is-curtain` while loading; `is-dark` when dark).
- Masthead: name, role, numbered nav (`01 Work` / `02 About` / `03 Resume` pattern as shipped).
- Hero block: kicker + accent + word hierarchy as above.
- Projects rail / cases: existing cream-home layout; enrichments go through Board before build scope expands.
- Theme toggle: moon/sun meaning must match “switch to dark” / “switch to light” correctly (not inverted).

---

## Motion

- Curtain on refresh; brand flies into masthead.
- Web: even mesh, quiet rest opacity, hover brightens nearby nodes without spawning long crossings.
- Prefer reduced-motion respect where already implemented.

---

## Cursor rules for this surface

- Edit **only** production files listed in Scope when the task is cream home.
- Never copy Multiverse glitch CSS/JS into these files “for consistency.”
- **Same control = same code.** My Work / `landing-chrome` / `--rise` layout is shared. Do not add an `html.is-light-home .work-cta` position/transform that Multiverse then re-specifies. Dual-prefix instead.
- Before shipping a cream-home change, re-check: teal `THOUGHTFUL`, cream/coffee ground, no glitch, web still constellation.
- If a request conflicts with this file, **stop and ask** Iris / Tanishk rather than inventing a third aesthetic.

---

## Last locked reference

Cream Syne light-home baseline (hz63→hz66 lineage): shout `I DESIGN / THOUGHTFUL / EXPERIENCES`, coffee type, numbered nav, particle web. Treat live `index.html` + `landing.css` as source of truth over old experiments.

## Edge utilities (locked 2026-09-09)

- Bottom-right **edge dock**: quiet `Go Beyond` text tab (links to `index-multiverse.html`) beside the theme switch — fun mode, not primary nav.
- Bottom-center primary CTA: **My Work** (`#work`) — teal pill, Syne, main action on the home stage.
- Both hide during curtain / project rail / study like the theme tab.
- Desktop My Work is `position: fixed` at the bottom and rides `--rise` with the projects panel (`translate3d(-50%, calc((var(--rise, 1) - 1) * 100svh), 0)`). No `transition: transform` on the button — JS updates `--rise` every frame. Curtain hide must keep the `-50%` X so the tab does not jump on lift.

## Shared layout vs glitch skin

Cream and Multiverse share **content and major CSS**: hero words, type scale, My Work, dock geometry, projects `--rise`. Multiverse **adds** a glitch layer (RGB fringe, letter hitch, comic plates, Ben-Day, particles). It must not fork positioning.

`landing.css` is the layout source of truth for chrome. `landing-multiverse.css` may restyle ink/comic on tabs and type, not `position` / `transform` / `--rise` on `.work-cta` or `.landing-chrome`.
