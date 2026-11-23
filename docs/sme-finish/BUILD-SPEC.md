# CBX300 SME case study: finish build spec (S03 to S06 + end)

Owner: Iris (CDO). Builder: Cursor cloud agent. Approved spine: S01 cover → S02 Aisha → S03 "How our bank answers her" → S04 "She grows, the app grows" → S05 "Trust & team" → S06 "Outcome & my role" → end transition.
Design language is fixed. **Continue it exactly. Do not redesign S01–S03.**

## 0. Source of truth and branch plan

- **Design source:** `TANISHQBAFNA/Portfolio`, branch `iris/cbx300-s03-one-point-at-a-time` @ `b604d9e` (Oct 3 2026, 3:03 PM IST). It is the newest commit on any branch. It contains the full home (normal light/dark + Multiverse print/dark) and the case template with S01–S03.
- The home HTML Tanishk shared (landing.css `aeo35`, landing-multiverse.css `mv14`) is commit `8c1bb97` (Sep 27) on the same lineage. Between that commit and `b604d9e`, only the case files changed (`cbx300-case*.css/js`, `cbx300-answers.js`, `iris-motion*.js`, `project-study.js`, checks). The home design language is identical.
- PR #27 (cover) is already an ancestor of #31 (no commits missing). The stack is #27 ⊂ #28 ⊂ #30 ⊂ #31.
- **Fold:** create `iris/cbx300-sme-finish` from `b604d9e`. Merge `origin/main` into it (brings PR #29's zero-build serve/check, keeps GSAP 3.12.5) and resolve any conflict in favour of the case files on the branch. Open ONE draft PR against `tanishq-portfolio`, titled "CBX300 SME case study: full story S01–S06". In the body, say it supersedes #27, #28, #30 and #31. Do not close those PRs and do not merge; Iris does both after sign-off.
- Do not touch the landing files (`landing*.css/js`, `beyond-transition.*`, `iris-motion*.js`, `folder-card.js`, `project-rail.js`) except for the one link fix in §1.

### Tokens (read from the branch; reuse, never hard-code new ones)
- Fonts: display `Syne 700/800` (`--font-display`), body `Outfit`, story serif italic `Newsreader` (questions, pointer quotes).
- Normal light: paper `#f4efe6`, ink/coffee `#1E1510`, muted `#3d322c`, amber `#E8A96B` / `#B8741C`, terra `#C8664A`, paid `#3E7A36`.
- Normal dark: page `#1E1510`, paper-on-dark `#2a221c`, ink `#f4efe6`.
- Multiverse dark: ink `#0e1018`, paper `#161822`, text `#f3eee4`, cyan `#3de8f5`, glitch plates on display type.
- Multiverse print: paper `#f3eee4`, ink `#0e1018`, teal `#00a0a0`/`#56c6c6`, glitch plates, no dark fills.
- Radii in case-study chrome: 2–4px for frames, panels and chips (sharp, small). Existing 999px pills in the S02/S03 HUD stay as they are. Product screens keep their own 24px radius because they are product UI.
- Theme classes: `html.is-light-home(.is-dark)` = normal; `html.is-multiverse.is-print` / `html.is-multiverse.is-dark` = Multiverse. URL: `?theme=light|dark`, add `&beyond=1` for Multiverse, `&open=sme` opens the case.

### Assets
The 27 masked 2x PNGs are already committed in `assets/img/cbx300/` on this branch. Serve 2x PNGs with `width/height` set to the 1x size. Add `.webp` siblings (quality 90) and use `<picture>`. Copy the illustrations as they are. The mapping is in `assets/img/cbx300/README.md`.

## 1. Fix first: theme bugs in S01/S03 (both reproduced Nov 23)

**Symptom:**
- With `index.html?beyond=1&theme=dark&open=sme`, the S03 stage is cream with no cyan skin, and the S01 cover loads on cream paper with half the title missing.
- With `?theme=dark` (normal dark), S03 is also cream.
- With `?beyond=1&theme=light` (Multiverse print), the case renders dark instead of print.

**Root causes:**
1. `index.html` never links `assets/css/cbx300-case-multiverse.css`; only `index-multiverse.html` does. The `?beyond=1` path therefore has no case skin. *Verified:* adding the link fixes MV dark (cover dark and glitched, S03 cyan HUD and dark stage).
2. `cbx300-case-multiverse.css` styles `html.is-multiverse` as dark only. There is no `html.is-multiverse.is-print` branch, so print renders dark.
3. `cbx300-answers.js` hard-codes colours in timeline tweens (`INK '#1E1510'`, `COF '#2A1E17'`, `CREAM '#f4efe6'`, `MKD '#3a2a20'`, around lines 813–843). The scrub therefore paints cream/coffee over any theme.
4. `cbx300-case.css` has no `html.is-light-home.is-dark .cbx-ans` rules.

**Fix:**
- Link `cbx300-case-multiverse.css?v=mv11` in `index.html` right after `cbx300-case.css`. Its selectors are already scoped to `html.is-multiverse`, so it is safe.
- Split the MV skin into `html.is-multiverse.is-dark .cbx-ans {…}` (current values) and `html.is-multiverse.is-print .cbx-ans { --ans-cream:#f3eee4; --ans-coffee:#f3eee4; --ans-ink:#0e1018; --ans-amber:#00a0a0; --ans-line:rgba(0,160,160,.28); background:#f3eee4; color:#0e1018 }`. Do the same for the S01 cover rules.
- Add `html.is-light-home.is-dark .cbx-ans { --ans-cream:#2a221c; --ans-coffee:#1E1510; --ans-ink:#f4efe6; --ans-muted:rgba(244,239,230,.68); background:#1E1510; color:#f4efe6 }`.
- In `cbx300-answers.js`, replace the four constants with a `themeColors()` that reads `--ans-ink`, `--ans-coffee`, `--ans-cream` and `--ans-mkd` (add that var) from `getComputedStyle(section)` when the timeline is built. Kill and rebuild the timeline on theme toggle: listen for the existing theme toggle and call `kill()` + `bind()` at the same scroll progress.
- Bump `?v=` on every touched file.
- **Acceptance:** all 4 theme states show S01–S06 in their own skin, with no cream flash and no dark print.

## 2. S03: real screens replace example UI (keep the camera, copy grammar and timing)

Keep the whole timeline from `cbx300-answers.js`: `PX_PER_SEC 170`, `ZOOM 2.1`, `HOLD 5.3`, `STEP 5.0`, `GLIDE 1.15`, `SCRUB 1.0`, `settleSnap` (delay 0.3, 0.45–1.0s, `power2.inOut`), the 12-step one-pointer-at-a-time grammar from PR #31, chapter cross-fade, and the 390 `bindNarrow` (12 × viewport-height pin, `show(step)`).

Changes:
- **Screens:** use the slot API already in the file. For each chapter set `CHAPTERS[i].phoneShot` / `deskShot` (paths below). Switch each pointer from `t:'[data-ans-t=…]'` to `rect:{x,y,w,h}` in % of the slot. Measure each rect on the 1x PNG (440×956 phone, 1440×900 desk) around the element named in the pointer. The ring must hug the element with 6px padding.
- **Remove** `cbx-ans__xtag` ("Example UI · real screens to come"), the `cbx-ans__ctag` "Example copy" tag, and the `shot()` alt prefix "Example phone/desktop ·". Alt text should be "CBX300 phone · <screen>".
- **Remove** every invented client name (Mehta, Kapoor, Rao Interiors, Sen Foods, INV-015, INV-011…). Use Client A–D, Vendor A–D, "INV ——", "₹ ——".

### Ch1, "On her own · 1 person", ask "Did the client pay yet?"
- Phone: opens on `s03-ch1-phone-home.png`. On the chapter-open beat, cross-fade (0.45s `sine.inOut`) to `s03-ch1-phone-invoices.png`. Desk: `s03-ch1-desk-invoices.png`, dimmed and behind, as now.
- Pointers (keep the structure worry / does / why ×2 / not / gain):
  1. "Did Client A pay?": rect on the **Paid** pill. Copy stays, except the gain line stays "No awkward call to the client."
  2. "Which invoice was that for?": rect on "✓ Matched to INV ——". The "does" line becomes: "The payment arrives with a ‘Matched to invoice’ badge, tied to its invoice by the bank, not by her."
  3. "Who still owes me?": rect on "Overdue · oldest" (Client B). Copy unchanged.
  4. "Chasing feels rude.": rect on the **Nudge** button (Client B). Copy unchanged.

### Ch2, "First hire · 2 people", ask "Can I afford her salary this month?"
- Phone: pointer 1 uses `s03-ch2-phone-liquidity.png` (real). Pointers 2–3 use `s03-ch2-phone-set-aside.png`. Pointer 4 uses `s03-ch2-phone-payday.png`, with the inset `s03-ch2-phone-recurring.png` sliding up from the bottom edge to 60% height (0.6s `power3.out`). Desk: `s03-ch2-desk-cashplan.png`.
- Pointers:
  1. "Is this money really mine?": rect on the Current Account + Overdraft block. Rewrite to match the real screen:
     - does: "The total is split by where the money sits: the current account, the overdraft limit she can borrow, and deposits, each with the days until it frees up."
     - why: "Borrowed money sits in its own line, so it is never mistaken for hers." / "‘Maturing in 7 days’ tells her when locked money becomes usable."
     - not: "We didn’t show one balance with the overdraft folded in. It looks like savings and hides what is borrowed."
     - gain: "One honest picture of what she can use."
  2. "Will GST and rent eat into it?": rect on the Set aside card. Current copy.
  3. "What if a client pays late?": rect on the Coming in card. Current copy.
  4. "Can I pay Lina on Friday?": rect on Lina · Salary + **Covered** badge. Current copy, plus a third why line: "The salary repeats monthly once it is set, so payday is never a new task."
- Phone→phone swaps inside a chapter: the camera pulls back to the chapter pose (`BACK 2.5`). The two shots cross-fade at the widest point (0.45s `sine.inOut`), then the camera pushes into the next rect. Never swap while zoomed.

### Ch3, "With a team · 8 people", ask "Who’s waiting on me today?"
- Equal focus phone + desk as now. Phone sequence: `s03-ch3-phone-mytask.png` (p1) → `s03-ch3-phone-slide-to-approve.png` (p2). Desk: `s03-ch3-desk-approvals.png` (p3, p4).
- Pointers:
  1. "What needs me right now?": rect on the My Task list (first two cards).
     - does: "Everything waiting for her is one list in My Task, grouped by day, each with a Pending Approval tag, and filters by kind (Payments, Beneficiary, Payroll)."
     - not: "We didn’t send approvals as messages. Requests scatter across chats and the oldest get lost."
     - gain: "Nothing gets lost in a chat thread."
  2. "I’m out meeting a client.": rect on **Slide to Approve** + the red ✕.
     - does: "On the phone, approving is a slide across the bottom of the payment, with Reject as a separate red button."
     - why: "A slide can’t happen by accident in a pocket or mid-meeting." / "Reject sits apart in its own colour, so the two are never confused."
     - not: "We didn’t shrink the desktop table onto the phone. Tiny buttons turn a five-second job into ‘later’."
     - gain: "Her team isn’t stuck waiting for her."
  3. "Who approved that?": rect on the Recent activity card (desk). Current copy.
  4. "Should everyone see everything?": rect on the Role column (desk). Current copy. The last line hands off to S05: "Lina runs payments. The big calls stay with Aisha."
- **Chapter outro (new, 2 beats, after p4, no pointer card):**
  - The phone shows `s03-ch3-phone-maker-submitted.png` with the kicker "Lina sends it."
  - Then `s03-ch3-phone-approved.png` with the kicker "Aisha approves it, between meetings."
  - Use the same cross-fade. Kickers are in `Newsreader` italic, 40px desktop / 28px at 390, in the right column where the pointer card sits. These are the last frames of the S03 pin.

### Sizes
Pointer card text stays as it is now: worry 28px Newsreader italic, labels 12px caps → **raise to 14px**, body 17px. Image text ≥22px is satisfied at push-in. No "In focus" label may cover the screen's own text.

## 3. S04: "She grows, the app grows" (new section, replaces the 04 stub and `buildNext`)

**Purpose:** show the UX decisions through the screens changing, not labels. One pinned section, 2 movements.

**Layout (1440 stage, same `fitScale` as S03):**
- Kicker (Outfit 14px caps, amber): "04 · The app grows with her".
- H2 (Newsreader italic 56px): "Her business got bigger. The app kept up."
- **Movement A (growth strip):** three phone slots on one baseline, 360px wide each, 64px gaps, centred:
  - `s04-grow-1-home-min` (caption "On her own: one card, nothing to set up")
  - `s04-grow-2-home` ("First hire: pay people, bills on autopay")
  - `s04-grow-3-multi-entity` ("A team and more than one business: one switch, every entity")
  - Under each, a 2px rule in the stage colour plus the S02 rail label (01 Freelancer / 02 Shop of two / 03 Mid-size), reusing `.cbx-growth__rail` styles so it visibly continues S02.
  - Captions: Outfit 22px.
- **Movement B (three chosen-vs-dropped pairs):** one pair at a time. Two phones side by side.
  - Chosen on the left at full opacity with a 2px amber/cyan frame.
  - Dropped on the right at 55% opacity, desaturated 60%, with a 1px dashed frame and the label "Dropped" (Outfit 14px caps).
  - Right column (416px, same NCOL as S03) holds three lines: **We chose** / **We dropped** / **Why** (Outfit 22px; the Why line is Newsreader italic 26px).
  - **Pair 1: minimum dashboard vs empty widgets.**
    - Chose: "Show only what exists. A new account opens on one card."
    - Dropped: "The full dashboard with every widget empty."
    - Why: "A screen of empty boxes tells a new business it is behind."
  - **Pair 2: status first vs status hidden.**
    - Chose: "Paid / Overdue on every row, in the same place."
    - Dropped: "A plain list, with status inside each invoice."
    - Why: "She shouldn’t have to open five invoices to answer one question."
  - **Pair 3: slide to approve vs shrunk table.**
    - Chose: "One payment, one slide."
    - Dropped: "The desktop approvals table squeezed onto a phone."
    - Why: "Approvals happen between meetings, with one thumb."
- **No box inside a box:** phones sit directly on the stage. Captions and the right column are plain type with rules, not cards.

**Choreography (GSAP + ScrollTrigger, same conventions as `bindCamera`):**
- One `ScrollTrigger` with `trigger: section`, `start: 'top top'`, `end: '+=' + tl.duration()*PX_PER_SEC`, `pin: true`, `pinType: 'fixed'`, `scrub: 1.0`, `anticipatePin: 1`, and `snap: settleSnap(section, tl)` with a snap window at every rest state.
- **Entry from S03:** S03's last frame (approved phone) is the hand-off object. Scale it from its S03 pose into slot 3 of the strip (1.2s `power2.inOut`) while slots 1–2 rise from `y:40, opacity:0` (0.8s `power3.out`, stagger 0.15). The pinned morph has no hard cut, matching the S02 → S03 curtain feel.
- **Movement A:**
  - Rest on all three (HOLD 2.0).
  - Then a "growth sweep": a 3px rail ink line draws left → right under the strip (1.6s `sine.inOut`). Each phone lifts `y:-12` and its caption fades in as the line passes (0.5s `power3.out`).
  - Rest (HOLD 3.0).
- **A → B:** phones 1 and 2 slide out left (`x:-120`, opacity 0, 0.85s `power2.inOut`). Phone 3 cross-fades to Pair 1 chosen (0.45s `sine.inOut`). The dropped phone slides in from the right (`x:120 → 0`, 0.85s `power3.out`). The right column text glides in with `IN_DY 30` / `OUT_DY -26` and `GLIDE 1.15`, exactly like S03 pointer cards.
- **Pair → pair:**
  - Both phones cross-fade in place (0.45s `sine.inOut`).
  - The right column does the S03 glide out then in.
  - HOLD 5.3 per pair, STEP 5.0 between pairs.
  - A 3-tick progress HUD reuses `.cbx-ans__tick`.
- **Exit:** the chosen phone of pair 3 stays. Everything else fades (0.6s). The phone travels to the S05 start pose (1.0s `power2.inOut`).
- **390:** stack. One phone at 300px wide, caption below. Movement A becomes a horizontal snap (`bindNarrow` pattern: pin 6 × viewport height, `show(step)` with 0.5s fades). Each pair shows chosen first, then dropped replaces it with the "Dropped" label (no side by side).
- **Reduced motion:** no pin. Static strip of three phones, then three stacked pair rows. Opacity fades 0.3s on enter only (reuse `bindReduced`).

## 4. S05: "Trust & team" (who can do what)

**Layout:**
- Kicker "05 · Trust and team". H2 Newsreader italic 56px: "Eight people. Most of them need her yes."
- Left: one phone at S03 hero size. Right: NCOL column with the S03 pointer grammar (worry / does / why / not / gain). **Three pointers**, one at a time:
  1. "Who is on my team?": `s05-user-management.png`, rect on Active Users + Pending Approval.
     - does: "Everyone is in one list, split into active and waiting for approval, each with their role."
     - not: "We didn’t let new users act before someone approves them."
     - gain: "No stranger can move money."
  2. "What can Lina do?": `s05-access-roles.png`, rect on User Type / User Group / Authentication Type.
     - does: "Adding a user is a short form: role, group and how they sign in, before any limits."
     - why: "Roles come before limits, so access follows the job, not the person." / "Sign-in strength is chosen per user."
     - not: "We didn’t start from a blank permissions matrix."
     - gain: "Setting up a new hire takes minutes."
  3. "What if someone pays too much?": `s05-limits.png`, rect on the Operation Limits fields. Then cross-fade to `s03-ch3-phone-approve-list.png` with the rect on the red over-limit message.
     - does: "Each user has limits per day and per payment. A payment above the limit is flagged before approval and left out of the batch."
     - why: "The rule is set once and applied every time." / "The warning appears where she approves, not in a report."
     - not: "We didn’t rely on someone noticing a big number."
     - gain: "Big calls stay with Aisha."
- No figures anywhere. Every limit value is "₹ ——".

**Choreography:** identical to S03 Ch3 (same `buildTimeline` helpers). Entry is the phone carried from S04 cross-fading to user management at the widest pose. Use ZOOM 2.1 push-ins, settle snap, HUD ticks 1–3. 390 and reduced motion as in S03.

## 5. S06: "Outcome & my role" and end transition

**Layout:**
- **Beat 1 (callback to S02):** reuse the three clay illustrations `illo-d2-1/2/3.svg` (both theme variants as in S02) in a row, on the same coffee/ink plate as S02.
  - H2 Newsreader italic 64px: "Her business got bigger. Her worries got smaller."
  - Under each illustration, her S02 question struck through with a 2px amber/cyan line, then the answer line in Outfit 22px:
    - "Did the client pay yet?" → "Paid shows on every row."
    - "Can I afford her salary?" → "Safe to spend, and payday covered."
    - "Who’s waiting on me?" → "One list, one slide."
  - These must be copy only. **No metrics.**
- **Beat 2 (my role):** left is the `s06-welcome.png` phone. Right is three plain rows (rule-separated, no cards), Outfit 22px, labels 14px caps:
  - Role: "Lead product designer, design system and end-to-end screens".
  - When: "Jan 2026 – present".
  - Scope: "Mobile and web, design system to delivery".
  - No stats or counts in S06 (decided).
  - Also show the demo-brand note in Outfit 14px: "Lisa Charlie is a demo brand. Aisha is a representative story. All names and amounts are hidden."
- **Choreography:** pinned, 2 beats.
  - Beat 1: the illustrations rise in with the S02 rise (`RISE_DUR 1`, `power3.out`, stagger 0.15). The strike lines draw (0.6s `sine.inOut`) and the answers fade up (0.5s `power3.out`).
  - Beat 2: the illustrations slide left and fade. The phone enters from the bottom (0.85s `power3.out`). The rows glide in like the S03 pointer text.
  - Snap on both rests. Reduced motion: static.
- **End transition:**
  - After S06, the **coffee curtain** (S02's full-viewport `#1E1510`, or `#0e1018` in MV dark, `#f3eee4` in MV print) rises with the scroll. Reuse the S02 curtain code and ease, with its 0.9s `power3.inOut` settle.
  - The curtain carries a "Next project" card for project 02 (Plootus.ai) in the folder-card style from the rail, plus a "Back to all work" link.
  - Scrolling on, or Enter on the card, triggers the existing study close / open-next path in `project-study.js`. A reverse scroll drops the curtain back to S06.
  - MV glitch plates apply to the "Next project" title only in Multiverse.

## 6. Also fix in this PR
- S02 illustrations contain dollar amounts ($1,650, $2,400, $2,800, $3,200, $7,130, $38,400, $4,120) in `illo-d2-1/2/3.svg`, `illo-d2-scene.svg` and the MV variants. Replace each with `₹ ——` in the same text element. Keep the card art.
- The S01 cover image and the home SME folder card show a dashboard with "Rs 48,26,500.00" (`cin-work-sme.png` or similar). Replace it with a crop of `s04-grow-2-home.png` inside the same work-card frame (cream 22px tile + 14px inner crop; MV ink border + cyan offset).
- `project-data.js` SME `slides` still holds bracketed placeholder copy. The cbx300 template does not render it, but remove it from `llms.txt`/AEO output if it leaks there.

## 6b. Decisions (Iris, Nov 23)
- Mask counts only where they read as real business data. Generic UI counts stay. Already applied in the PNGs.
- The Cashflow "$" banknote icon is replaced by a neutral banknote glyph. Already applied in the PNGs.
- S06 leaves out all stats (no screen/flow counts).
- Rounded corners inside product screens stay as the real product. The sharp-radius rule covers case-study chrome only.

## 7. Acceptance checks (run per section, all must pass)
1. **4 theme states × 2 widths:** `?theme=light`, `?theme=dark`, `?beyond=1&theme=light`, `?beyond=1&theme=dark`, each at 1440×900 and 390×844, all with `&open=sme`.
   - Screenshot every rest state of S01–S06 and the end curtain. Each state must be in its own skin, with no cream S03 in dark or MV, and no dark in MV print.
2. **Motion:**
   - Scrubbing down and up lands on identical pixels.
   - Stopping mid-transition settles to the nearest rest (`settleSnap`).
   - No skipped pointer on a fast flick.
   - rAF median ≤16.7ms at 1440 (extend `scripts/check-cbx300-wheel.js` to S04–S06).
   - No layout shift when the pin starts or ends.
3. **Reduced motion** (`prefers-reduced-motion: reduce`): every section is readable without pinning, and nothing animates beyond 0.3s fades.
4. **Type:** rendered text ≥22px for every message a reader must read (H2s, captions, pointer worry/does/gain, S06 rows). Labels may be 14px caps. At every pointer push-in, the focused UI text inside the screen renders at ≥22 CSS px.
5. **No box inside a box:**
   - Pointer cards sit on the stage, not inside another card.
   - S04/S06 text columns use rules, not panels.
   - Phones are never inside a bordered card.
6. **Radii:** case-study chrome ≤4px (except the existing HUD pills). Product screens are untouched.
7. **Content:**
   - Search the built DOM and all `assets/img/cbx300/*`, `assets/img/aisha-growth/*` for real names, AED/USD/$ amounts, REF numbers and dates. Zero hits.
   - Banned terms: run `node scripts/check-banned-terms.js assets/img/cbx300 assets/img/aisha-growth assets/js/cbx300 assets/css/cbx300 docs/sme-finish` (case scope), with `CHECK_URL` pointed at the served case page. It reads a comma-separated list from the env var `BANNED_TERMS`, or else from the untracked file `.banned-terms.local` (one term per line, git-ignored). It searches the tracked repo files and the rendered case page case-insensitively, and fails on any hit. Running it with no paths also flags the existing employer mentions on the About page, home JSON-LD and llms.txt. Those are out of scope for this PR, so leave them for Iris/Tanishk. The terms are never written into the repo. Iris supplies them locally and in a CI secret.
   - No made-up numbers: no metric, percentage or count appears in case copy. Inside screens, counts that read as business data are masked. Generic UI counts ("7 Transactions Selected for Approval", badges) are allowed.
8. **Accessibility:**
   - Every screen `<img>` has alt "CBX300 phone · <screen>" or "CBX300 web · <screen>".
   - Pointer text is real HTML, not baked into images.
   - Focus order follows the story. Keyboard arrows step through pins as S02/S03 do.
9. **Checks green:** `node scripts/check-cbx300-case.js`, `node scripts/check-cbx300-wheel.js`, `node scripts/check-multiverse-ux.js`. Add S04–S06 assertions for section count (6 live sections, no `data-cbx-stub`), theme vars per state, and the content grep in item 7.
10. **Deliverables in the PR body:** light/dark/MV print/MV dark screenshots at 1440 and 390 for each section rest, plus a 20–30s screen recording of the full scroll in normal light and MV dark.
