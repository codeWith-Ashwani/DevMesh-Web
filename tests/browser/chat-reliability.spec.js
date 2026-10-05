import { test, expect } from '@playwright/test';
const api = 'http://localhost:7778';
async function login(context, name) {
  const response = await context.request.post(api + '/login', { data: { email: `${name}@devmesh.example`, password: 'TestPassword#2026' } });
  expect(response.ok()).toBeTruthy();
}

test('switching conversations keeps one socket connection', async ({ page, context }) => {
  await login(context, 'alice');
  const peers = await (await context.request.get(api + '/user/connections')).json();
  const bob = peers.data.find(p => p.firstName === 'Bob');
  const rooms = [];
  for (const name of ['Stable connection one', 'Stable connection two']) {
    const response = await context.request.post(api + '/conversations/group', { data: { name, members: [bob._id] } });
    rooms.push((await response.json()).data);
  }
  let connections = 0;
  page.on('websocket', socket => { if (socket.url().includes('/socket.io/')) connections++; });
  await page.goto(`/messages/${rooms[0]._id}`);
  await expect(page.getByText(/^Connected(?: ·|$)/)).toBeVisible();
  await page.getByRole('link', { name: 'Stable connection two group' }).click();
  await expect(page.getByRole('heading', { name: 'Stable connection two', exact: true })).toBeVisible();
  await expect(page.getByText(/^Connected(?: ·|$)/)).toBeVisible();
  expect(connections).toBe(1);
  await context.setOffline(true);
  await expect(page.getByRole('alert')).toContainText(/offline|disconnected|Could not connect/);
  await page.getByRole('button', { name: 'New group' }).click();
  await page.getByLabel('Group name').fill('Controls still respond offline');
  await expect(page.getByLabel('Group name')).toHaveValue('Controls still respond offline');
  await page.getByRole('button', { name: 'New group' }).click();
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Draft survives reconnect');
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Reconnect', exact: true }).click();
  await context.setOffline(false);
  await expect(page.getByText(/^Connected(?: ·|$)/)).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('Draft survives reconnect');
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeEnabled();
});

test('a newly created group appears in the invited member inbox without refreshing', async ({ browser }) => {
  const a = await browser.newContext({ baseURL: 'http://localhost:5173' });
  const b = await browser.newContext({ baseURL: 'http://localhost:5173' });
  try {
    await login(a, 'alice'); await login(b, 'bob');
    const pa = await a.newPage(), pb = await b.newPage();
    await Promise.all([pa.goto('/messages'), pb.goto('/messages')]);
    await expect(pb.getByRole('heading', { name: 'Conversations', exact: true })).toBeVisible();
    await pa.getByRole('button', { name: 'New group' }).click();
    await pa.getByLabel('Group name').fill('Live group invitation');
    await pa.getByRole('checkbox', { name: 'Bob Developer' }).check();
    await pa.getByRole('button', { name: 'Create group' }).click();
    await expect(pa.getByRole('heading', { name: 'Live group invitation', exact: true })).toBeVisible();
    const invitation = pb.getByRole('link', { name: 'Live group invitation group' });
    await expect(invitation).toBeVisible();
    await invitation.click();
    await expect(pb.getByRole('heading', { name: 'Live group invitation', exact: true })).toBeVisible();
  } finally { await a.close(); await b.close(); }
});

test('empty chat and failed inbox requests explain disabled actions and remain clickable', async ({ page, context }) => {
  const response = await context.request.post(api + '/signup', { data: {
    firstName: 'Chat', lastName: 'Newcomer', email: 'chat-empty@devmesh.example', password: 'TestPassword#2026',
  } });
  expect(response.ok()).toBeTruthy();
  let failing = true;
  await page.route(api + '/conversations', route => failing
    ? route.fulfill({ status: 503, json: { message: 'Messaging temporarily unavailable' } })
    : route.continue());
  await page.route(api + '/user/connections', route => route.fulfill({ status: 404, json: { message: 'No connections found' } }));
  await page.goto('/messages');
  await expect(page.getByRole('alert')).toContainText('Messaging temporarily unavailable');
  await page.getByRole('button', { name: 'New group' }).click();
  await page.getByLabel('Group name').fill('First group');
  await expect(page.getByText('Accept a connection before inviting teammates.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create group', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'New group' }).click();
  failing = false;
  await page.getByRole('button', { name: 'Retry loading chat' }).click();
  await expect(page.getByRole('alert')).not.toBeVisible();
  await expect(page.getByText('No conversations yet.', { exact: false })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).not.toBeVisible();
  await expect(page.getByRole('link', { name: 'Find collaborators to start chatting' })).toBeVisible();
});
