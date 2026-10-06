import { test, expect } from '@playwright/test';
const api = 'http://localhost:7778';
async function login(context, name = 'alice') {
  expect((await context.request.post(api + '/login', { data: { email: `${name}@devmesh.example`, password: 'TestPassword#2026' } })).ok()).toBeTruthy();
}
async function group(context, name) {
  const peers = (await (await context.request.get(api + '/user/connections')).json()).data;
  const response = await context.request.post(api + '/conversations/group', { data: { name, members: [peers.find(peer => peer.firstName === 'Bob')._id] } });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).data;
}

test('navigation retains the document, socket, inbox and per-conversation drafts', async ({ page, context }, testInfo) => {
  await login(context);
  const one = await group(context, 'Persistent first room');
  await group(context, 'Persistent second room');
  let documents = 0, sockets = 0, inbox = 0, people = 0, projects = 0;
  page.on('request', request => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++;
    if (request.url() === api + '/conversations') inbox++;
    if (request.url() === api + '/user/connections') people++;
    if (request.url() === api + '/projects?page=1&limit=12') projects++;
  });
  page.on('websocket', socket => { if (socket.url().includes('/socket.io/')) sockets++; });
  await page.goto(`/messages/${one._id}`);
  await expect(page.getByText(/^Connected(?: ·|$)/)).toBeVisible();
  await expect(page.getByText('No messages yet.', { exact: false })).toBeVisible();
  await expect(page.locator('a[href^="/chat/"]').filter({ hasText: 'Bob Developer' })).toBeVisible();
  await page.evaluate(() => { window.__navigationMarker = 'same-document'; });
  const initialInbox = inbox, initialPeople = people;
  const draft = page.getByRole('textbox', { name: 'Message', exact: true });
  await draft.fill('First room unsent draft');
  await page.getByRole('link', { name: 'Persistent second room group' }).click();
  await expect(page.getByRole('heading', { name: 'Persistent second room', exact: true })).toBeVisible();
  await expect(draft).toHaveValue('');
  await draft.fill('Second room unsent draft');
  await page.locator('aside[aria-label="Main navigation"]').getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Find a problem worth solving.' })).toBeVisible();
  await page.locator('aside[aria-label="Main navigation"]').getByRole('link', { name: 'Messages', exact: true }).click();
  await page.getByRole('link', { name: 'Persistent first room group' }).click();
  await expect(draft).toHaveValue('First room unsent draft');
  await page.getByRole('link', { name: 'Persistent second room group' }).click();
  await expect(draft).toHaveValue('Second room unsent draft');
  await page.locator('aside[aria-label="Main navigation"]').getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Find a problem worth solving.' })).toBeVisible();
  expect(await page.evaluate(() => window.__navigationMarker)).toBe('same-document');
  expect({ documents, sockets, inbox, people, projects }).toEqual({ documents: 1, sockets: 1, inbox: initialInbox, people: initialPeople, projects: 1 });
  await testInfo.attach('navigation-request-counts', { body: JSON.stringify({ documents, sockets, inbox, people, projects }), contentType: 'application/json' });
});

test('sending renders immediately and a rejected acknowledgement can retry without duplicates', async ({ page, context }) => {
  await login(context);
  const room = await group(context, 'Delivery feedback room');
  let rejectDelivery;
  let first = true;
  await page.routeWebSocket('**/socket.io/**', websocket => {
    const server = websocket.connectToServer();
    websocket.onMessage(message => {
      const match = typeof message === 'string' && /^42(\d+)(\[.*)$/.exec(message);
      if (first && match && JSON.parse(match[2])[0] === 'message:send') {
        first = false;
        rejectDelivery = () => websocket.send(`43${match[1]}[${JSON.stringify({ ok: false, status: 503, message: 'Test delivery unavailable' })}]`);
      } else server.send(message);
    });
  });
  await page.goto(`/messages/${room._id}`);
  await expect(page.getByText(/^Connected(?: ·|$)/)).toBeVisible();
  const input = page.getByRole('textbox', { name: 'Message', exact: true });
  await input.fill('Immediate delivery feedback');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  const stream = page.getByRole('log', { name: 'Messages' });
  await expect(stream.getByText('Immediate delivery feedback', { exact: true })).toBeVisible();
  await expect(input).toHaveValue('');
  await expect(stream.getByText('Sending…', { exact: true })).toBeVisible();
  const nav = page.locator('aside[aria-label="Main navigation"]');
  await nav.getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Find a problem worth solving.' })).toBeVisible();
  await nav.getByRole('link', { name: 'Messages', exact: true }).click();
  await page.getByRole('link', { name: 'Delivery feedback room group' }).click();
  await expect(stream.getByText('Sending…', { exact: true })).toBeVisible();
  await expect.poll(() => typeof rejectDelivery).toBe('function');
  rejectDelivery();
  await expect(page.getByRole('button', { name: 'Retry message' })).toBeVisible();
  await input.fill('New draft while retrying');
  await page.getByRole('button', { name: 'Retry message' }).click();
  await expect(page.getByRole('button', { name: 'Retry message' })).not.toBeVisible();
  await expect(stream.getByText('Immediate delivery feedback', { exact: true })).toHaveCount(1);
  await expect(input).toHaveValue('New draft while retrying');
  const history = (await (await context.request.get(api + `/conversations/${room._id}/messages`)).json()).data;
  expect(history.filter(message => message.text === 'Immediate delivery feedback')).toHaveLength(1);
});

test('messages arriving on another page update the inbox and cached history', async ({ browser }) => {
  const a = await browser.newContext({ baseURL: 'http://localhost:5173' });
  const b = await browser.newContext({ baseURL: 'http://localhost:5173' });
  try {
    await login(a); await login(b, 'bob');
    const room = await group(a, 'Background delivery room');
    const pa = await a.newPage(), pb = await b.newPage();
    await Promise.all([pa.goto(`/messages/${room._id}`), pb.goto(`/messages/${room._id}`)]);
    await expect(pa.getByText(/^Connected(?: ·|$)/)).toBeVisible();
    await expect(pb.getByText(/^Connected(?: ·|$)/)).toBeVisible();
    await pb.locator('aside[aria-label="Main navigation"]').getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(pb.getByRole('heading', { name: 'Find a problem worth solving.' })).toBeVisible();
    await pa.getByRole('textbox', { name: 'Message', exact: true }).fill('Arrived while you were browsing');
    await pa.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(pa.getByRole('log', { name: 'Messages' }).getByText('Arrived while you were browsing')).toBeVisible();
    await pb.locator('aside[aria-label="Main navigation"]').getByRole('link', { name: 'Messages', exact: true }).click();
    const link = pb.getByRole('link', { name: 'Background delivery room group' });
    await expect(link).toContainText('Arrived while you were browsing');
    await link.click();
    await expect(pb.getByRole('log', { name: 'Messages' }).getByText('Arrived while you were browsing', { exact: true })).toBeVisible();
  } finally { await a.close(); await b.close(); }
});

test('logging out clears another user’s drafts and cached project data', async ({ page, context }) => {
  await login(context);
  const room = await group(context, 'Private draft room');
  let projectReads = 0;
  await page.route(api + '/projects?page=1&limit=12', route => {
    projectReads++;
    return route.fulfill({ json: { data: [] } });
  });
  await page.goto(`/messages/${room._id}`);
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Alice private draft');
  const nav = page.locator('aside[aria-label="Main navigation"]');
  await nav.getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Find a problem worth solving.' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByLabel('Email address').fill('bob@devmesh.example');
  await page.getByLabel('Password', { exact: true }).fill('TestPassword#2026');
  await page.getByRole('button', { name: 'Enter your workspace' }).click();
  await expect(page.getByRole('heading', { name: 'Let’s build something, Bob.' })).toBeVisible();
  await nav.getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Find a problem worth solving.' })).toBeVisible();
  expect(projectReads).toBe(2);
  await nav.getByRole('link', { name: 'Messages', exact: true }).click();
  await page.getByRole('link', { name: 'Private draft room group' }).click();
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('');
});

test('leaving a loading page does not cancel a shared read needed by the destination', async ({ page, context }) => {
  await login(context);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let reads = 0;
  await page.route(api + '/user/connections', async route => {
    reads++;
    await gate;
    await route.fulfill({ json: { data: [{ _id: '507f1f77bcf86cd799439011', firstName: 'Shared', lastName: 'Teammate', skills: [] }] } });
  });
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Let’s build something, Alice.' })).toBeVisible();
    await expect.poll(() => reads).toBe(1);
    await page.locator('aside[aria-label="Main navigation"]').getByRole('link', { name: 'Connections', exact: true }).click();
    await expect(page.getByText('Loading network topology...')).toBeVisible();
    release();
    await expect(page.getByRole('heading', { name: 'Shared Teammate' })).toBeVisible();
    expect(reads).toBe(1);
    await expect(page.getByRole('alert')).not.toBeVisible();
  } finally { release(); }
});

test('denied history clears previously cached messages and disables the composer', async ({ page, context }) => {
  await login(context);
  const room = await group(context, 'Revoked history room');
  await page.goto(`/messages/${room._id}`);
  await expect(page.getByText(/^Connected(?: ·|$)/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Remove this cached history after access is denied');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByRole('log', { name: 'Messages' }).getByText('Remove this cached history after access is denied')).toBeVisible();
  const nav = page.locator('aside[aria-label="Main navigation"]');
  await nav.getByRole('link', { name: 'Projects', exact: true }).click();
  await page.route(api + `/conversations/${room._id}/messages**`, route => route.fulfill({ status: 403, json: { message: 'Conversation access denied' } }));
  await nav.getByRole('link', { name: 'Messages', exact: true }).click();
  await page.getByRole('link', { name: 'Revoked history room group' }).click();
  await expect(page.getByRole('alert')).toContainText('Conversation access denied');
  await expect(page.getByRole('log', { name: 'Messages' }).getByText('Remove this cached history after access is denied')).not.toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).not.toBeVisible();
});
