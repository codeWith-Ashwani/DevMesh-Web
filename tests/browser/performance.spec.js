import { test, expect } from '@playwright/test';
const api = 'http://localhost:7778';

test('login renders while the external font server is still pending', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('https://fonts.googleapis.com/**', async route => {
    await gate;
    await route.fulfill({ contentType: 'text/css', body: '' });
  });
  try {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
  } finally { release(); }
});

test('slow conversations and graph enrichment do not block ready sections or navigation', async ({ page, context }) => {
  const signup = await context.request.post(api + '/signup', { data: {
    firstName: 'Responsive', lastName: 'Builder', email: 'responsive@devmesh.example', password: 'TestPassword#2026',
  } });
  expect(signup.ok()).toBeTruthy();
  let releaseInbox, releaseGraph;
  const inboxGate = new Promise(resolve => { releaseInbox = resolve; });
  const graphGate = new Promise(resolve => { releaseGraph = resolve; });
  await page.route(api + '/conversations', async route => {
    await inboxGate;
    await route.fulfill({ json: { data: [] } }).catch(() => {});
  });
  await page.route(api + '/user/connections', route => route.fulfill({ json: { data: [{
    _id: '507f1f77bcf86cd799439011', firstName: 'Ready', lastName: 'Teammate', skills: [],
  }] } }));
  await page.route(api + '/projects?limit=50', route => route.fulfill({ json: { data: [{
    _id: '507f1f77bcf86cd799439012', title: 'Ready project', description: 'A project that loaded quickly.', isTeamMember: true, stage: 'Building', teamSize: 1, durationWeeks: 4,
  }] } }));
  await page.route(api + '/projects', async route => {
    await graphGate;
    await route.fulfill({ json: { data: [] } }).catch(() => {});
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Ready project', { exact: true })).toBeVisible();
    await expect(page.getByText('Loading conversations…', { exact: true })).toBeVisible();
    await page.locator('aside').getByRole('link', { name: 'Connections', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Ready Teammate' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Jump to a page' })).toBeVisible();
  } finally { releaseInbox(); releaseGraph(); }
});
