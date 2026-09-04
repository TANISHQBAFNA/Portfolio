import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const out = '/Users/tanishq.bafna/Projects/tanishqbafna-portfolio/flip-shots/fix';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const stamp = Date.now();

await page.goto('http://127.0.0.1:4321/?nocache=' + stamp, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(out, '01-landing.png') });

const daughters = page.locator('.folder').filter({ hasText: /Daughters/i }).first();
const midOpen = page.waitForTimeout(400).then(() => page.screenshot({ path: path.join(out, '02-mid-open.png') }));
await daughters.click({ force: true });
await midOpen;
await page.waitForTimeout(1600);
await page.screenshot({ path: path.join(out, '03-settled-open.png') });

const openDiag = await page.evaluate(() => {
  const shell = document.querySelector('[data-case-shell]')?.getBoundingClientRect();
  return {
    classes: document.querySelector('[data-detail]')?.className,
    cx: shell && shell.x + shell.width / 2,
    cy: shell && shell.y + shell.height / 2,
    vw: innerWidth, vh: innerHeight,
    counter: document.querySelector('[data-rail-counter-current]')?.textContent
  };
});

const counterBefore = await page.locator('[data-rail-counter-current]').textContent();
const collect = page.evaluate(() => new Promise((resolve) => {
  const start = performance.now();
  const samples = [];
  const id = setInterval(() => {
    const leaf = document.querySelector('.sheet.is-flipping .sheet__leaf');
    const r = leaf?.getBoundingClientRect();
    samples.push({
      t: Math.round(performance.now() - start),
      counter: document.querySelector('[data-rail-counter-current]')?.textContent,
      flipping: !!leaf,
      rect: r && { x: +r.x.toFixed(0), y: +r.y.toFixed(0), w: +r.width.toFixed(0), h: +r.height.toFixed(0) }
    });
    if (performance.now() - start > 1400) { clearInterval(id); resolve(samples); }
  }, 50);
}));
const shot350 = page.waitForTimeout(350).then(() => page.screenshot({ path: path.join(out, '04-flip-350.png') }));
const shot500 = page.waitForTimeout(500).then(() => page.screenshot({ path: path.join(out, '05-flip-500.png') }));
await page.locator('[data-rail-next]').click();
const samples = await Promise.all([shot350, shot500, collect]).then(r => r[2]);
fs.writeFileSync(path.join(out, 'diag-flip.json'), JSON.stringify({ counterBefore, samples }, null, 2));
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, '06-page-02.png') });
const counterAfter = await page.locator('[data-rail-counter-current]').textContent();

await page.locator('[data-rail-home]').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(out, '07-home.png') });
const homeDiag = await page.evaluate(() => ({
  detailHidden: document.querySelector('[data-detail]')?.hidden,
  currentSlots: document.querySelectorAll('.folder-slot.is-current').length,
  visibleFolders: [...document.querySelectorAll('.folder')].filter(f => getComputedStyle(f).visibility !== 'hidden').length
}));

await page.goto('http://127.0.0.1:4321/?hold=flip&nocache=' + Date.now(), { waitUntil: 'networkidle' });
await page.locator('.folder').filter({ hasText: /Daughters/i }).first().click({ force: true });
await page.waitForTimeout(2200);
await page.screenshot({ path: path.join(out, '08-hold-flip.png') });
const holdDiag = await page.evaluate(() => {
  const leaf = document.querySelector('.sheet.is-hold .sheet__leaf');
  const r = leaf?.getBoundingClientRect();
  return {
    hold: !!document.querySelector('.sheet.is-hold'),
    receiving: !!document.querySelector('.sheet.is-receiving'),
    transform: leaf && getComputedStyle(leaf).transform,
    rect: r && { x: +r.x.toFixed(0), y: +r.y.toFixed(0), w: +r.width.toFixed(0), h: +r.height.toFixed(0) }
  };
});
fs.writeFileSync(path.join(out, 'diag-hold.json'), JSON.stringify(holdDiag, null, 2));

const inFrame = (r) => r && r.y > -80 && (r.y + r.h) < 980 && r.h < 1400;
const midSamples = samples.filter(s => s.flipping && s.rect);
const worstH = Math.max(0, ...midSamples.map(s => s.rect.h));
const first02 = samples.find(s => s.counter === '02');

console.log(JSON.stringify({
  openDiag,
  counterBefore,
  counterAfter,
  first02At: first02 && first02.t,
  worstLeafH: worstH,
  midRectsOk: midSamples.length ? midSamples.every(s => inFrame(s.rect)) : false,
  homeDiag,
  holdDiag,
  holdInFrame: inFrame(holdDiag.rect)
}, null, 2));
await browser.close();
