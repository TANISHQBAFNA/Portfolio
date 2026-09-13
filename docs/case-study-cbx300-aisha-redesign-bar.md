# CBX300 Aisha case — redesign bar (experience)

**Status:** Full opened-case rebuild from the Aisha source HTML. Do not polish the eight-beat flatten.  
**Story:** Aisha CBX300 case (`docs/source/cbx300-aisha-case.html`) · **Experience:** Iris · **Build:** Camila  
**Motion north star:** https://infoviz-cs5764.web.app/ (grammar only)  
**Visual north star:** cream portfolio paper `#f4efe6`, Syne / Outfit, teal `#00a0a0`

---

## Experience promise

Opening SME Banking should feel like the cream portfolio continued: warm paper, editorial type, teal chrome — and like Infoviz: **one continuous scroll film** where each chapter claim lands, then the proof does work under the scroll.

Tanishk can scroll and feel cinematic chapter-by-chapter storytelling with Aisha’s risks and choices intact.

---

## Hard locks

### 1. One continuous story scroll
Chapters are beats in one world, not a TOC of PDF pages. No Pages rail. Tiny progress (`01 / 15`) is enough.

### 2. Infoviz motion (GSAP + ScrollTrigger)
- Claim / Decision first, then viz works under scroll.
- GSAP pin holds the leftover stage under CLOSE / title. `pinSpacing` is the runway. Do not CSS-tall the hold.
- **Window is the scroller.** Nested `.study` + overflow clip + `html { overflow: hidden }` is a Safari / iPad dead film (PR #22 film10).
- Use `visualViewport` / `--vvh` for stage height (PR #24 viewport lock). Never `screen.*` for layout.
- Scrub must **visibly transform**: scale, crop, focus, draw, split, pan. Opacity-only = fail.
- Each important chapter has a **distinct** scrub device.
- Desktop + iPad: pin / scrub. Reduced motion: calm static stack, same order, Decision chips readable.
- Cream bank-calm. No Multiverse glitch theatre on the cream case **body**.

### 3. Cream + Multiverse parity
Same content. Same major layout / CSS for the case film.  
**Multiverse only glitches header elements** (study chrome / mark / title hitch). Not the cream case body. Not Multiverse theatre on product chapters.

### 4. Decision layer
Each major Aisha moment stages **Finding / constraint → Choice → UI proof**.  
Risk card = finding. “What I changed” = choice. Demo UI = proof.  
No invented research beyond the source HTML.

### 5. Visual
Portfolio cream paper. Product demos may keep **bank-green** accents from the source **inside UI mock frames**. Bank-calm, editorial, detailed — not a grey tab deck. Placeholders OK for Figma art.

### 6. Meta
Lead product designer. Jan 2026–present. DS complete. Majority of screens / flows through handoff.  
Lisa Charlie = demo brand. Aisha = story persona only.

---

## Chapter map

| # | id | Title | Job on film |
|---|---|---|---|
| 0 | `cover` | Banking that grows with the business. | Hook, promise, quote, 259 / 377 / ~147. Soft device compose. |
| 1 | `aisha` | Meet Aisha. | Representative example (disclaimer). Questions evolve. |
| 2 | `ladder` | Five stages of the same business. | Independent professional → Medium. One person → One platform → Finance team. |
| 3 | `roles` | I designed for roles, not one user. | Owner / Payment maker / Approver. |
| 4 | `promise` | How the product keeps its promise. | Start simple → Give context → Share work safely → Prevent errors → Stay familiar. |
| 5 | `pay-today` | Can I afford to pay this supplier today? | Risk: one balance misleading. Change: available / current / held / uncleared. Available leads. |
| 6 | `supplier` | Pay the right supplier. | Risk: long form mistakes. Change: start with payment type. |
| 7 | `beneficiary` | Did the system use the right beneficiary? | Risk: invisible automation. Change: confirm handoff / pre-fill message. |
| 8 | `approve` | My team can prepare. I need to approve. | Risk: submitted ≠ completed. Change: clear states; Approve (N) with rows visible. |
| 9 | `validation` | Tell me what is wrong before I approve. | Risk: errors too late. Change: validation in review (128 tx / 3 failed). |
| 10 | `access` | My team needs access, but not all access. | Risk: role name not enough. Change: person + action + financial scope. |
| 11 | `ui` | Calm when reading. Clear when acting. | Hierarchy / Colour / Actions / Layout. |
| 12 | `devices` | Same goal. Different moment. | Web vs mobile comparison table. |
| 13 | `system` | One system, four habits. | Navigation, Forms, Information / states, Familiar endings. |
| 14 | `outcome` | A bank that does not need replacing. | Volume finding. Next-test bullets. Footer disclaimer. |

Cover and outcome have no Decision chip. Aisha is context (disclaimer readable). Ladder through system each stage Finding → Choice → proof.

---

## Motion variety

Each important chapter has a distinct scrub. Opacity-only = fail.

| Beat | Device |
|---|---|
| Hero / cover | Soft device compose: web scale-in, phone offset compose. |
| Meet Aisha | Quote pull + question list step-up (y / scale, not fade-only). |
| Ladder | L→R 3D stage walk, then pull-back to accounts pair. |
| Roles | Focus cycle owner → maker → approver; others recede. |
| Promise flow | Step-advance scrub across five promise cards. |
| Afford to pay | Risk card, then four-balance punch. Available leads (scale). |
| Right supplier | Type chips first; details wipe in when a type is chosen. |
| Right beneficiary | Confirm-handoff card wipe; pre-fill message stays visible. |
| Team approves | Approvals door crop, then wipe to Approve (N) with rows. |
| Validation | Fail-row punch-crop (128 / 3). Bad rows enlarge. |
| Access | Three-step wizard: person → action → scope. |
| UI strategy | Four cards sequential scale (hierarchy, colour, actions, layout). |
| Web vs mobile | Split compare: web column vs phone column, table rows light. |
| System | Four pillars sequential light-up. |
| Outcome | Contact-sheet zoom-out / mosaic. Close on finding. |

Reduced motion: same chapter order, Decision chips and risk / change cards readable, no pins.

---

## Scroll reliability (film10 + viewport lock)

- `html.is-study-film` lets the **window** scroll. `.study` is relative, overflow visible.
- `CaseScrollKit` binds `scroller: null` (viewport).
- Stage height from `--vvh` / `layoutViewport.height()`, never `screen.height`.
- Touch: `ScrollTrigger.normalizeScroll` on the window.
- iPad Settings → Accessibility → Motion → Reduce Motion off to feel scrub.

---

## Done when

Tanishk can scroll cream `?theme=light&open=sme` and feel cinematic chapter-by-chapter storytelling with Aisha’s risks and choices intact. Multiverse matches film content. Header-only glitch. Scrub works on desktop and iPad Safari with Reduce Motion off.
