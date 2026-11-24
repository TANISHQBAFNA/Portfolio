# Build brief — web + phone pairing and S01 video cover (Nov 24)
Branch `iris/cbx300-sme-finish` (draft PR #32). Assets are already committed (see assets/img/cbx300/README.md, "Web screens + cover").
Do not merge, do not touch other PRs or the live domain. Keep story, copy voice, GSAP pin/scrub, and all four theme skins.

## 1. S01 cover (assets/js/cbx300-case.js `buildCover`, assets/css/cbx300-case.css `.cbx-cover__media`)
- Replace the portrait phone card with a landscape media card holding a `<video>`:
  `muted autoplay loop playsinline preload="metadata" disablepictureinpicture`, `poster` = theme poster,
  sources in order: `assets/video/cbx300/cbx300-cover-{v}.webm` (type video/webm), then `.mp4` (video/mp4).
  Set `video.muted = true` in JS too. `aria-label="CBX300 business banking on a laptop and a phone"` on the figure; video `aria-hidden="true"`.
- Variant `{v}`: `light` for normal light (`html.is-light-home`) and Multiverse print (`is-multiverse.is-print`); `dark` for normal dark (`is-dark`, coffee #1E1510) and Multiverse dark. Swap src + poster when the html class changes (MutationObserver on `document.documentElement` `class`), keep currentTime.
- Reduced motion (`prefers-reduced-motion: reduce`, also react to change): render no video, only `<img class="work-card__img" src="assets/img/cbx300/cbx300-cover-{v}-poster.jpg" width="1600" height="900" alt="">`.
- If autoplay is rejected (play() promise rejects), keep the poster visible; no controls.
- Fade the video in on `canplay`: opacity 0 → 1, 400ms ease-out. Pause when the cover is off-screen (IntersectionObserver, threshold 0) and resume when back.
- Size (desktop ≥ 721px): `position:absolute; top:0; right:0; width: min(58vw, 52rem, calc((100svh - var(--study-head,72px) - 330px) * 16 / 9)); aspect-ratio: 16 / 9; height:auto;` media fill: `object-fit: cover; width:100%; height:100%; display:block`. Inner media corner radius 4px. Keep the existing work-frame chrome (padding/border/shadow) per theme.
  The heading block (bottom-left) must never overlap the media: check 1440×900, 1280×720, 1920×1080.
- Mobile (≤ 720px): `position:relative; width:100%; aspect-ratio:16/9; top:0;` media first, heading below at the bottom as today; 24px gap between media and heading minimum.
- Files: video 1600×900, 5 s, 30 fps, seamless loop. light mp4 ~0.41 MB / webm ~0.94 MB; dark mp4 ~0.37 MB / webm ~0.75 MB.

## 2. S03 web is the main view, phone is the extension (assets/js/cbx300-answers.js)
- Ch1 `solo`: `deskShot: IMG + 's03-ch1-web-dashboard.png'`, `deskAlt: 'CBX300 web · Dashboard'`, `deskTitle: 'Dashboard'`. Phone stays hero (Home → Invoices).
- Ch2 `cash`: `deskShot: IMG + 's03-ch2-web-bulk-upload.png'`, `deskAlt: 'CBX300 web · Salary file upload'`, `deskTitle: 'Bulk payments'`. Phone stays hero; the recurring-salary inset stays.
- Ch3 `team` (hero both): add `deskShots` (same shape as `phoneShots`, 1440×900) and crossfade the desk by pointer `shot` exactly like the phone stack (same 0.35 s crossfade, same pin/scrub progress):
  - `{ id: 'queue', src: IMG + 's03-ch3-web-pending-approvals.png', alt: 'CBX300 web · Pending approvals' }` (openDesk)
  - `{ id: 'detail', src: IMG + 's03-ch3-web-approve-payment.png', alt: 'CBX300 web · Payment detail and approval trail' }`
  - Pointer 3 "Who approved that?": `deskShot: 'detail'`, rect `{ x: 20, y: 76, w: 50, h: 15 }` (the Initiated → Pending Approval → Sent to Bank trail). Replace `does` with: "Each payment carries its own trail: who started it, who approves it, and what happens next, with names and dates." Keep why[1]; replace why[0] with "The trail sits on the payment itself, so she doesn't open another page."
  - Pointer 4 "Should everyone see everything?": `deskShot: 'queue'`, rect `{ x: 23, y: 21, w: 76, h: 13 }` (the request-type tabs). Replace `does` with: "Requests are split by kind (single payments, bulk, service requests), each with its own count, and each role only sees the kinds it handles." Keep `why`/`not`/`gain`.
  - Pointers 1–2 keep the desk on 'queue' (dimmed as today). Phone 'slide' (bottom sheet) is the phone extension of the web 'detail' screen.
- Keep the old designed desk PNGs in the repo (unused) — do not delete.
- S04 and S05 stay mobile-only (no web user-management / roles / limits screens exist in Figma).

## 3. Done when
- `node scripts/check-banned-terms.js` passes (terms via BANNED_TERMS or .banned-terms.local; never commit terms).
- 1440 and 390, normal light + normal dark at minimum (then Multiverse print/dark): cover video plays and loops; reduced-motion shows the poster; desk screens crossfade on the right pointers; no overlaps; any added image text ≥ 22px.
