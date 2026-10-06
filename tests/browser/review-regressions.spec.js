import { test, expect } from '@playwright/test';
const api = 'http://localhost:7778';
async function login(context) {
  const response = await context.request.post(api + '/login', { data: { email: 'alice@devmesh.example', password: 'TestPassword#2026' } });
  expect(response.ok()).toBeTruthy();
}
test('optional profile fields can be cleared and stay cleared after reloading', async ({ page, context }) => {
  await login(context);
  await context.request.patch(api + '/profile/edit', { data: { about: 'Remove this bio', gender: 'Male', age: 25, githubUrl: 'https://github.com/example' } });
  await page.goto('/profile');
  await page.getByLabel('About / Bio', { exact: true }).fill('');
  await page.getByLabel('GitHub URL', { exact: true }).fill('');
  await page.getByLabel('Age', { exact: true }).fill('');
  await page.getByLabel('Gender', { exact: true }).selectOption('');
  await page.getByRole('button', { name: 'Save Profile', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Profile successfully updated');
  await page.reload();
  await expect(page.getByLabel('About / Bio', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('GitHub URL', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Age', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Gender', { exact: true })).toHaveValue('');
});
test('changing workspace parameters resets the prior project and its unsaved forms', async ({ page, context }) => {
  await login(context);
  const ids = [];
  for (const title of ['First isolated workspace', 'Second isolated workspace']) {
    const response = await context.request.post(api + '/projects', { data: { title, description: 'A workspace that must keep its own forms and project state.', techStack: ['React'], rolesNeeded: ['Frontend'] } });
    expect(response.ok()).toBeTruthy(); ids.push((await response.json()).data._id);
  }
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route(api + `/projects/${ids[1]}/workspace`, async route => { await gate; await route.continue().catch(() => {}); });
  try {
    await page.goto(`/projects/${ids[0]}/workspace`);
    await expect(page.getByRole('heading', { name: 'First isolated workspace' })).toBeVisible();
    await page.getByLabel('Title', { exact: true }).fill('Unsaved first project milestone');
    await page.evaluate(id => { history.pushState({}, '', `/projects/${id}/workspace`); dispatchEvent(new PopStateEvent('popstate')); }, ids[1]);
    await expect(page.getByRole('heading', { name: 'First isolated workspace' })).not.toBeVisible();
    release();
    await expect(page.getByRole('heading', { name: 'Second isolated workspace' })).toBeVisible();
    await expect(page.getByLabel('Title', { exact: true })).toHaveValue('');
  } finally { release(); }
});
test('guide updates retain focus on the control being used', async ({ page, context }) => {
  await login(context); await page.goto('/');
  await page.getByRole('button', { name: 'Open Patch, your workspace guide' }).click();
  const guide = page.getByRole('dialog', { name: 'Workspace guide' });
  await guide.getByRole('button', { name: 'Pixel', exact: true }).click();
  await expect(guide.getByRole('button', { name: 'Pixel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(guide).not.toBeVisible();
});
test('invalid collections produce a recoverable error instead of crashing the page', async ({ page, context }) => {
  await login(context);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route(api + '/projects?**', route => route.fulfill({ json: { data: null } }));
  await page.goto('/projects');
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Jump to a page' }).click();
  await expect(page.getByRole('combobox', { name: 'Find a page' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('network graph and controls render while the force layout worker is still loading', async ({ page, context }) => {
  await login(context);
  let release, workerSeen = false;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/networkLayout.worker.js*', async route => { workerSeen = true; await gate; await route.continue().catch(() => {}); });
  await page.route(api + '/user/connections', route => route.fulfill({ json: { data: Array.from({ length: 150 }, (_, i) => ({ _id: (i + 1).toString(16).padStart(24, '0'), firstName: `Peer${i}`, lastName: 'Developer', skills: ['React'] })) } }));
  await page.route(api + '/projects', route => route.fulfill({ json: { data: [] } }));
  try {
    await page.goto('/connections');
    await page.getByRole('button', { name: 'Graph', exact: true }).click();
    await expect.poll(() => workerSeen).toBe(true);
    expect(await page.locator('g.nodes > g').count()).toBeGreaterThan(150);
    await page.getByRole('button', { name: 'Zoom In', exact: true }).click();
    await expect(page.locator('g.links').locator('..')).toHaveAttribute('transform', /scale\(1\.25\)/);
    await page.getByRole('button', { name: 'Jump to a page' }).click();
    await expect(page.getByRole('combobox', { name: 'Find a page' })).toBeVisible();
  } finally { release(); }
});
test('unknown links show a recovery page and keep navigation available', async ({ page, context }) => {
  await login(context); await page.goto('/unknown-workspace-page');
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Back to overview', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Let’s build something, Alice.' })).toBeVisible();
});
test('a rendering failure stays inside the page and the user can return to the overview', async ({ page, context }) => {
  await login(context);
  await page.route(api + '/projects?page=**', route => route.fulfill({ json: { data: [{ _id: '507f1f77bcf86cd799439019', title: 'Malformed fixture', techStack: { invalid: true }, creator: { _id: '507f1f77bcf86cd799439018' } }] } }));
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: 'This page could not open.', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Jump to a page' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to overview', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Let’s build something, Alice.' })).toBeVisible();
});
