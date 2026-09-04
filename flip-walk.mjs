import { chromium } from 'playwright';
import fs from 'fs';
const out = '/Users/tanishq.bafna/Projects/tanishqbafna-portfolio/flip-shots';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://127.0.0.1:4321/?nocache=' + Date.now(), { waitUntil: 'networkidle' });
await page.screenshot({ path: out + '/01-landing.png' });
const daughters = page.locator('.folder, a, button').filter({ hasText: /Daughters/i }).first();
await daughters.click({ force: true });
await page.waitForTimeout(1400);
await page.screenshot({ path: out + '/02-open.png' });
const next = page.locator('[data-rail-next]');
const midPromise = page.waitForTimeout(200).then(() => page.screenshot({ path: out + '/03-flip-mid.png' }));
await next.click();
await midPromise;
await page.waitForTimeout(1000);
await page.screenshot({ path: out + '/04-page-02.png' });
const info = await page.evaluate(() => {
  const sheets = [...document.querySelectorAll('.sheet')].slice(0, 4).map((s) => ({
    cls: s.className,
    z: getComputedStyle(s).zIndex,
    leaf: (() => {
      const l = s.querySelector('.sheet__leaf');
      if (!l) return null;
      const cs = getComputedStyle(l);
      return { transform: cs.transform, origin: cs.transformOrigin, style: l.style.transform };
    })()
  }));
  const pages = document.querySelector('[data-pages], .case-folder__pages, .case-folder__book');
  const leafParent = document.querySelector('.sheet__leaf')?.parentElement;
  return {
    sheets,
    pagesOverflow: pages && getComputedStyle(pages).overflow,
    pagesPerspective: pages && getComputedStyle(pages).perspective,
    bookTS: pages && getComputedStyle(pages).transformStyle,
    bodyReduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    openClass: document.querySelector('[data-detail]')?.className || ''
  };
});
fs.writeFileSync(out + '/diag.json', JSON.stringify(info, null, 2));
console.log(JSON.stringify(info, null, 2));
await browser.close();
