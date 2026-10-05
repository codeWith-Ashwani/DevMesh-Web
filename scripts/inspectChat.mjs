// Diagnostic: deployed assets with mocked API responses; no production writes.
import { chromium } from '@playwright/test';
const site = 'https://devmesh-ten.vercel.app';
const api = 'https://devmesh-7yod.onrender.com';
const me = { _id: '507f1f77bcf86cd799439011', firstName: 'Diagnostic', lastName: 'Developer', skills: [] };
const peer = { _id: '507f1f77bcf86cd799439012', firstName: 'Test', lastName: 'Teammate' };
const room = { _id: '507f1f77bcf86cd799439013', kind: 'direct', owner: me._id, members: [me, peer] };
const browser = await chromium.launch({ channel: 'msedge' });
try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(api + '/**', route => {
      const path = new URL(route.request().url()).pathname;
      const data = path === '/profile/view' ? me
        : path === '/user/connections' ? { data: [peer] }
        : path === '/conversations/direct' ? { data: room }
        : path.endsWith('/messages') ? { data: [], before: null, after: null, hasMore: false }
        : path === '/conversations/' + room._id ? { data: room }
        : path === '/conversations' ? { data: [room], hasMore: false, before: room._id }
        : { data: [] };
      return route.fulfill({ json: data, headers: { 'access-control-allow-origin': site, 'access-control-allow-credentials': 'true' } });
    });
    await page.goto(site + '/messages');
    const group = page.getByRole('button', { name: 'New group' });
    await group.click({ timeout: 10000 });
    await page.getByLabel('Group name').fill('Click diagnostic');
    await page.getByRole('checkbox', { name: 'Test Teammate' }).check();
    const checked = await page.getByRole('checkbox', { name: 'Test Teammate' }).isChecked();
    await group.click();
    await page.locator(`a[href="/chat/${peer._id}"]`).click();
    await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Draft diagnostic');
    console.log(JSON.stringify({ width, groupControlsClickable: checked, draft: await page.getByRole('textbox', { name: 'Message', exact: true }).inputValue(), url: page.url(), errors }));
    await page.screenshot({ path: `test-results/chat-diagnostic-${width}.png`, fullPage: true });
    await context.close();
  }
} finally { await browser.close(); }
