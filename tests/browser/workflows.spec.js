import { test, expect } from "@playwright/test";
const api = "http://localhost:7778";
async function login(context, name) {
  const response = await context.request.post(`${api}/login`, {
    data: { email: `${name}@devmesh.example`, password: "TestPassword#2026" },
  });
  expect(response.ok()).toBeTruthy();
}
test("personal and group messages reach another browser immediately", async ({
  browser,
}, testInfo) => {
  const a = await browser.newContext({ baseURL: "http://localhost:5173" }),
    b = await browser.newContext({ baseURL: "http://localhost:5173" });
  try {
    await login(a, "alice");
    await login(b, "bob");
    const peers = await (await a.request.get(`${api}/user/connections`)).json();
    const bob = peers.data.find((p) => p.firstName === "Bob");
    const direct = await (
      await a.request.post(`${api}/conversations/direct`, {
        data: { userId: bob._id },
      })
    ).json();
    const pa = await a.newPage(),
      pb = await b.newPage();
    await Promise.all([
      pa.goto(`/messages/${direct.data._id}`),
      pb.goto(`/messages/${direct.data._id}`),
    ]);
    await expect(pa.getByText(/^Connected(?: ·|$)/)).toBeVisible();
    await expect(pb.getByText(/^Connected(?: ·|$)/)).toBeVisible();
    await pa
      .getByRole("textbox", { name: "Message", exact: true })
      .fill("Personal message delivered live");
    await pa.getByRole("button", { name: "Send", exact: true }).click();
    await expect(
      pb.getByText("Personal message delivered live", { exact: true }),
    ).toBeVisible();
    await pa.getByRole("button", { name: "New group" }).click();
    await pa.getByLabel("Group name").fill("Browser team");
    await pa.getByRole("checkbox", { name: "Bob Developer" }).check();
    await pa.getByRole("button", { name: "Create group" }).click();
    await expect(pa).toHaveURL(/\/messages\//);
    await expect(
      pa.getByRole("heading", { name: "Browser team", exact: true }),
    ).toBeVisible();
    await pb.goto(pa.url());
    await expect(pb.getByText(/^Connected(?: ·|$)/)).toBeVisible();
    await pa
      .getByRole("textbox", { name: "Message", exact: true })
      .fill("Group message delivered live");
    await pa.getByRole("button", { name: "Send", exact: true }).click();
    await expect(
      pb.getByText("Group message delivered live", { exact: true }),
    ).toBeVisible();
    await pb.reload();
    await expect(
      pb.getByText("Group message delivered live", { exact: true }),
    ).toBeVisible();
    await pa.screenshot({
      path: testInfo.outputPath("group-chat.png"),
      fullPage: true,
    });
    await pa.setViewportSize({ width: 390, height: 844 });
    await expect(
      pa.getByRole("textbox", { name: "Message", exact: true }),
    ).toBeVisible();
    await expect(
      pa.getByRole("heading", { name: "Conversations", exact: true }),
    ).not.toBeVisible();
    expect(
      await pa.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await pa.screenshot({
      path: testInfo.outputPath("mobile-group-chat.png"),
      fullPage: true,
    });
    await pa.getByRole("link", { name: "All conversations" }).click();
    await expect(
      pa.getByRole("heading", { name: "Conversations", exact: true }),
    ).toBeVisible();
  } finally {
    await a.close();
    await b.close();
  }
});
test("availability and project team workspace work in the browser", async ({
  page,
  context,
}, testInfo) => {
  await login(context, "alice");
  await page.goto("/collaborate");
  await page
    .getByLabel("Preferred roles, separated by commas")
    .fill("Frontend");
  await page
    .getByRole("button", { name: "Renew availability and find projects" })
    .click();
  await expect(page.getByRole("status")).toContainText("Availability renewed");
  await page.goto("/projects");
  await page.getByRole("button", { name: "New Project" }).click();
  await page
    .getByLabel("Project title", { exact: true })
    .fill("Browser collaboration project");
  await page
    .getByLabel("What are you building?")
    .fill(
      "A small team project with a clear deliverable and contribution evidence.",
    );
  await page.getByLabel("Tech stack, separated by commas").fill("React");
  await page.getByLabel("Roles needed, separated by commas").fill("Frontend");
  await page.getByLabel("First deliverable").fill("A working signup page");
  await page.getByRole("button", { name: "Publish project" }).click();
  const projectCard = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Browser collaboration project",
      exact: true,
    }),
  });
  await expect(projectCard).toBeVisible();
  await projectCard.getByRole("link", { name: "Open team workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Browser collaboration project" }),
  ).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Ship signup");
  await page
    .getByLabel("What does done look like?")
    .fill("Working signup and passing tests");
  await page.getByLabel("Assignee").selectOption({ label: "Alice Developer" });
  await page
    .getByLabel("Deadline", { exact: true })
    .fill(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  await page.getByRole("button", { name: "Create milestone" }).click();
  await expect(
    page.getByRole("heading", { name: "Ship signup" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("team-workspace.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open team group chat" }).click();
  await expect(page.getByText(/^Connected(?: ·|$)/)).toBeVisible();
});
test("collaboration and messages fit a mobile viewport", async ({
  page,
  context,
}, testInfo) => {
  await login(context, "bob");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/collaborate");
  await expect(
    page.getByRole("heading", { name: "Find your team" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("mobile-collaboration.png"),
    fullPage: true,
  });
  await page.goto("/messages");
  await expect(
    page.getByRole("heading", { name: "Messages", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});
