# Device frames brief — every product screen in a device (Nov 24)
Owner: Iris (UI/UX). Cursor implements only. Branch `iris/cbx300-sme-finish`, PR #32 (draft). Do not merge.
Screens are now the **original Figma exports** (unmasked, 2x). Do not edit, recolour, crop or retouch screen pixels.
Frames are **CSS components**, not baked into PNGs, so screens stay sharp and theme-aware. One family with the S01 cover
(assets/video/cbx300/*, html source of the cover lives on the box: /workspace/sme-final/cover/html/cover.html).

## 1. Components (add to assets/css/cbx300-case.css; skins in cbx300-case-multiverse.css)
All sizes derive from one custom property `--dw` = **screen** width in CSS px. Set `--dw` per slot (section 3). Never scale frames with `transform: scale()` at rest (only the existing camera/scroll tweens may transform them).

### 1a. `.device-iphone` (iPhone 16 Pro Max proportions, screen 440×956 = ratio 0.4603)
```
.device-iphone            position:relative; box-sizing:content-box; width:var(--dw); aspect-ratio:440/956;
                          padding:calc(var(--dw)*0.0295);                 /* bezel: 13px @ dw 440, 7.4px @ dw 250 */
                          border-radius:calc(var(--dw)*0.1545);           /* outer: 68px @ 440 */
                          background:#0d0f0e;
                          box-shadow: inset 0 0 0 calc(var(--dw)*0.0045) #3a3d3b,   /* titanium edge 2px@440 */
                                      inset 0 0 0 calc(var(--dw)*0.009) #121413;
.device-iphone__screen    position:relative; width:100%; height:100%; overflow:hidden;
                          border-radius:calc(var(--dw)*0.125);            /* 55px @ 440 */  isolation:isolate;
.device-iphone__screen img/picture  display:block; width:100%; height:100%; object-fit:cover; object-position:top center;
.device-iphone__island    position:absolute; z-index:5; top:calc(var(--dw)*0.025); left:50%;
                          width:calc(var(--dw)*0.2818); height:calc(var(--dw)*0.0818);   /* 124×36 @ 440 */
                          transform:translateX(-50%); border-radius:999px; background:#050606;
.device-iphone__btn       position:absolute; width:calc(var(--dw)*0.0091); border-radius:2px;   /* 4px @ 440 */
                          background:linear-gradient(90deg,#2b2e2c,#0d0f0e);
   action  left:-0.0068*dw  top:17% height:3.4%
   vol up  left:-0.0068*dw  top:23% height:6.6%
   vol dn  left:-0.0068*dw  top:31% height:6.6%
   power   right:-0.0068*dw top:27% height:10%
```
Shadow (on the frame, not the screen): light `0 calc(dw*.11) calc(dw*.14) calc(dw*-.05) rgba(30,21,16,.30), 0 calc(dw*.03) calc(dw*.05) rgba(30,21,16,.14)`;
normal dark `… rgba(0,0,0,.60), … rgba(0,0,0,.35)` + `0 0 calc(dw*.3) rgba(46,120,70,.18)`; Multiverse print: no blur shadow, `4px 4px 0 #1E1510` offset (matches print ink offset); Multiverse dark: like normal dark with `#0e1018` base.
The Figma status bar (9:41, signal, battery) is inside the screen PNG; the island sits on top of it between time and icons. Check it never covers status text.
The recurring inset (s03-ch2-phone-recurring, 912×1072, a sheet component) is **not** a full screen: show it as a bottom sheet card inside the phone screen (radius calc(dw*.06) top corners only, shadow 0 -8px 24px rgba(0,0,0,.12)), never in its own iPhone.

### 1b. `.device-browser` (web screens 1440×900, ratio 1.6)
```
.device-browser           position:relative; width:var(--dw); border-radius:4px; overflow:hidden; background:#fff;
.device-browser__bar      height:max(22px, calc(var(--dw)*0.0236));     /* 34px @ 1440, 18→22px floor */
                          display:flex; align-items:center; gap:calc(var(--dw)*0.0056); padding:0 calc(var(--dw)*0.0097);
                          background:#eceee9; border-bottom:1px solid #dfe3dc;
.device-browser__dot      width/height: calc(var(--dw)*0.0069) (10px @1440, min 6px); border-radius:50%; background:#cfd5cc;  ×3
.device-browser__url      margin-left:calc(var(--dw)*0.0097); height:52% of bar; width:25% of dw; border-radius:4px; background:#f7f8f5;  (empty, no fake URL text)
.device-browser__screen   aspect-ratio:1440/900; img width:100%; height:100%; display:block;
```
Outer hairline + shadow: light `0 0 0 1px rgba(30,21,16,.10), 0 calc(dw*.042) calc(dw*.083) calc(dw*-.02) rgba(30,21,16,.35)`; dark `0 0 0 1px rgba(243,238,228,.12), … rgba(0,0,0,.7), 0 0 calc(dw*.12) rgba(46,120,70,.40)`; Multiverse print: `0 0 0 1.5px #1E1510, 4px 4px 0 #1E1510`; Multiverse dark: dark rules on #0e1018. Bar colours: dark themes `#1b1f1c` bar, `#2a302b` dots, `#232824` pill, border `#2c322d`.

## 2. Rules for scroll animations (GSAP pin/scrub in cbx300-case.js / cbx300-answers.js / cbx300-finish.js)
- `data-ans-screen` and the pointer `rect` coordinates stay on the **screen** element (`.device-*__screen`), so push-in maths are unchanged. Camera tweens transform the whole device (frame + screen together); never animate the frame and screen separately.
- Shot crossfades happen **inside** `.device-*__screen` only (frame stays 100% opaque, no frame flicker). Same 0.35 s timing as today.
- Dim/blur states (desk behind phone) apply to the whole device.
- S04 dropped column: keep its existing desaturate/strike treatment on the screen only; frame unchanged.
- Reduced motion: frames identical, no transforms.

## 3. Where each screen goes (screen width `--dw`, CSS px)
| Slot | Device | Screens | --dw @1440 | --dw @390 |
|---|---|---|---|---|
| S01 cover | video/poster (already framed in the render) | cbx300-cover-{light,dark} | card per WEB-COVER-BRIEF | full width |
| S03 Ch1/Ch2 phone hero (`.cbx-ans__scene.is-phone .cbx-phone`) | iPhone | s03-ch1-phone-home/-invoices, s03-ch2-phone-liquidity/-set-aside/-payday | 340 | 236 |
| S03 desk behind (is-phone) | browser | s03-ch1-web-dashboard, s03-ch2-web-bulk-upload | 760 (dimmed as today) | hidden as today |
| S03 Ch3 is-both desk | browser | s03-ch3-web-pending-approvals, s03-ch3-web-approve-payment | 760 (bar 18→ use 22px floor) | 350 |
| S03 Ch3 is-both phone | iPhone | s03-ch3-phone-mytask/-slide-to-approve/-maker-submitted/-approved | 300 | 200, overlaps browser bottom-right by 24px |
| S04 growth strip (`.cbx-s04__col`) | iPhone | s04-grow-1/2/3 | 248 (col 280) | 150 ×3 in a scroll-snap row, or 220 stacked |
| S04 chosen / dropped (`.cbx-s04__chosen/__dropped .cbx-fin__phone`) | iPhone | s04-pair{1,2,3}-chosen/-dropped | 260 each, 48px gap | 160 each, 16px gap |
| S05 trust phone | iPhone | s05-user-management, s05-access-roles, s05-limits, s03-ch3-phone-approve-list | 340 | 236 |
| S06 welcome | iPhone | s06-welcome | 300 | 220 |
Total device height (screen + 2×bezel) must fit the pinned viewport: at 1440×900 the S03 hero phone is 340×739 + 2×10 = 759 tall; if it does not fit under the 72px header with ≥24px top/bottom air, drop `--dw` to 320 rather than cropping the screen.

## 4. Acceptance checklist (Iris will enforce; any fail = not done)
Run at 1440×900, 1280×720, 1920×1080, 390×844, 360×780 in all four themes (normal light, normal dark, Multiverse print `?beyond=1` light, Multiverse dark). Screenshot evidence for each.
1. Every product screen on the page sits in `.device-iphone` or `.device-browser`. No bare screen anywhere (grep: no `<img>` of `assets/img/cbx300/s0*` outside a `.device-*__screen`).
2. Screen pixels untouched: rendered screen aspect = 440:956 (phone) / 1440:900 (web) within ±0.5px; `object-fit` never stretches; no crop of the status bar or bottom bar.
3. Frame geometry matches §1 exactly (measure with getBoundingClientRect / computed style): bezel, outer radius, island size/position, button positions, browser bar height, 4px browser radius. Tolerance ±0.5px.
4. Island never overlaps status-bar text; inner screen radius has no white corner bleed (zoom 400% on all four corners).
5. Frames identical in every slot of the same type (one component, one family). Shadows per theme exactly as §1; Multiverse print uses the ink offset, never a blurred shadow.
6. No overlaps: devices never cover headings, pointer copy, rails, Close, section numbers, or each other except the defined S03 Ch3 overlap. Check at every 25% of each pin's scroll progress.
7. Push-in camera rects still land on the right UI (S03 pointers 1–4 each chapter, S05 pointers): the highlighted region is centred within ±8px.
8. Crossfades: no frame flicker, no double-exposed frames, no layout shift (CLS 0) when shots swap.
9. Scroll: 60 fps in Chrome performance panel on 1440 (no long tasks >50ms during scrub); wheel + trackpad + keyboard reach S06 without snapping back.
10. Text crispness: no CSS scale at rest; devicePixelRatio 2 screenshots show 2x screens 1:1 (no resample blur). WebP served with PNG fallback.
11. Reduced motion: no transforms, all devices static and fully visible; cover shows the poster.
12. `node scripts/check-banned-terms.js` passes; no banned term in alt text, file names or HTML.
13. Alt text describes the screen (e.g. "CBX300 web · Pending approvals"), not "screenshot".

## 5. Known content issues (Figma originals, flagged to owner, not to be edited by Cursor)
- Real third-party brands appear in the sample data: Mashreq logo, DEWA, SEWA, Etisalat (e&), Emirates NBD, Visa, Al Futtaim Group, Emaar. A purple "PF" assistant badge shows on s03-ch1-phone-home, s04-grow-1-home-min, s04-grow-2-home, s04-grow-3-multi-entity and s04-pair1-chosen. Owner to decide.
- Figma typos are now visible as-is ("User Managment", "Approcal", "Nex Step").
- s06-welcome shows the iOS keyboard (as in Figma).
- Story copy still uses Aisha / Lina / ₹ while original screens show Abdulrahman / Oliver Davis / AED. Copy pass needed (owner).
- Designed (non-Figma) screens still carry the earlier masked naming: s03-ch1-phone-invoices, s03-ch2-phone-set-aside, s03-ch2-phone-payday, s03-ch*-desk-*, s04-pair1-dropped, s04-pair2-*, s04-pair3-dropped. No Figma original exists for them.
- Web screens' right-hand "Promotions" panels (dashboard, approve-payment, bulk upload) are the source design's placeholders.
