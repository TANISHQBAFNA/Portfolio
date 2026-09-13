# CBX300 case — redesign bar (experience)

**Status:** PR #18 rejected by Tanishk (2026-09-12). Do not polish the wireframe. Rebuild to this bar.  
**Story:** Echo simpler sell pack · **Experience:** Iris · **Build:** Camila  
**Motion north star:** https://infoviz-cs5764.web.app/  
**Visual north star:** cream portfolio landing (`landing.css` — warm paper, Syne/Outfit, teal)

---

## Why the first ship failed (product language)

1. It felt like a **document with tabs**, not a scroll film.
2. “Cinematic” was mostly **opacity fades** on pinned chapters — scroll didn’t transform the argument.
3. **No Figma art** — wall of grey “Exports pending” instead of CBX300.
4. **Cool grey slabs** clashed with warm cream portfolio paper.
5. Under ~960px the film became a **static stack**, so many walks never felt motion.

---

## Experience promise

Opening SME Banking should feel like the cream portfolio continued: warm paper, editorial type, teal accent — and like Infoviz: **one continuous scroll story** where each chapter claim lands, then the proof does work under your scroll.

---

## Hard redesign locks

### 1. One continuous story scroll
- Chapters are **beats in one world**, not a TOC of separate PDF pages.
- Kill or demote the sticky Pages rail as the primary wayfinding (optional tiny progress is fine).
- Cover → ladder → roles → approvals → money → permissions → grammar → close as one scroll film.

### 2. Infoviz motion grammar (GSAP + ScrollTrigger)
- **Claim / Decision first**, then viz works under scroll. Numbered chapter, then proof. Steal Infoviz grammar only — not housing maps.
- **GSAP pin** holds the leftover stage under CLOSE/title. `pinSpacing` is the runway. Do not CSS-tall the hold (double spacer = a document with no film).
- Scrub must **visibly transform** what you see: scale, crop, focus, draw, split, pan. Opacity-only fades are a fail.
- Caption sync: one live caption with the frame that proves it. Sequential swap, no dual subtitles.
- Desktop + laptop: continuous pin/scrub film. Tablet keeps pin/scrub (one-column overlay proofs), not a dead stack. Reduced-motion = calm static stack, same order, Decision chips readable.
- Cream bank-calm. No Multiverse glitch theatre on cream case pages.

### 3. Cream portfolio vibe (not briefing-deck grey)
- Field: warm `--cream` / `--paper` end-to-end. No cool `#F3F4F6` cover hero; no `#e7e9ed` wireframe slabs as the main material.
- Type: Syne / Outfit / teal `#00a0a0` — same as landing.
- Layout: **editorial stage** — full-bleed or asymmetric proof; copy as claim/caption overlay or sparse left, not permanent 40/60 wireframe + empty boxes.
- Chrome: sparse study chrome that matches ProjectStudy / cream, not a Notion-style page list.

### 4. Real proof art
- Primary slots need **Figma exports** before calling UX done. Placeholders only as brief exceptions, never the whole case.
- Export into `assets/img/cbx300/` per node IDs in the build brief.

### 5. Echo simpler copy (locked)
**Hook:** Banking for a company, not for one person.  
**Promise:** A small-business bank app that grows with the company — from one person who does everything, to a team with different jobs — without learning a new product.  
**Product line:** CBX300 · web + phone · 636 screens · demo brand: Lisa Charlie

| # | Simple title | One-line body |
|---|---|---|
| 1 | One product for every size of small business | A freelancer and a 50-person company are not the same day-to-day — but they should not need two banks. Complexity shows up only when the business needs it. |
| 2 | Three jobs: owner, maker, approver | Early on, one person wears all three hats. Later, three people. Design for the jobs, not the job titles. |
| 3 | Approvals get their own door | For some people, approving is the work. So it sits in the main menu (and on the phone bar) — not buried in a bell. |
| 4 | Show the real money, catch mistakes early | A business account has more than one “balance.” And if a salary file has bad rows, show that before someone signs — not after. |
| 5 | Who can do what — in a clear grid | Permissions are verbs (start, check, view, send, approve), not a pile of switches. One screen that still makes sense with one user or many. |
| 6 | Every money path ends the same way | Review → one-time code → done. Same three steps on payments, deposits, cards, loans — so people don’t relearn the ending. |

**Caption voice:** One sentence. Fact → what you see.  
Examples: “Approving is the job — so it has its own button, not a notification.” · “Bad rows turn red before you sign.” · “Four balances on the card — one number would lie.”

**Avoid on page:** entitlements, maker-checker, mental model, conditional complexity, dual control, segmented control, portfolio (unless accounts list), seamless, intuitive, fake %.

**Keep:** Lisa Charlie = demo only. No invented NPS / time-saved / adoption.

### 6. Close on a finding
- Last beat is volume / what this produced — not another empty grid.
- Prefer real contact-sheet or honest scaled proof when exports exist.

### 7. Decision layer (UX/UI why)
Every chapter (ladder, roles, approvals, money, permissions, grammar) stages **Finding → Choice → UI proof**. Not claim → screen only. Cover has no Decision chip. Scale stays close-on-finding.

**No invented research.** Echo locked these Finding → Choice pairs. Prefer them over any earlier draft wording. One sentence each on film (grammar finding is Echo’s two-sentence lock). Ruled-out is quiet secondary only where Echo included it.

| Chapter | Finding | Choice | Ruled out (quiet) | UI proof |
|---|---|---|---|---|
| Ladder | Small businesses grow — yesterday’s freelancer is tomorrow’s payroll team. | One platform that gets more complex only when the business does — not five separate products. | — | Same accounts layout at both ends of the ladder (placeholders OK). |
| Roles | Early on, one person owns, pays, and approves. Later, those are three different people. | Design for those three jobs, not for job titles — so one login and many logins both fit. | — | Three role cards + web vs phone cues. |
| Approvals | Approving other people’s money is the job, and it is a legal act — you must see every line you sign. | Approvals get their own door, and batch approve keeps each row visible. | bury under Payments, or select-all with no line of sight. | Nav Approvals + Approve (N) with rows still visible. |
| Money | A business account has more than one “balance,” and a salary file can hide bad rows until after you sign. | Show four balances on the card (available first), and surface failures before the signature. | one big number, or a clean list that fails after submit. | Failed-rows crop, then four-balance card (placeholders OK). |
| Permissions | Who can do what is many verbs per product — a step-by-step wizard collapses when the list gets long. | A grid of verbs (start, check, view, send, approve) on one screen. | one question per screen. | Verb matrix. |
| Grammar | Dozens of money forms, same consequence — money moves or a mandate changes. Relearning the ending breaks trust. | Every money path ends the same way: check → one-time code → result. | — | Three-step strip + empty states that offer the next action. |

On-film: cream editorial chip in the claim column (label Finding, then finding line, then Choice). Lands before the proof scrub. Ruled-out is a quiet secondary line under the chip where Echo included it. Captions stay proof-sync. Keep Echo’s six chapter titles + one-line bodies.

Product language belongs in this doc. Stay off the page: entitlements, maker-checker, mental model, dual control, seamless, intuitive, fake %.

### 8. Motion variety lock
Each important chapter has a **distinct scrub storytelling device**. Opacity-only = fail.

| Beat | Device (Infoviz analog) |
|---|---|
| Cover | Quiet hold, then soft scale-in of web + phone (boot calm). |
| Ladder | Horizontal stage walk L→R; freelancer vs medium focus; pull-back; crop to accounts pair. |
| Roles | Cards assemble; one role enlarges while others recede; device cue morphs web desk vs phone. |
| Approvals | Crop/zoom the Approvals door, then wipe/split to batch Approve (N) with rows visible. |
| Money | Fail-rows punch-crop first; slide to four-balance card with sequential callouts. |
| Permissions | Matrix draws cell-by-cell (`scaleY`); compose-shrink to solo-user grid. |
| Grammar | Three-step strip as pinned hard beats (Review / OTP / done); empty-state grid fans in. |
| Scale | Contact sheet zoom-out / mosaic reveal. Close on finding. |

---

## Build path

- New branch from main (do not keep polishing PR #18 wireframe as the ship).
- Camila may reuse GSAP kit ideas, but **layout + motion intent must match this bar**.
- Iris visual pass + Tanishk walk before merge.

## Done when
Tanishk can scroll cream SME Banking and say it feels like **portfolio vibe + Infoviz film**, with real frames and Echo’s plain words — not a grey tabbed brief.
