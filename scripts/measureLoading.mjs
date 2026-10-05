// Read-only browser measurements; no signup, login or writes to the target site.
import { chromium } from '@playwright/test';
const target = process.argv[2] || 'https://devmesh-ten.vercel.app/login';
const browser = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {});
try {
  const results = [];
  for (let i = 0; i < 3; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(target, { waitUntil: 'load', timeout: 60000 });
    await page.locator('h1').first().waitFor();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    results.push(await page.evaluate(() => ({
      navigation: performance.getEntriesByType('navigation').map(n => ({ ttfbMs: Math.round(n.responseStart), domContentLoadedMs: Math.round(n.domContentLoadedEventEnd), loadMs: Math.round(n.loadEventEnd) }))[0],
      paint: performance.getEntriesByType('paint').map(p => ({ name: p.name, ms: Math.round(p.startTime) })),
      assets: performance.getEntriesByType('resource').filter(r => /assets\/.*\.js|fonts\.googleapis/.test(r.name)).map(r => ({ url: r.name, durationMs: Math.round(r.duration), transferredBytes: r.transferSize })),
    })));
    await context.close();
  }
  console.log(JSON.stringify({ target, environment: 'Fresh browser contexts on this machine; normal network, no CPU throttling', results }, null, 2));
} finally {
  await browser.close();
}
