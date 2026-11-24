# CBX300 SME case study: screens (2x)

**Nov 24 update (owner decision): real Figma screens are now the ORIGINAL exports, unmasked** (sample names, amounts, IBANs, logos as designed in Figma; download_assets 2x from file NbivlhwDZPgPRxv7Kg4Bi8). Web screens cropped to the 1440×900 viewport. s04-grow-2-home = s03-ch1-phone-home, s04-pair1-chosen = s04-grow-1-home-min, s04-pair3-chosen = s03-ch3-phone-slide-to-approve. s03-ch2-phone-recurring is the left state of node 33387:99923 (912×1072 sheet). Designed (non-Figma) screens below are unchanged and still use the older masked naming. See docs/sme-finish/DEVICE-FRAMES-BRIEF.md §5 for flagged content (real brands, PF badge, typos).

## Earlier notes (masking no longer applied to real screens)

Source: CBX300 Figma file `NbivlhwDZPgPRxv7Kg4Bi8`, page `858:23168` "Screens · All Journeys" (read through the work Figma account, nothing edited in Figma).
**Real** screens were rebuilt from Figma's own layer code (get_design_context) and rendered at 2x in Chrome with Lato (the file's font), so masked text looks native.
**Designed** screens are new screens built in the same tokens (Lato, brand #21552f → #12341d gradient, surfaces #f3f4f6/#fff, 24px card radius, 40px pills, success #007a47, urgent #c2410c, info #395ecf). Phone = 880×1912 (440×956 @2x). Web = 2880×1800 (1440×900 @2x).

Masking applied to every image: people → Aisha / Lina / Dev / Mira / Arjun; businesses → Aisha Studio, Vendor A–D, Client A–E, Entity A–C; every amount → "₹ ——"; REF/REQ/INV/IBAN/account numbers → "REF ——" etc.; dates → "DD MMM YYYY" / "DD MMM"; utility/bank logos (DEWA, SEWA, bank marks) → neutral tile with initial; DEWA/SEWA/Etisalat → Power / Water / Mobile Bill; the purple "PF AI" assistant badge removed; AI insight text with figures rewritten without numbers. Typos fixed: Managment→Management, Approcal→Approval, Payoll→Payroll, Offiver→Officer, Ner→Net, "owned by payer"→"owed by payer", "This transactions"→"This transaction". The demo brand "Lisa Charlie Bank" is kept.

| File | Section / slot | Kind | Figma node |
|---|---|---|---|
| s03-ch1-phone-home.png | S03 Ch1 opener (phone lands on Home, then taps Invoices) | real | 14430:56021 |
| s03-ch1-phone-invoices.png | S03 Ch1 hero phone, pointers 1–4 | designed (CBX has no invoices) | — |
| s03-ch1-desk-invoices.png | S03 Ch1 desk behind phone (dimmed) | designed | — |
| s03-ch2-phone-liquidity.png | S03 Ch2 pointer 1 "Is this money really mine?" | real | 15050:63159 |
| s03-ch2-phone-set-aside.png | S03 Ch2 pointers 2–3 (Set aside / Coming in) | designed | — |
| s03-ch2-phone-payday.png | S03 Ch2 pointer 4 "Can I pay Lina on Friday?" | designed | — |
| s03-ch2-phone-recurring.png | S03 Ch2 pointer 4 inset (salary set to repeat monthly) | real (left state of frame) | 33387:99923 |
| s03-ch2-desk-cashplan.png | S03 Ch2 desk behind phone | designed | — |
| s03-ch3-phone-mytask.png | S03 Ch3 pointer 1 "What needs me right now?" | real | 39669:77815 |
| s03-ch3-phone-slide-to-approve.png | S03 Ch3 pointer 2 "I'm out meeting a client" | real | 39669:77908 |
| s03-ch3-phone-approve-list.png | S03 Ch3 bulk approve + over-limit warning (also S05 beat 3) | real | 11734:54717 |
| s03-ch3-phone-maker-submitted.png | S03 Ch3 outro: Lina submits (maker) | real | 39669:79152 |
| s03-ch3-phone-approved.png | S03 Ch3 outro: Aisha approved (checker) | real | 39669:78041 |
| s03-ch3-desk-approvals.png | S03 Ch3 desk, pointers 3–4 (activity log, role tags) | designed | — |
| s04-grow-1-home-min.png | S04 growth strip 1: day-one dashboard | real | 15050:52568 |
| s04-grow-2-home.png | S04 growth strip 2: full dashboard | real | 14430:56021 |
| s04-grow-3-multi-entity.png | S04 growth strip 3: multi-entity | real | 14968:49864 |
| s04-pair1-chosen-min-dashboard.png / -dropped-empty-widgets.png | S04 pair 1 | real / designed | 15050:52568 / — |
| s04-pair2-chosen-status-first.png / -dropped-status-hidden.png | S04 pair 2 | designed / designed | — |
| s04-pair3-chosen-slide-to-approve.png / -dropped-shrunk-table.png | S04 pair 3 | real / designed | 39669:77908 / — |
| s05-user-management.png | S05 beat 1: who is on the team | real | 12344:30153 |
| s05-access-roles.png | S05 beat 2: roles + auth type | real | 12115:27427 |
| s05-limits.png | S05 beat 3: limits | real | 38703:208657 |
| s06-welcome.png | S06 closing device (first-time login, keyboard hidden) | real | 7244:15007 |

Notes
- These are product UI and keep the product's own 24px cards / 40px pills. The case-study chrome around them keeps the portfolio rule (sharp, small radii).
- Small UI text is 12–14px at 1x. At the S03 camera push-in (ZOOM 2.1) it reads at ≥25px. Anywhere a screen sits at rest, the readable message must be in HTML copy (≥22px), not inside the screen.
- Counts: any count that would read as real business data is masked ("Total —— Transactions • —— Failed Validation", "—— Leaves", "—— Accounts"). Generic UI counts stay as they are ("7 Transactions Selected for Approval", task/notification badges, list-length badges, "Last 6 Months", "Maturing in 7 days").
- The Cashflow card icon (banknote with a "$") is replaced with a neutral banknote glyph (rectangle + circle) in the same brand stroke, on home, home-min and multi-entity.
- The render and mask pipeline (Figma layer code → HTML → masked 2x PNG) lives in Iris's workspace, not in this repo. Ask Iris to regenerate any screen; do not hand-edit these PNGs.

## Web screens + cover (Nov 24)
Web screens come from the CBX300 Figma "Interactive All journeys" page (1440 web journeys; that page is team-labelled "do not refer", used here as real reference UI). Masked with the same rules as above (pixel erase + Lato redraw). 2x PNG + WebP.
| File | Slot | Figma node |
|---|---|---|
| s03-ch1-web-dashboard | S03 Ch1 desk (replaces designed desk-invoices as main view) | 22789:199862 (top 900px) |
| s03-ch2-web-bulk-upload | S03 Ch2 desk: salary run as one file | 22789:131409 |
| s03-ch3-web-pending-approvals | S03 Ch3 desk: approval queue + cover laptop | 22789:154433 |
| s03-ch3-web-approve-payment | S03 Ch3 desk: payment detail + maker/checker trail | 22789:154618 |
| cbx300-cover-{light,dark}-poster.jpg + assets/video/cbx300/cbx300-cover-{light,dark}.{mp4,webm} | S01 cover: code-built (HTML/CSS 3D) frameless browser + phone + lifted approval row, real masked screens only, no generated imagery, 5 s seamless parallax loop, 1600x900, H.264 + VP9, muted | — |

## Nov 24 cleanups (native, from Figma)
- Typos retyped in Lato at the exact Figma size/weight/colour: "User Managment" → "User Management", "Pending Approcal" → "Pending Approval" (s05-user-management), "Nex Step" → "Next Step" (s03-ch3-web-approve-payment).
- s06-welcome now uses the keyboard-free Figma state "Welcome to Lisa Charlie Banking · 2" (7244:19269).
- Grey "Promotions" placeholders on web dashboard / approve payment / bulk upload filled with the Figma "Story Promotions" Main Card content (14968:49928 / 14968:49932: Lato Bold 16/24 heading + original card / coin-bag art), on the placeholders' own fill and radius.
