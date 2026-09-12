# CBX300 case study — page-by-page build brief

> **2026-09-12:** First implement (PR #18) rejected on experience. Ship from the redesign bar: [`case-study-cbx300-redesign-bar.md`](case-study-cbx300-redesign-bar.md) (Echo simpler copy + Infoviz motion + cream vibe). Do not polish the wireframe.


**For:** Portfolio opened-case experience (center folder with pages)  
**Product language:** Hiring-manager skim first; no unexplained jargon  
**Story:** Echo · **Experience:** Iris · **Build:** Camila  
**Source MD:** Banking for a business, not a person (CBX300 SME banking)  
**Brand in files:** Lisa Charlie bank = **demo only** (never imply live client)  
**Outcomes:** No invented NPS / time-saved / adoption. Leave results blank until Tanishk supplies real numbers.

### Meta (fill before publish)
| Field | Value |
|---|---|
| Role | Lead product designer — design system, end-to-end screens (web + mobile), through developer handoff |
| Duration | Jan 2026 – present |
| Status | Design system complete; majority of functional screens and full user flows designed through handoff (ongoing) |

### Sell locks
- **Hook:** Banking for a business, not a person.
- **Promise:** One SME platform that grows from solo owner–maker–approver to a finance team — same mental model.
- **Proof line:** CBX300 · web + mobile · 636 screens · Lisa Charlie demo brand
- **Caption voice:** One sentence. Fact → what you see. Never “clean / seamless / intuitive.”

### Experience locks
- Opened case = **center folder with pages** (softboard dead).
- First paint (~5s): cover claim readable.
- Crop to the argument; diagrams for reasoning; screens for proof.
- Empty image slots: designed “export pending” placeholder — not broken chrome.
- Loading: quiet hold on page chrome; don’t flash raw HTML.
- Error: “Couldn’t load this frame” + retry — bank-calm, not glitch theatre (unless case is opened inside Multiverse skin).
- **Motion (locked 2026-09-12):** GSAP + ScrollTrigger cinematic scroll storytelling. The case reads as a film you scroll through — chapters pin, frames reveal, captions land with the beat — not a flat stack of screenshots. Prefer scrubbed timelines tied to scroll; keep reduced-motion as a calm fade/stack fallback.
- **Scroll reference (locked 2026-09-12):** Infoviz https://infoviz-cs5764.web.app/ — chapter rhythm, claim-first, progressive focus (grammar only).
- **Images (locked 2026-09-12):** Place Figma exports into the image slots (node IDs in this brief). Placeholders until each export lands are OK; do not block page chrome on missing art.
- **Brief status:** Tanishk OK’d this brief (2026-09-12). Camila may implement on a new branch; merge to main only after verified working.

---

## Motion — cinematic scroll (GSAP)

**Job:** Make hiring managers *feel* the story while they scroll — ladder → roles → approvals → money → permissions → grammar → scale.

**Stack:** GSAP + ScrollTrigger (Camila confirms cost/bundle). Prefer one shared timeline kit reused per page, not one-off hacks.

**Beats (product language):**
1. **Cover** — quiet hold; hook readable before motion starts.
2. **Enter chapter** — pin or sticky chapter title; claim lands first, then proof image.
3. **Reveal** — screens / diagrams scrub in with scroll (parallax light, not carnival).
4. **Caption sync** — caption appears when the frame is the argument, not before.
5. **Chapter exit** — soft release into next page; no Multiverse glitch theatre on cream case pages.
6. **Reduced motion** — OS prefers-reduced-motion: no pins/scrub; static stack with same order and captions.

**Do not:** Autoplay video loops as the primary story; infinite bounce; motion that hides the claim.

**Reference (locked 2026-09-12):** [Infoviz CS5764 — Virginia & Mumbai housing](https://infoviz-cs5764.web.app/)

Steal the *storytelling grammar*, not the housing topic or map chrome:

1. **Numbered chapter beats** — short claim title per scroll stop (e.g. “01 · Ladder”), then one sentence that lands before the proof frame.
2. **Claim first, viz second** — the argument is readable; the image/diagram proves it as you scrub.
3. **Progressive focus** — light the part that matters (ends of the ladder, one role, one approval door), then pull back to the whole.
4. **Same question, next chapter** — each page answers one clear question; the next page continues the thread (roles → approvals → money), like Infoviz’s Virginia → Mumbai handoff.
5. **Editorial calm** — cinematic pin/scrub, not carnival; cream case stays bank-calm (no Multiverse glitch).
6. **Close on a finding** — last page is “what this produced / next,” not more decoration.

Camila: match Infoviz’s chapter rhythm + caption sync with GSAP ScrollTrigger; CBX300 content and Figma frames stay ours.


---

## Page map (build order)

| # | Page id | Chapter title | Primary claim |
|---|---|---|---|
| 0 | `cover` | Cover | Hook + 636 screens, one system |
| 1 | `ladder` | SME is a ladder, not five products | One platform grows with the customer |
| 2 | `roles` | Three roles: owner, maker, approver | Roles, not job titles; web ≠ phone |
| 3 | `approvals` | Approvals are the job, not a notification | Front door + batch with lines still visible |
| 4 | `money` | Money needs honest numbers | Four balances; fail before signature |
| 5 | `permissions` | Permissions as a grid of verbs | Visible verbs, not a wizard |
| 6 | `grammar` | Same ending every time | Review → OTP → Outcome (+ empty as designed) |
| 7 | `scale` | What this produced / next | Volume proof; honest next steps |

Optional footnote strip (not a page): How it was built (tokens, freeze protocol) — one short line, no MCP theatre.

---

## Page 0 — Cover

**Job:** First blink for a hiring manager.  
**Layout:** Full-bleed calm grey `#F3F4F6`. Web dashboard at a slight angle; mobile dashboard overlaps lower-right. Flat, no glossy device chrome.  
**Type block:**
- Hook (large): Banking for a business, not a person.
- Sub: Designing CBX300 — SME banking across web and mobile
- Meta row (small): Role · Duration · Status (Team omitted for now — optional)
- Proof: 259 web · 377 mobile · ~147 flows

**Image 1**  
- Make: Export Web Dashboard `39409:121739` + Mobile Portfolio `14430:56021`; compose.  
- Caption: *CBX300 — SME banking across web and mobile. 636 screens, one system.*

**Empty:** Silhouette frames + “Exports pending” if assets missing.  
**Success:** Cover reads without scrolling on laptop height.

---

## Page 1 — Ladder

**Job:** Prove SME isn’t one customer; product must grow without migration.  
**Layout:** Short intro (2–3 sentences from MD §1). Then diagram full width. Then side-by-side screens.

**Copy spine (keep short):**
- Banks sell “SME”; day-to-day freelancers and mid-market finance teams are not the same.
- They are stages of the same customer.
- Complexity is conditional on the business — always in the system, visible when data/entitlements call for it.

**Image 2 — ladder diagram (draw, don’t screenshot)**  
- Five stages L→R: Freelancer → Sole prop → Micro → Small → Medium  
- Above each: how many people touch the account  
- Bar under: *one platform*  
- Caption: *These are not five audiences. They are five stages of the same customer.*

**Image 3 — same screen, both ends**  
- Export: Accounts Portfolio Detail View `29599:151564` + Accounts Portfolio Form `21058:88167`  
- Caption: *The same layout has to work for a business with no accounts and a business with four.*

**Do not:** Paste the full employee-band table unless Tanishk adds a real bank mix number.

---

## Page 2 — Roles

**Job:** Stop saying “the user.”  
**Layout:** Three columns (owner / maker / approver). Device cue under each (web desk vs mobile gaps). Optional: web dashboard beside mobile portfolio as supporting strip.

**Claims:**
- Owner needs one honest cash answer.
- Maker needs speed and no re-typing.
- Approver needs queue clear on a phone.
- Same three roles can be one login or three.

**Image 4 — three roles, two devices (draw or annotate)**  
- Caption: *One person in a freelance business. Three people with three permission sets in a medium one.*

**Supporting exports (optional strip):** Web Dashboard `39409:121739` · Mobile Portfolio `14430:56021`

---

## Page 3 — Approvals

**Job:** Approving is work with an address.  
**Layout:** Two beats — (A) permanent nav, (B) batch select.

**A — Front door**  
**Image 6** — Crop web sidebar `Pending Approval · 15` from `39409:121739` + mobile Task tab with dot from `14430:56021`  
- Caption: *On both platforms, approval has a permanent address. It is never something you have to go looking for.*

**B — Batch**  
**Image 7** — Web Multi Select Pending Approvals `36784:110703` (ring `Approve (6)`)  
- Caption: *The action is labelled with the number it will perform. No one approves a mystery quantity.*

**Image 8** — Mobile `2 Selected` `11906:24389` at phone width  
- Caption: *On mobile the whole screen changes mode, and the actions sit in thumb reach.*

**Ruled out (one line under images):** Select-all with no per-row visibility — approval is a legal act.

---

## Page 4 — Honest money

**Job:** Trust before signature; balance isn’t one number.  
**Layout:** Failure crop first (urgency), then four-balance card.

**Image 9 — fail before sign**  
- Tight crop: `Total 128 Transactions · 3 Failed System Validation` from approvals screens  
- Caption: *Three bad rows in a file of 128, surfaced before the approver signs rather than after.*

**Image 10 — four balances**  
- Crop account card from `21058:88167`; annotate: spendable / booked / blocked / pending  
- Caption: *“Balance” is four different numbers to a business. Showing one of them would be a lie.*

**Optional Gulf beat (caption only, not a seventh chapter):** Conventional | Islamic as a top-bar mode — *A mode that reframes the product, not a second menu tree.* Export pair with Islamic Accounts Portfolio `40799:120879` if used.

---

## Page 5 — Permissions

**Job:** Hardest screen; show verbs, not switches.  
**Layout:** Full-bleed matrix, then “scales down” compose.

**Image 11** — Entitlements matrix full width `39899:119009`  
- Caption: *Initiate, Verify, Inquire, Release, Authorize — for every function, scoped to specific accounts. Visible instead of remembered.*

**Image 12** — Same matrix for one-person business (compose if needed)  
- Caption: *The same screen serves one freelancer and a fourteen-person finance team.*

**Ruled out (one line):** Wizard one question per screen — collapses at fifty permissions.

---

## Page 6 — Grammar (+ empty as proof)

**Job:** Learn the ending once; empty is week one.  
**Layout:** Three-up strip, then empty-state grid.

**Image 14 — Review → OTP → Outcome**  
- `22789:130771` → `22789:130642` → `22789:130678`  
- Caption: *Every money flow ends the same three ways. Learn it once, trust it everywhere.*

**Image 15 — empty grid**  
- Mobile: `15050:52766`, `15050:53061`, `15253:50431`, `14295:48651` (and peers)  
- Caption: *Week one for every new customer. Each one offers the next action instead of apologising.*

**Image 16 — web grid rule (optional on this page or footnote)**  
- Overlay on Send Money `22789:130771`: 256 sidebar, 3×464 columns, right column *context only, never inputs*  
- Caption: *Three columns. The right one holds balances and offers, never questions.*

---

## Page 7 — Scale / next

**Job:** Prove volume; stay honest about what’s next.  
**Layout:** Contact sheet + short “What I’d do next” (from MD §7). Results section **omit** until real numbers exist.

**Image 18 — scale**  
- Zoom-out of Screens · All Journeys contact sheet  
- Caption: *259 web screens. 377 mobile screens. One grammar.*

**Image 17 — system poster (optional)**  
- Compose from Colours `8513:18195` + Master Index `18799:2`  
- Caption: *One system, two platforms, multiple banks. Consistency generated rather than reviewed.*

**Next (bullets, short):** Validate entitlements with real admins · Instrument approval queue · Push minimum-data further · Close tokens-to-code loop.

---

## Asset checklist (Figma → export)

| Brief # | Node / source | Owner |
|---|---|---|
| 1 Cover | `39409:121739` + `14430:56021` compose | Design |
| 2 Ladder | Draw | Design |
| 3 Same screen | `29599:151564` + `21058:88167` | Design |
| 4 Roles | Draw / annotate | Design |
| 6 Approvals nav | Crops from dashboard nodes | Design |
| 7 Web batch | `36784:110703` | Design |
| 8 Mobile batch | `11906:24389` | Design |
| 9 Validation | Crop from approvals | Design |
| 10 Balances | Crop `21058:88167` | Design |
| 11 Matrix | `39899:119009` | Design |
| 12 Matrix solo | Compose | Design |
| 14 Three beats | `22789:130771/130642/130678` | Design |
| 15 Empty grid | Min-data nodes | Design |
| 16 Grid overlay | `22789:130771` + overlay | Design |
| 17 Tokens | `8513:18195` / `18799:2` | Design |
| 18 Contact sheet | All Journeys zoom-out | Design |

**Leave out:** Raw library page dumps; wireframe archaeology; anything that needs a paragraph before it makes sense.

---

## Build notes for Camila

1. New branch per work; merge to main only after Tanishk OK (portfolio workflow lock).
2. Case opens as folder → pages in order above; URL/deep-link per page if study router already supports it.
3. Project curtain (Multiverse): keep bottom-left name + glitch hitch when opening this case from Multiverse; cream case chrome stays production-calm.
4. Don’t block ship on every export — ship structure with designed placeholders, swap assets as exports land.
5. Briefs stay product language; no code in the published case.

---

## Done when

- [ ] Meta fields filled  
- [ ] Cover readable in ~5 seconds  
- [ ] Six chapter pages + cover + scale  
- [ ] Captions claim decisions (Echo voice)  
- [ ] No invented outcomes; Lisa Charlie labelled demo  
- [ ] Tanishk walked the opened case once and OK’d merge  

