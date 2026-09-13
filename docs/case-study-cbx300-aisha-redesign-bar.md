# CBX300 Aisha case — redesign bar (experience)

**Status:** Echo 8-beat cream GSAP scroll film. Do not polish rejected PR #18 wireframe.  
**Story:** Echo 8-beat spine · representative Aisha · **Experience:** Iris · **Build:** Camila  
**Motion north star:** https://infoviz-cs5764.web.app/ (grammar only)  
**Visual north star:** cream portfolio paper `#f4efe6`, Syne / Outfit, teal `#00a0a0`

---

## Experience promise

Opening SME Banking should feel like the cream portfolio continued: warm paper, editorial type, teal chrome — and like Infoviz: **one continuous scroll film** where each chapter claim lands, then the proof does work under the scroll.

Tanishk can scroll an 8-beat cream film: cover ladder, freelancer phone, sole-prop money, prepare∥approve, control room, web↔phone, light vs heavy, finding pin.

---

## Hard locks

### 1. One continuous story scroll
Chapters are beats in one world, not a TOC of PDF pages. No Pages rail. Tiny progress (`01 / 08`) is enough.

### 2. Infoviz motion (GSAP + ScrollTrigger)
- Claim / Decision first, then viz works under scroll.
- GSAP pin holds the leftover stage under CLOSE / title. `pinSpacing` is the runway. Do not CSS-tall the hold.
- **Window is the scroller.** Nested `.study` + overflow clip + `html { overflow: hidden }` is a Safari / iPad dead film (PR #22 film10).
- Use `visualViewport` / `--vvh` for stage height (PR #24 viewport lock). Never `screen.*` for layout.
- Scrub must **visibly transform**: scale, crop, focus, draw, split, pan. Opacity-only = fail.
- Each important chapter has a **distinct** scrub device.
- Desktop + iPad: pin / scrub. Reduced motion: calm static stack, same order, Decision chips readable.
- Cream bank-calm. No Multiverse glitch theatre on the cream case **body**.
- **Prepare ∥ approve: NEVER fade prepare→approve.** Door/crop or split only.

### 3. Cream + Multiverse parity
Same content. Same major layout / CSS for the case film.  
**Multiverse only glitches header elements** (study chrome / mark / title hitch). Not the cream case body. Not Multiverse theatre on product chapters.

### 4. Decision layer
Each major beat stages **Finding / constraint → Choice → UI proof** before the scrub.  
Captions: one sentence, Fact → what you see.  
No invented research, quotes, or NPS beyond the source HTML. Aisha is a representative example.

### 5. Visual
Portfolio cream paper. Product demos may keep **bank-green** accents from the source **inside UI mock frames**. Bank-calm, editorial, detailed — not a grey tab deck. Beats 1–4 proof stills are a **static Iris 3D art-pass** (PNG/WebP at `assets/img/cbx300/aisha-stage-0{1-4}-*.webp`). Image slots, not a WebGL runtime. Cover / devices / corporate / close stay designed placeholders.

### 6. Meta
Lead product designer. Jan 2026-present. DS complete. Majority of screens / flows through handoff.  
Lisa Charlie = demo brand. Aisha = story persona only.

---

## Chapter map (Echo 8-beat)

| # | id | Title | Iris slot | Motion |
|---|---|---|---|---|
| 0 | `cover` | Banking that grows with the business. | title+ladder | title pin + ladder ken-burns |
| 1 | `freelancer` | Did I get paid. Can I pay. | phone pay | phone-frame focus scrub |
| 2 | `sole` | How much can I safely spend. | four-balance+beneficiary | available scale-up + beneficiary crop |
| 3 | `ten` | Prepare is not approve. | approvals door+list | door/crop or split prepare∥approve. NEVER fade. |
| 4 | `mid` | Control room. Safe handoffs. | waiting-on-me+permissions | control-room pin + matrix draw |
| 5 | `devices` | Same task. Device-fit. | web∥phone | web↔phone morph |
| 6 | `corporate` | Control without day-one corporate weight. | light vs heavy | split-compare scrub |
| 7 | `close` | A bank she does not outgrow. | finding pin | finding pin / ladder complete |

On page say prepare / approve, not maker-checker jargon.

Cover through corporate carry Decision chips (risk → change → UI). Close is a finding.

---

## Scroll reliability (film10 + viewport lock)

- `html.is-study-film` lets the **window** scroll. `.study` is relative, overflow visible.
- `CaseScrollKit` binds `scroller: null` (viewport).
- Stage height from `--vvh` / `layoutViewport.height()`, never `screen.height`.
- Touch: `ScrollTrigger.normalizeScroll` on the window.
- iPad Settings → Accessibility → Motion → Reduce Motion off to feel scrub.

---

## Done when

Tanishk can scroll cream `?theme=light&open=sme` and feel an 8-beat cinematic story with Aisha’s risks and choices intact. Multiverse matches film content. Header-only glitch. Scrub works on desktop and iPad Safari with Reduce Motion off. Beats 1–4 show Iris 3D stills when the WebPs land. Other beats stay placeholders until Figma exports land.
