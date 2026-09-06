# AEO for tanishqbafna.com

Answer-engine signals so a hiring manager (or ChatGPT / Perplexity / Bing) can cite Tanishq Bafna as a UX / product designer in Mumbai. Free only. This does **not** make ChatGPT recommend him. It makes the site easier to parse, locate, and quote.

## What this PR added

| Signal | Where |
| --- | --- |
| Mumbai as home | Person JSON-LD on `index.html` and `about.html` (`homeLocation` + `addressLocality: Mumbai`, `addressCountry: IN`). Human line on About: “based in Mumbai.” |
| `sameAs` | LinkedIn, Behance, GitHub — copied from `contact.html`, not invented. |
| FAQ + FAQPage | Visible Q&A on `about.html`, matching JSON-LD. |
| `llms.txt` | Mumbai, fintech + AI, Plootus as the named proof, contact URL, cite do’s and don’ts. |
| Crawl files | `robots.txt` (AI crawlers allowed), `sitemap.xml`. |
| IndexNow stub | Key file at `/92733d8cd52c4c378948e6b9b0aaad21.txt` (see below). |
| Canonical About | `about.html` is the About URL. `About me.html` stays as a legacy alias with `rel=canonical` pointing here. |

Plootus is the named proof because that is how the home rail labels the AI sales case (`Plootus` / `Plootus.ai` in `project-data.js`). Do not swap in another name without reading the rail.

## What you must fill or check

**No `REPLACE_SAMEAS_*` placeholders.** Real URLs were already on the contact page.

1. **Confirm LinkedIn** — `https://www.linkedin.com/in/tanishqbafna/`  
   If this is wrong, change it in **all four places**: `about.html` (JSON-LD `sameAs` + FAQ link), `index.html` (JSON-LD `sameAs`), `contact.html`, `llms.txt`, and this file.

2. **Confirm Behance** — `https://www.behance.net/tanishqhbafna`  
   Behance still shows an older “Blacksburg, VA” location. Update that profile to Mumbai so off-site pages do not contradict the site.

3. **Optional Dribbble** — if you have one, add it to the `sameAs` arrays (home + About) and to `llms.txt`. There is no Dribbble URL in this repo.

4. **GTM** — `index.html` still has `window.__GTM_ID__ = 'GTM-XXXXXXX'`. Paste your real container ID or leave it. The stub in `assets/js/tracking.js` will not load Google Tag Manager while `XXXXXXX` is in the ID. Tracking is **not** AEO. ChatGPT will not start citing you because GTM is on.

5. **Portrait file** — Open Graph and JSON-LD point at `https://tanishqbafna.com/assets/img/tanishq-portrait.png`. Add that file if it is missing, or change the URL to the file you actually ship.

## Off-site corroboration (this is the part that actually helps)

Answer engines cross-check. The site saying Mumbai is weak if LinkedIn and Behance say Virginia.

- LinkedIn headline: Mumbai · Product / UX designer · fintech + AI. Same spelling: **Tanishq Bafna**.
- LinkedIn location: Mumbai, India.
- Behance location: Mumbai (not Blacksburg).
- Same three profile URLs everywhere (`sameAs`).
- One proof in the headline (Plootus or SME banking), not a list of tools.

## Search Console and Bing (free)

1. [Google Search Console](https://search.google.com/search-console) — add `https://tanishqbafna.com`, verify (HTML file or DNS; meta tag if you prefer), submit `https://tanishqbafna.com/sitemap.xml`.
2. [Bing Webmaster Tools](https://www.bing.com/webmasters) — same site, same sitemap.
3. Optional IndexNow (Bing / Yandex), no API secret:
   - Key file is already at `https://tanishqbafna.com/92733d8cd52c4c378948e6b9b0aaad21.txt`
   - After deploy, ping (browser or curl):  
     `https://www.bing.com/indexnow?url=https://tanishqbafna.com/about.html&key=92733d8cd52c4c378948e6b9b0aaad21`
   - Repeat for `/` and `/contact.html` when those change.
4. Rich results check (optional): [Google Rich Results Test](https://search.google.com/test/rich-results) on `/about.html` — you want Person + FAQ.

Submitting a sitemap and IndexNow tells Bing the pages exist. It does not rank you and it does not make ChatGPT pick you.

## What we did not add

- No paid AEO / GEO tools.
- No new third-party scripts on About (FAQ is HTML + JSON-LD only).
- No `firebase.json` in this branch. If you add Firebase Hosting later, keep your existing headers / CSP. This work does not need new `script-src` hosts. Home already loads Google Fonts, jsDelivr GSAP, and (if you fill GTM) Google Tag Manager — that is unchanged.
- Home visual system, Iris motion, curtain, and landing CSS geometry were not redesigned. Leaf pages got layout CSS they were missing (they could not scroll on desktop because `.stage` is `position: fixed` on the landing). That CSS is scoped to `body.leaf-page` only.

## About vs About me.html

| File | Role |
| --- | --- |
| `about.html` | Canonical About. Person + FAQPage schema. Nav and sitemap point here. |
| `About me.html` | Old filename. Same visible copy. `rel=canonical` → `about.html`. Person schema only (no second FAQPage). |

Do not put a different job title, city, or `sameAs` list on the alias.

## Positioning lock (2026-09-06)

Tanishk is **open across fields** as a product/UX designer based in Mumbai. Fintech, banking, and AI cases are **proof**, not a lane lock. Do not describe him as fintech-only or AI-only in schema, FAQ, or llms.txt.
