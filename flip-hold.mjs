import { chromium } from 'playwright';
import fs from 'fs';
const out = '/Users/tanishq.bafna/Projects/tanishqbafna-portfolio/flip-shots';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://127.0.0.1:4321/?hold=flip&nocache=' + Date.now(), { waitUntil: 'networkidle' });
const daughters = page.locator('.folder, a, button').filter({ hasText: /Daughters/i }).first();
await daughters.click({ force: true });
await page.waitForTimeout(1400);
await page.screenshot({ path: out + '/05-hold-mid.png' });
const samples = [];
for (const ms of [0, 120, 240, 400, 560, 780]) {
  if (ms === 0) {
    // start a fresh open without hold for timed samples
  }
}
await browser.close();

// second pass: timed transforms during Next
const browser2 = await chromium.launch({ headless: true });
const page2 = await browser2.newPage({ viewport: { width: 1280, height: 800 } });
await page2.goto('http://127.0.0.1:4321/?nocache=' + Date.now(), { waitUntil: 'networkidle' });
await page2.locator('.folder, a, button').filter({ hasText: /Daughters/i }).first().click({ force: true });
await page2.waitForTimeout(1400);
await page2.evaluate(() => {
  window.__flipSamples = [];
  const leaf = document.querySelector('.sheet.is-active .sheet__leaf, .sheet__leaf');
  const obs = new MutationObserver(() => {});
  const tick = () => {
    const flipping = document.querySelector('.sheet.is-flipping .sheet__leaf');
    const el = flipping || document.querySelector('.sheet.is-active .sheet__leaf');
    if (!el) return;
    const cs = getComputedStyle(el);
    window.__flipSamples.push({
      t: performance.now(),
      transform: cs.transform,
      flipping: !!document.querySelector('.sheet.is-flipping'),
      counter: document.querySelector('[data-rail-count], .rail__count, [data-page-count]')?.textContent || document.body.innerText.match(/\d+\s*\/\s*\d+/)?.[0]
    });
  };
  window.__flipTick = setInterval(tick, 40);
});
await page2.locator('[data-rail-next]').click();
await page2.waitForTimeout(1100);
const timed = await page2.evaluate(() => {
  clearInterval(window.__flipTick);
  return window.__flipSamples;
});
fs.writeFileSync(out + '/timed.json', JSON.stringify(timed, null, 2));
for (const ms of [80, 200, 360, 520]) {
  // already done in first run for hold; extra mid frames from re-run
}
// one more: screenshot at 360ms into flip
await page2.goto('http://127.0.0.1:4321/?nocache=' + Date.now(), { waitUntil: 'networkidle' });
await page2.locator('.folder, a, button').filter({ hasText: /Daughters/i }).first().click({ force: true });
await page2.waitForTimeout(1400);
const shotAt = async (delay, name) => {
  const p = page2.waitForTimeout(delay).then(() => page2.screenshot({ path: out + '/' + name }));
  await page2.locator('[data-rail-next]').click();
  await p;
  await page2.waitForTimeout(900);
};
await shotAt(360, '06-flip-360.png');
await page2.goto('http://127.0.0.1:4321/?nocache=' + Date.now(), { waitUntil: 'networkidle' });
await page2.locator('.folder, a, button').filter({ hasText: /Daughters/i }).first().click({ force: true });
await page2.waitForTimeout(1400);
await shotAt(480, '07-flip-480.png');
console.log(JSON.stringify(timed.slice(0, 25), null, 2));
await browser2.close();
