// Read-only public checks. Authenticated rendering uses intercepted fixture responses.
// This does not verify real production accounts, database queries or socket delivery.
import { chromium } from '@playwright/test';
const site = process.argv[2] || 'https://devmesh-ten.vercel.app';
const api = process.argv[3] || 'https://devmesh-7yod.onrender.com';
const id = '507f1f77bcf86cd799439011';
const me = { _id: id, firstName: 'Diagnostic', lastName: 'Developer', skills: ['React'] };
const peer = { _id: '507f1f77bcf86cd799439012', firstName: 'Test', lastName: 'Teammate', skills: ['React'] };
const checks = [];
const titles = { '/projects': 'Find a problem worth solving.', '/collaborate': 'Find your team', '/messages': 'Messages', '/feed': 'Meet your next collaborator.', '/connections': 'Your people, one place.', '/requests': 'No pending connection requests', '/profile': 'Let your work introduce you.' };
for (const path of ['/health', '/ready', '/profile/view']) {
  const start = performance.now();
  try {
    const response = await fetch(api + path, { signal: AbortSignal.timeout(20000), headers: { Origin: site } });
    checks.push({ path, status: response.status, ms: Math.round(performance.now() - start), body: await response.json() });
  } catch (error) { checks.push({ path, error: error.name, ms: Math.round(performance.now() - start) }); }
}
const browser = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {});
try {
  const publicPage = await browser.newPage();
  const publicErrors = [];
  publicPage.on('pageerror', error => publicErrors.push(error.message));
  await publicPage.goto(site + '/login', { waitUntil: 'domcontentloaded' });
  await publicPage.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
  checks.push({ publicLogin: true, errors: publicErrors, paint: await publicPage.evaluate(() => performance.getEntriesByType('paint').map(p => ({ name: p.name, ms: Math.round(p.startTime) }))) });
  await publicPage.close();
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    const errors = [], badAssets = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().includes('/assets/') && response.status() >= 400) badAssets.push({ url: response.url(), status: response.status() }); });
    await page.route(api + '/**', route => {
      const path = new URL(route.request().url()).pathname;
      const response = path === '/profile/view' ? me : path === '/feed' ? [peer]
        : path === '/collaboration/profile' ? { data: null }
        : path === '/user/connections' ? { data: [peer] }
        : { data: [], hasMore: false };
      return route.fulfill({ json: response, headers: { 'access-control-allow-origin': site, 'access-control-allow-credentials': 'true' } });
    });
    await page.goto(site + '/', { waitUntil: 'domcontentloaded' });
    await page.locator('main h1').waitFor();
    await page.evaluate(() => { window.auditDocument = 'retained'; });
    const routes = [];
    for (const path of ['/projects', '/collaborate', '/messages', '/feed', '/connections', '/requests', '/profile']) {
      if (width < 768) await page.getByRole('button', { name: 'Open navigation menu' }).click();
      const start = performance.now();
      await page.locator(`aside a[href="${path}"]`).first().click();
      await page.waitForFunction(expected => location.pathname === expected, path);
      await page.getByRole('heading', { name: titles[path], exact: true }).waitFor();
      routes.push({ path, interactionMs: Math.round(performance.now() - start), documentRetained: await page.evaluate(() => window.auditDocument === 'retained'), horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), title: titles[path] });
    }
    await page.screenshot({ path: `test-results/hosted-review-${width}.png`, fullPage: true });
    checks.push({ width, mode: 'Deployed assets with mocked API responses', routes, errors, badAssets });
    await context.close();
  }
  console.log(JSON.stringify({ site, api, checkedAt: new Date().toISOString(), checks }, null, 2));
} catch (error) {
  console.log(JSON.stringify({ site, api, checks, failure: error.message }, null, 2));
  process.exitCode = 1;
} finally { await browser.close(); }
