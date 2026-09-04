# Tanishq Bafna — portfolio landing (horizontal edition)

A bold, editorial landing experience for a product/UX designer. Static HTML, CSS
and vanilla JS — no build step, no dependencies, no framework. It matches the
conventions of the existing tanishqbafna.com site (`assets/…` paths, sibling
`.html` pages), so it can drop straight into that repo root.

## Run it locally

```bash
python3 -m http.server 4321 --directory ~/Projects/tanishqbafna-portfolio
```

Then open <http://localhost:4321>. Opening `index.html` directly by double-click
also works — all scripts are plain (non-module) files for exactly that reason.

Deep links for this prototype:

- `http://localhost:4321/?open=daughters` — open the Daughters flip book
- `http://localhost:4321/?open=daughters&hold=flip` — freeze the first sheet mid-turn (QA)

Cache-bust query on CSS/JS is `?v=flipbook3`. Hard-refresh if a previous preview is stuck.

## Opened case (what changed vs the flat card)

The previous open path was a **felt board** (and a failed follow-up that rotated one cream panel on `rotateY`). Both read as a modal swapping text, not a page turning: `backface-visibility` hid the sheet at 90 degrees, so the next page was already sitting underneath.

This prototype replaces that with a **manila flip book**:

1. Landing first paint is unchanged (ink/navy, heading, portrait placeholder, folder rail).
2. Only a **live** folder opens (Daughters). Empty folders stay on the rail.
3. That folder flies to center, then unfolds into a **two-page spread** with a spine.
4. Each beat is a **dual-face sheet**. Next / Prev (and a drag on the right edge) rotates the top sheet around the spine. Mid-turn shows the page edge, the verso, a cast shadow, and the stack underneath.
5. Counter is `01 / N`. Tools sticky stays on page 1 when the project data has tools.
6. Home / Escape: **one** folder returns to the rail. No second ghost card.
7. `prefers-reduced-motion`: instant page change, no 3D.

Softboard metaphors (felt tray, pan canvas, pin-and-rope) are not used.

Do not deploy this to the live site. Local preview + PR only.

## Files

| File | Role |
| --- | --- |
| `index.html` | Page shell: header, hero, detail deck, rail, nav controls, card `<template>` |
| `assets/css/landing.css` | All styling, tokens, responsive rules, reduced-motion rules |
| `assets/js/project-data.js` | **The only file you need to edit for content** |
| `assets/js/folder-card.js` | Renders one folder card — `create()` for the rail, `createDocked()` for the detail view |
| `assets/js/project-rail.js` | Horizontal scrolling, wheel→horizontal, keyboard, drag, arrows |
| `assets/js/project-detail.js` | The open-project slide deck that docks a folder to the left |
| `assets/js/landing.js` | Bootstraps everything; hero reveal, cursor light, portrait fallback |
| `assets/img/covers/*.svg` | Abstract cover placeholders (generated, not stock) |

Component boundaries map to the requested structure: `PortfolioLanding`
(`index.html`) → `PortfolioHeader` (`.masthead`), `HeroIntro` (`.hero`),
`ProjectRail` (`.rail` + `project-rail.js`), `ProjectFolderCard`
(`#folder-template` + `folder-card.js`), `HorizontalNavigation`
(`.rail-controls`), `ProjectDetail` (`.detail` + `project-detail.js`),
`projectData` (`project-data.js`).

## Replacing the portrait

1. Save your portrait as **`assets/img/tanishq-portrait.jpg`**.
2. Aim for a **4:5 portrait crop**, ~880×1100 px, under ~250 KB.
3. Nothing else to change. Until that file exists, the frame shows a clearly
   labelled placeholder naming the exact path — no stock imagery is used.

Prefer WebP? Save `tanishq-portrait.webp` and change the one `src` in
`index.html` (search for `tanishq-portrait`). The `width`/`height` attributes
are already set, so there is no layout shift either way.

## Updating projects

Everything lives in `assets/js/project-data.js` as one array. Add, remove or
reorder entries — the counter (`01 / 04`), arrows, keyboard navigation and the
detail panel all follow automatically.

```js
{
  index: '01',                       // shown on the folder tab
  title: 'SME Banking',
  category: 'Fintech Product Design',
  blurb: 'One line on the folder. Keep under ~90 characters.',
  detail: 'Fallback copy if this project has no slides.',
  slides: [                          // the deck the arrows page through
    { title: 'The problem',          // short eyebrow label, in the accent
      headline: 'A boss and a rep cannot share a dashboard',   // the claim
      body: 'The paragraph. Plain language, and *this phrase* gets the accent.' },
    { title: 'What I did',  body: '…' },
    { title: 'Outcome',     body: '…' }
  ],
  year: '2025 — Present',
  role: 'Product Designer',
  scope: 'Web + mobile, design system',
  href: '#',                         // '#' = no case study page yet
  cover: 'assets/img/covers/cover-01.svg',
  coverTag: 'Payments · Approvals · FX',
  status: 'placeholder'              // 'live' once href points somewhere real
}
```

**Slides carry a paragraph.** `body` is the slide's prose — plain language, about
45 words, which sets four lines and fills the band the layout reserves for it.
Write past roughly 50 words and that slide's imagery drops by a line. A `points`
array is still rendered for a slide that genuinely is a list, and `body` wins if
both are given. Keep it out of design vocabulary either way — a recruiter should
follow every slide without knowing what "information architecture" means.

**Accent keywords.** Wrap a word or phrase in `*asterisks*` and it renders in
accent italics — the same `<em>` treatment as *thoughtful* in the hero heading. It
works in `headline` too. One or two a slide, on the words that carry the sentence;
more and the effect stops meaning anything.

The marks are parsed into real DOM nodes rather than assigned as `innerHTML`, so a
stray angle bracket in the content file stays text and nothing in there can inject
markup. `*` is the only markup the content file understands.

**Two levels of slide text.** The project name is not repeated on the slides at
all, so each slide carries a short `title` (an eyebrow label — "The problem", "Decision 1")
and an optional `headline`, which is the claim and the line that actually changes as
you page through. Slides without a `headline` simply skip it.

**Slides:** add or remove `slides` entries freely — the dots, the `01 / 03`
counter and the arrow disabled states all follow the array length. A project with
no `slides` array falls back to a single slide built from `detail`.

**Slide images.** Most case-study slides will carry screens, so each slide takes
an `images` array:

```js
{
  title: 'What I did',
  headline: 'The claim this slide makes',
  body:  'Plain language, about 45 words, with *one accented phrase*.',
  images: [
    'assets/img/slides/slide-01.svg',                       // shorthand
    { src: '…/slide-02.svg', alt: 'Approvals queue',        // or full form
      caption: 'Approvals queue' }
  ]
}
```

**A slide has no layout to choose.** There used to be two — images beside the
text, or a row of images beneath it — and paging a deck meant watching it reflow
into a different arrangement every few slides, at two different title sizes, with
some images cropped and some whole. Now there is one shape, and every slide uses
it:

| Row | Holds |
| --- | --- |
| 1 | the eyebrow across the top, then the claim (left half) and the paragraph (right half) |
| 2 | the imagery, hanging from a line that is the same on every slide |

**One gutter.** `--col-gap` is the panel's column gap and the *only* gutter inside
it. The panel had three — 28.8px between its 12 columns, 14px between images, 31.7px
between the text columns — so no division lined up with any other and every slide
looked arbitrarily divided. Because 12 columns with gap *g* make 6 columns plus 5
gaps exactly equal to half the width, `repeat(2, 1fr)` at the same gap lands
precisely on the 6|7 grid line. The imagery goes further and runs on all twelve
columns at the same gap, so its uneven 7-against-5 split lands on real grid lines
too. The text's column edge and the imagery's outer edges therefore agree —
measured, not approximately:

```
claim   58 → 706        column  734 → 1382
image   58 → 706        image   734 → 1382
```

The paragraph itself is capped at `48ch` inside that column, well short of its
right edge: 648px of 16px text runs to about 80 characters a line, roughly twice a
comfortable read. The column edge is what aligns; the measure is what reads.

| `images` | Result |
| --- | --- |
| none | the words take the whole panel — this is the opening slide |
| 1 | one image, as large as the row allows, flush to one outer edge |
| 2 | an uneven pair — seven columns against five — sharing a baseline |

**Two images is the maximum.** More than that and each one is too small to read
anything in; a third also forces a three-way split that fights the two-column
text above it. `paintMedia` will render whatever the array holds, but nothing in
the four decks carries more than two.

### Slide types

A deck of fifteen identical slides reads as one long slide, however well that one
slide is built. So a slide can declare what it *is*, in the content — `type` —
rather than having a layout assigned by its index (which was tried, twice, and
just made everything small and busy):

| `type` | What it does | Measured at 1440×900 |
| --- | --- | --- |
| *(none)* | the two-column grid | two images at 648×406 |
| `'full'` | this slide is about the picture: the words take a tighter band and the imagery takes what that frees | one image at **848×531** |
| `'statement'` | a beat between sections: no imagery, the claim at title size | claim at **63px** vs 42px |

Both types work by overriding the **same budget** the default layout uses
(`--deck-band`, `--deck-breathe`), so the derived image cap follows automatically
and nothing can overflow.

Two things to know before marking slides:

- **`full` only does anything on a slide with ONE image.** Two images side by side
  are bound by their column width, not by height, so handing them a taller budget
  buys nothing — the first pass at this marked nine two-image slides and changed
  none of them. A slide wanting to be a hero moment needs to carry one screen.
- **The override must out-specify `.stage.is-detail .detail`**, which is where the
  budget is declared. `.detail[data-slide-type="full"]` alone loses the cascade and
  is silently ignored.

Currently marked: 10 `full`, 3 `statement`. Plootus has the least rhythm of the
four decks — it is almost all two-image slides, so there is nowhere for a `full` to
bite. If you want hero moments in it, some of those slides should carry one screen
instead of two.

**A two-column grid, and nothing cleverer.** Two pictures, the same size, sitting
level. Each spans six of the media's twelve columns at the panel's own gutter, which
is exactly half the width, so the pair's outer edges line up with the words above
it. A lone image takes the full width.

The right-hand figure hangs from the right edge rather than the left. It makes no
difference to the placeholders, which fill their columns exactly, but a real
screenshot whose aspect leaves it narrower than its column will still sit flush with
the block's outer edge.

*Three arrangements were tried before this and all three were worse.* An uneven
7-against-5 split that alternated sides; then six arrangements swinging each picture
between the box's floor and its ceiling; then four, with a picture bled off the
window edge. Each added variety at the cost of the thing that actually matters — the
imagery is the evidence in a case study, and it reads fastest when every slide puts
it in the same place, at the same size. Offsets and bleeds made the screens smaller
and the page busier. This is the version to keep.

## The folder tucks away, it does not vanish

Past the opening slide the case study's own material takes the folder's columns —
but the folder itself **slides down to the bottom-left and stays there**, with only
its top edge showing: the year on its tab, the project name, the blurb and the
clipped tools slip. Its cover image ends up exactly at the fold, so the only imagery
on screen is the case study's. It reads as the folder you opened, still on the desk,
and it is the only thing naming the project now that the running header came off the
slides.

It is also **out of the slide swap**. The words and the imagery push left and right;
the folder has one move of its own — dock to tuck and back — and pulling it out of
the swap is what lets that read cleanly rather than as a folder sliding off and
returning while tucked.

**The distance is measured at runtime, not written in CSS.** Three reasons, each of
which produced a visibly wrong tuck first:

| Attempt | What went wrong |
| --- | --- |
| `translateY` from tokens | the panel centres its rows, so where the card rests depends on how tall that slide's imagery is — no token expression gets it right (7px showed instead of 166) |
| Measured before `paintMedia` | read a stale layout and tucked to the wrong depth (278px showing) |
| Measured with `getBoundingClientRect` | the folder inside may still be **mid-flight in from the rail**, and a rect includes that transform — the peek measured 672px and the folder barely moved |

So `setTuck()` runs **last in the render, after the imagery**, and measures with
**layout offsets** (`offsetTop`), which a running animation cannot corrupt. The peek
is the cover's own offset inside the folder, so exactly everything above the image
stays visible whatever the copy does.

It is recomputed on **every** slide rather than cached. A `statement` slide carries
no imagery, which makes the centred block shorter and moves the card's resting
position down; a tuck measured on a taller slide left 54px showing instead of 166.
Caching is safe to skip precisely because the measurement is layout-based and so
ignores the card's own transform.

**And it is re-run whenever the layout settles**, via a `ResizeObserver` on the media
and the slide text plus a `resize` listener. The card's resting position depends on
how tall the slide's imagery is, and *that is not known until the images decode*:
measured at render time the card's top read 408px, and once the pictures laid out it
was 290px — so the folder sat 118px too high and its cover stayed on screen. This
only showed at tall windows, where there is enough slack for the shift to matter; at
900px tall it happened to land correctly, which is exactly the kind of bug that hides
behind a single test viewport.

Verified at 1440×900 and 1440×1240, two decks, three slides each: the cover's top
lands **exactly at the fold** every time and no image caption is ever covered.

On a phone there is no bottom-left corner to tuck into — the panel is a vertical
flow — so the folder steps aside as it always did (`display: none`).

## Motion between slides

Everything moves along one axis, and the direction always means the same thing:
**forward goes left, back comes from the left.**

| Action | What leaves | What arrives | The row |
| --- | --- | --- | --- |
| Arrow / wheel forward | slide out to the left | next slide in from the right | — |
| Arrow / wheel back | slide out to the right | previous in from the left | — |
| Open a project | hero out to the left | slide content in from the right | drops away, down |
| Home / `Esc` | slide content out to the right | hero in from the left | settles back, downward |

**It is a slide, with no fade.** Nothing changes opacity — you watch the content
leave and you watch the next one arrive. That has one hard consequence: the travel
must be a **full screen width** (`--swap-shift` and `--page-shift` are both
`100vw`), because with nothing fading, content still on screen when it is swapped
means watching the words change in mid-air. `100vw` clears any element that starts
inside the viewport whatever its width or position, and `.stage`'s `overflow: clip`
means none of it becomes scrollable — checked in every state, document scroll width
stays exactly the viewport width.

The timing follows from the same constraint: **`SWAP_OUT_MS` in
`project-detail.js` must match `--swap-out-ms` in the stylesheet** (both **680ms**),
so the content is only replaced once it has actually finished travelling off. The
outgoing leg accelerates (`--ease-in`) and the incoming leg settles (`--ease`,
**900ms**), making transitions between slides slower, smoother, and more dramatic.

Those durations and curves provide a calm, deliberate pace across the full viewport. The folder flight
(`FLIP_MS`) and tuck move over **850ms** with a tailored settle curve.

**The first slide header moves down with the folder.** When advancing past the opening
slide (slide 0 to 1), instead of exiting horizontally to the left, the header text moves down
into the fold alongside the docked folder card. When navigating back to the opening slide, the
header text ascends gracefully from below together with the folder rising back into the dock.
Subsequent slides continue to swap horizontally.

`.detail__card` is deliberately **absent from the open/close rule**. `open()`
measures the folder's target rect for its flight in from the rail while `is-open`
is still off; if the card were parked a screen-width to the right at that moment,
the flight would aim off-screen. The card has its own choreography there — the FLIP
— and only joins in for slide-to-slide swaps. Checked after the change: the folder
still travels from the rail at (440, 648) to the dock at (58, 197) and releases to
identity.

**Open and close are one CSS rule.** `.detail:not(.is-open)` puts the slide's
content 158px to the right at 1440 and transparent; `is-open` brings it to rest.
Since the class is added a frame after the panel is shown and removed the instant
Home is pressed, that single rule gives both halves — content arrives from the
right, and leaves to the right.

**The hero has its own class**, `hero-away`, rather than riding on `is-detail`. It
has to: `is-detail` cannot be removed until the folder has finished flying home
(560ms), and the hero needs to start moving on the frame Home is pressed. Verified
on a real close: `is-open`, `hero-away` and `rail-away` all drop at t=5ms, and
`is-detail` follows at t≈1000ms once the flight is done.

**The row settles downward.** The folders are parked below the fold while a project
is open, so coming back is strictly an upward move — but the rail's return uses a
slightly overshooting curve (`--ease-settle`), so it rises past where it belongs and
drops the last few pixels into place. The movement you notice on the way home is
downward.

**A deck swap, not a morph.** The whole slide — its words and its pictures
together — leaves in the direction of travel, and the next one is pushed in from
the other side. `--swap-shift` (`clamp(56px, 7vw, 130px)`) is the distance;
`is-out` carries it away over 190ms, then the new content is painted, takes the
opposite offset instantly under `is-in` (which sets `transition: none`, so only
the travel back to rest animates), and settles. `dir-back` mirrors the whole
thing, so paging back does not feel like paging forward.

There *was* an auto-animate pass here: it recorded every image's rect before the
swap and, for any image the next slide showed again, inverted the difference so the
picture travelled to its new place. It worked exactly as designed and looked wrong —
images sliding diagonally past each other on nearly every step, which read as the
layout malfunctioning rather than as a transition. A slide is one object; it moves as
one. The morph code is gone rather than disabled.

Both releases are guarded twice — `requestAnimationFrame` plus a short
`setTimeout`, both idempotent — so if frames are not being served (a hidden tab, a
throttled renderer) the slide is never left sitting offset and invisible. That
guard is not theoretical: the preview pane used to verify this work does not serve
frames at all, and the timeout is what cleared every swap.

Everything here is skipped under `prefers-reduced-motion`: the transition is
removed and both offsets resolve to `opacity: 1; transform: none`.

## Accessibility

- Real `<a>`/`<button>` elements, semantic `<header>`/`<section>`/`<ol>`, and a
  skip link to the projects.
- The control pill is `visibility: hidden` on the landing, so its buttons are out
  of the tab order until a project is open; inside one they carry
  `aria-label="Previous slide"` / `"Next slide"` and disable at each end.
- A polite live region announces “Project 3 of 4: …” as the rail moves.
- Folder links expose `aria-expanded` / `aria-controls` for the detail panel;
  opening moves focus to the project title, closing returns it to the folder.
- Hover-only content: the folder Role/Scope rows are always visible on touch
  devices and on any `hover: none` pointer.
- All text meets **WCAG AA** contrast (audited in-browser; the muted-text tokens
  and the paper-side accent `--accent-deep` were tuned specifically for this).
- `prefers-reduced-motion: reduce` disables the parallax, the cursor light, the
  reveal offsets and the smooth rail easing (it jumps instead of glides).

## The hero reveal has a timer fallback

`revealHero()` turns on the hero's headline by adding `is-revealed` — the heading
sits at `opacity: 0` until then. That was released on a single
`requestAnimationFrame`, which means a page loaded in a background tab or under a
throttled renderer would show **no headline at all**. Unlike a stuck transform, that
is a hard failure. It now fires on a frame *and* a 140ms timer, and the work is
idempotent. Every other released-on-a-frame state in this codebase already carried
that belt; this one was missing it, and the preview pane — which serves no frames —
is what surfaced it.

## The disciplines line

`PRODUCT DESIGN · UX STRATEGY · DESIGN SYSTEMS · PROTOTYPING` is the **last line of
the type block** — a child of `.hero__type`, directly below the support copy, with a
`border-top` reading as a rule under it. It used to be a grid item of `.hero` pinned
to the bottom row, which put it a long way from the text it belongs to; sitting under
the support copy is both closer to the header and where it reads correctly.

Because it is a flex child of `.hero__type` rather than a grid item of `.hero`,
`grid-column` and `grid-row` do nothing to it — they are deliberately absent from its
rule. Spacing is `margin-top`.

## The portrait

Four columns rather than three, and its frame **capped rather than stretched** to the
hero's full height — `clamp(240px, 42svh, 420px)`. That takes it from 250×580 (ratio
0.43, tall and narrow) to **422×378** (ratio 1.12, wide and shallow). `justify-content:
center` on `.portrait` keeps it on the hero's centre line now that it no longer fills
its column, and the heading is centred against it (321 against 338).

Two ordering traps here, both of which produced silent no-ops on the first attempt:

- **The height must be declared AFTER the base `.portrait__frame` rule.** That rule
  sets `flex: 1`, which means `flex-basis: 0` plus grow — and for a flex item's main
  size that beats a `height`. Declared before it, the cap did nothing and the frame
  measured 531px instead of 378px.
- **It must be scoped to `min-width: 768px`.** Mobile sets its own `aspect-ratio: 4/5`
  crop, and a base-rule height overrode it — the mobile portrait came out at ratio
  0.98 instead of 0.80.

## Header height

`--head-h` is the token the deck panel is positioned against (`top: var(--head-h)`),
so **it has to be at least what the masthead actually measures**. Set it smaller and
the top of a slide slides underneath the header.

Shrinking the header therefore takes two steps, not one: reduce the masthead's own
content (the name is now `1.14rem` against `1.5rem` originally, the role `0.54rem`
against `0.62`, plus tighter padding), *then* bring the token down to match. Measured
after two rounds of this: the masthead renders **45px** against ~68px originally. The
first attempt lowered the token alone and left it 9px shorter than the real header,
which would have slid the top of every slide underneath it.

The reclaimed height goes to the row and the portrait: `--rail-top` moved from
`card-h * 0.55` to `* 0.60`, so **60%** of each folder sits above the fold instead of
55%. The hero heading is also `align-self: center` now rather than hung from the
bottom of its row, so it sits on the **portrait's centre line** — the two read as a
pair, and their centres should agree. Measured 321 against the portrait's 338.

## The landing is deliberately quiet

The landing carries only what it needs: name, role, nav, the hero and the
folders. Removed as distractions: the header positioning sentence, the top-right
`01 / 05` counter, the scroll progress line, the "Selected work" label, the
location line under the portrait, and the control pill itself. The masthead was
cut to roughly two thirds of its original height (`--head-h`). On the landing you move the rail with the wheel, a drag, or the arrow
keys; there is no chrome.

Opening a project brings the pill in at the **bottom centre** — it fades and
rises 0.38s after the folder starts moving, so it never crosses the folder's
path. Closing sends it back down.

## Tools, clipped to the folder

A real folder gets a note paperclipped to it, so `tools` renders as a **slip of
paper clipped to the folder's top edge** rather than another row of metadata. The
clip is a two-curve SVG path in `currentColor`; the slip is paper stock with its own
inset highlight and shadow, rotated 2.2° so it reads as clipped by hand rather than
printed on.

```js
tools: ['Figma', 'Design tokens', 'Storybook']   // two to four reads best
```

Leave the field off and no slip is rendered at all — an absent slip looks
deliberate, an empty one looks broken.

It is a **squarish card** — the label stacked over the list, upright paperclip over
its top edge — sitting **inside the folder at the top-right**.

That corner only became available when the **year moved to the tab**. The history is
worth keeping, because it is the same corner four times over:

| Position | Outcome |
| --- | --- |
| Inside, top-right | covered the **year**, which used to live there |
| Above the folder's top edge | the rail's hover headroom is *the hero's space* — slips collided with the hero's facts row and portrait at every screen size |
| Thin strip beside the tab | no collisions, but the shape was wrong |
| **Inside, top-right — year now on the tab** | ✅ squarish shape, corner free |

**It sits in the top-right corner beside the tab** — 4px down, 4px in from the right
edge — so the clip bites over the folder's top edge.

There was no room for it there until the **tab stopped stretching**. `.folder` is a
column flex container, so the tab's `width: auto` made it fill the whole width and
`max-width: 58%` was the only thing holding it back — a 222px tab on a 358px folder.
`align-self: flex-start` makes it content-sized, which is what a folder tab actually
is: 85–137px depending on the year, leaving the corner free.

**One folder carries a sticky note instead** (`attach: 'note'`): no clip, square
(`aspect-ratio: 1 / 0.94`), pale yellow, tilted the other way — it was stuck on by
thumb, not filed. One note in a row of clips is the point; more would be noise. A
note sits lower than a clipped slip, so it crosses the title band — only that
folder's title reserves room for it.

**Its corner is peeled**, which is what actually makes it read as a sticky note.
Two triangles fill one 20px square at the bottom-right:

- `::after` is the part of the note that is *no longer there* — filled with
  `var(--f-paper)`, the folder's own stock, so the corner reads as having lifted
  away from the card. It picks up whatever tone that folder is set to.
- `::before` is the lifted flap: the same triangle mirrored across the fold
  (`polygon(0 0, 100% 0, 0 100%)` against the cut's `polygon(100% 0, 100% 100%, 0
  100%)`), filled with a gradient running to a lighter yellow for the back of the
  sheet.

The flap's shadow is a **`filter: drop-shadow`, not a `box-shadow`**: both triangles
are cut with `clip-path`, and a box-shadow is clipped away with the shape.

**Each folder is a different stock** (`tone: 'manila' | 'sage' | 'kraft' | 'slate'`).
The folder declares three tokens — `--f-paper`, `--f-paper-2`, `--f-paper-3` — and
everything inside it draws from those rather than the global paper tokens, so one
attribute re-stocks the whole card. The four are kept close in value: a folder
changing colour should register as different card stock, not a different brand. The
sheets that pull out stay white-ish whatever colour the folder is, since they are
documents rather than part of the folder.

Two things this needed:

- **`createDocked` now copies the data attributes.** It clones `className` and
  `innerHTML`, and both the stock and the attachment variant live on `dataset` — so
  without this a folder would have changed colour part-way through its flight into
  the dock. Verified rail and dock match on tone, attachment and rendered paper.
- **The template's JS hook was renamed `data-tools-slip`.** It used to be
  `[data-attach]`, which then collided with the new folder-level
  `data-attach="note"`: the folder is an ancestor and matches first, so
  `querySelector('[data-attach]')` returned the folder and the slip never got
  un-hidden — on exactly the one folder that had the attribute set.

**The clip's overhang is a share of its own height**, not a flat pixel value — the
SVG is 22×54, so the multiplier in `--clip-w × 2.45 × -0.34` is the fraction standing
above the slip. It went 25% → 12% → 34% across three passes, and the lesson was that
the number was never the problem: what mattered was *what is behind the overhang*.
Over dark background it looks like it is dangling at any value; over card stock a
third looks right.

A side benefit: with the slip at the top edge it no longer crosses the title band, so
the title stopped reserving room for it and **all four titles are back on one line**. The head row and the title reserve
room at the right for it; the category has the full width now that the year has
gone, so reserving that space no longer wraps it. `pointer-events: none`, so a slip
cannot eat a click meant for the folder.

**The tab carries the year**, not the running number — it is what you look for when
scanning a shelf of folders, and the number is already in the header counter. The tab
is content-sized (`width: auto`) since "2025 — Present" is not "01".

It comes through on the docked folder too, since `createDocked` clones the card's
markup — checked that it clears the masthead there rather than tucking behind it.

## The folder half-opens on hover

Role and scope are **not printed on the resting card**. They are on the front of
three sheets filed in the folder, which rise **out of its top edge** on hover — each
a different distance with a degree of rotation, so they read as loose paper rather
than one slab. The front sheet carries the words; the two behind it are decorative
(`aria-hidden`).

**Out of the top, not the bottom.** The first version slid them up out of the *cover*
at the bottom of the card, which is the one direction a folder does not open. They
now live in `.folder__body` at `z-index: -1` — `.folder` sets `isolation: isolate`,
so a negative z-index paints under the body's own background without escaping the
folder, which is what lets them hide completely at rest and emerge past the top edge
on hover. The meta sits at the sheet's **top**, since that is the strip that clears
the folder's edge; both rows fit inside the 64px that emerges.

**They are nearly the folder's own width** (92%, `left: 3%` / `right: 3%`), offset a
couple of percent each. They are the documents the folder holds, not notes — the
first version was 52% wide and read as sticky notes.

**They come out 96px and slant right.** 62px was not far enough: the scope row still
sat inside the tab band, and the year tab is opaque paper drawn above the sheets, so
it covered the row's lower half. At 96px both rows clear the folder's top edge —
measured 365→394 and 384→413 against an edge at 430, with the tab at 430→459. All
three sheets rotate the same way by decreasing amounts (2.8° / 1.8° / 0.9°), so the
stack fans in one direction instead of wobbling.

They are suppressed on the docked folder (`.folder--docked .folder__pages`): in a
case study the card sits at the top of the panel, so sheets rising out of it would
push into the masthead.

That buys two things: the hover now *says* something instead of just lifting the
card, and the cover gets the height those two rows used to take (`min-height` 96 →
120px), so the image is bigger at rest.

Two things this needed that are easy to miss:

- **`aria-label` carries role, scope and tools.** The label replaces a link's
  contents for naming, so anything drawn only on hover would never be announced at
  all. The label now reads *"Open SME Banking — Fintech Product Design. Role:
  Product Designer. Scope: … Tools: … Project 1 of 5."*
- **`@media (hover: none)` shows the sheets out by default.** On a touch screen
  there is no hover, so role and scope would be unreachable for a sighted visitor.
  That block has to come *after* the resting rules — same specificity, so source
  order decides, and placed before them it lost silently.

## What the folder shows

Number on the tab, then category and year, title, one-liner, and role and scope —
all of it at rest. There is no "open project" row at its foot: the whole card is
the link, and its `aria-label` already reads *"Open SME Banking — Fintech Product
Design. Project 1 of 4."*

The metadata used to expand on hover, which stole height from the cover and made
the image visibly shrink as you pointed at it. Hover should move the folder, not
reflow its insides, so role and scope are always on show and the cover keeps a
fixed height in every state.

The cover's badge sits at its **top-left**, where it is legible in the sliver of
folder that shows above the fold.

## Stacking order

The folder row is the topmost layer of the page — it is never underneath content:

| Layer | `z-index` |
| --- | --- |
| Control pill | 80 |
| Folder in flight (`.detail.is-flying`) | 70 |
| **Folder row** | **60** |
| Detail panel at rest | 35 |
| Masthead | 20 |
| Atmosphere (grain, vignette, light) | 0 |

The panel is lifted above the row only while a folder is travelling, so the
moving card crosses over the row it came from; at rest the row goes back on top.

## Depth in the deck

The landing has a full atmosphere stack — a teal wash, a "desk light" pooling at
the bottom of the screen, a cursor light, grain, and a vignette. **The deck had
almost none of it**, because the desk light pools behind the row of folders, and
that row is hidden while a project is open. So the case-study view was a flat dark
field with flat cream rectangles on it — which is exactly the "no visual depth"
read.

Two fixes, both light rather than geometry:

- **The light follows the content.** `.detail::before` puts a soft pool back under
  the slide's own imagery, so the screens read as sitting *on* something. Same
  trick as the desk light, moved to where the content now is; it fades in with
  `is-detail`.
- **The imagery is lit from above.** A bright top border and a dark bottom one
  (`rgba(255,255,255,.30)` against `rgba(0,0,0,.38)`) is what makes a flat
  rectangle read as a panel with thickness, and it now casts **two** shadows
  instead of one: a tight contact shadow that says "resting on a surface" and a
  wide ambient one that says "and above it".

## Palette

Carried over from tanishqbafna.com, where `#00a0a0` is the link colour, `#56c6c6`
its lighter partner and `#282846` the dark:

| Token | Value | Used for |
| --- | --- | --- |
| `--ink` / `--ink-raised` | `#10112a` / `#1b1c39` | the ground, a deep indigo in the family of the old site's `#282846` |
| `--paper` / `--paper-2` / `--paper-3` | `#efeae1` / `#e2dbcf` / `#d5cdbf` | the folders — warm, deliberately against the cool ground |
| `--accent` | `#00a0a0` | graphics, indicators, large type, the CTA fill |
| `--accent-soft` | `#56c6c6` | accent-coloured small text **on ink** (AA) |
| `--accent-deep` | `#00615f` | accent-coloured small text **on paper** (AA) |

Three accent tokens rather than one because `#00a0a0` is only ~2.9:1 on warm
paper — fine as a shape, illegible as 10px type. Every text pair on the page was
re-audited after the swap; all 23 pass WCAG AA, the tightest at 4.85:1.

The accent on a folder's number means **intent**, not position: a folder under
the cursor or keyboard focus, and the project currently open. The resting row is
one uniform set of numbers.

The cover and slide SVGs hardcode `#00a0a0` — an `<img>` cannot read CSS
variables, so if you change the accent, run a find-and-replace across
`assets/img/covers/*.svg` and `assets/img/slides/*.svg` too.

## The rail adapts to the screen

Two things make the row feel sized for the display rather than pinned to one
laptop:

**The folder is proportioned, not fixed.** `--card-h` derives from `--card-w`
through `--card-ratio` (1.28), so a folder keeps the same shape — roughly 0.78
wide-to-tall — at every width instead of stretching into a sliver on a large
monitor. It is capped at `70svh` so it can never outgrow the viewport.

**The row fills the screen when the columns genuinely fit.** `fitRail()` in
`landing.js` measures the track on load and on resize: if every folder plus the
closing panel can sit at 300px or wider, it sets `--card-w` and `--end-w` so the
five columns fill the width exactly — no horizontal scroll, nothing clipped off
the right edge, and the arrows disable themselves because there is nowhere to
go. Below that width the override is removed, the CSS clamp takes over and the
row scrolls as before, with the trailing space that lets the last folder reach
the left gutter.

It reads the live column count, so adding or removing a project needs no change
here. Measured: 2560px → five 464px columns, no scroll; 2000px → five 352px
columns, no scroll; 1440px → 358px columns and 1147px of scroll, with the last
folder still landing exactly on the gutter.

Mobile keeps its own taller card — the whole folder is on screen there, and it
needs the height to hold a readable cover under the text.

## How low the folders sit

**The folder has one height everywhere.** `--card-h` derives from `--card-w`
through `--card-ratio`, and sizes the folder in the rail *and* in the dock — the
dock reads `min(var(--card-h), 100%)`, so the two can never drift apart.

**Hovering** brings a folder up **whole** — `--hover-reveal: 1`, plus
`--hover-clear` (12px) so the sheet and shadow behind it clear the edge too. What
you see is the entire card: cover, and the padding the card already carries
beneath it. That padding is only invisible at rest because the folder's foot is
below the fold.

Both lifts are wrapped in `max(14px, …)`. Were a folder ever fully on screen at
rest, the arithmetic would go negative and hover would push it *down*; it always
rises.

`--rail-top` keeps the row **on the bottom edge**, with roughly 45% of each folder
below the fold:

```css
--rail-top: min(82svh, max(72svh, calc(100svh - var(--card-h) * 0.55)));
```

Whichever is lower of 72% down the viewport, or the point that leaves that much
under the fold — bounded at 82svh so an unusually tall window cannot push the hero
out of proportion. Measured at 45% clipped on both 1440×900 and 2000×1125, with
hover clearing the card by 12px in each.

## Dropping this into the live site

Copy `index.html` and `assets/` into the site root (it already expects
`About%20me.html`, `resume.pdf`, `contact.html`, `Daughters.html`). Nothing here
touches or renames existing pages — review `index.html` against your current one
before overwriting it.

## Assumptions made

- **No local repo existed** for tanishqbafna.com on this machine, so this is a
  standalone folder built to match the live site's static conventions rather
  than an in-place edit.
- Nav hrefs, the three social links and `Daughters.html` were taken from the
  live site so they resolve once deployed. Every other project link is `'#'`.
- **`detail` and `blurb` copy is placeholder framing** written from the project
  names, years and notes provided — including the note that the Agentic AI
  Workflow work has no screen designs. Replace it with your own words.
- The Agentic AI Workflow year was given as unspecified, so it reads `Ongoing`.
- The closing panel at the end of the rail (headline, contact link, socials) was
  added to give the trailing space a purpose; delete the `.rail__end` `<li>` in
  `index.html` if you would rather end on the last folder.
