import { test, expect } from "@playwright/test";
const api = "http://localhost:7778";
async function login(context) {
  await context.route("https://example.com/avatar.png", (route) =>
    route.abort(),
  );
  const response = await context.request.post(api + "/login", {
    data: { email: "alice@devmesh.example", password: "TestPassword#2026" },
  });
  expect(response.ok()).toBeTruthy();
}

test("workbench shows real projects and the companion tour supports keyboard navigation", async ({
  page,
  context,
}, testInfo) => {
  await login(context);
  const response = await context.request.post(api + "/projects", {
    data: {
      title: "Build a developer reading room",
      description:
        "A quiet shared space to collect engineering articles and discuss what we learn.",
      techStack: ["React", "Node.js"],
      rolesNeeded: ["Frontend"],
      firstDeliverable: "Save and discuss one article with a teammate",
      durationWeeks: 4,
    },
  });
  expect(response.ok()).toBeTruthy();
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Open navigation menu" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close navigation", exact: true }),
  ).not.toBeVisible();
  const sidebar = page.getByRole("complementary", { name: "Main navigation" });
  expect((await sidebar.boundingBox()).width).toBe(248);
  await expect(
    page.getByRole("img", { name: "Alice Developer", exact: true }).first(),
  ).toHaveText("AD");
  await expect(
    page.getByRole("heading", { name: "Let’s build something, Alice." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Build a developer reading room/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Overview", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.screenshot({
    path: testInfo.outputPath("desktop-workbench.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect.poll(async () => (await sidebar.boundingBox()).width).toBe(76);
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page
    .getByRole("button", { name: "Open Patch, your workspace guide" })
    .click();
  const guide = page.getByRole("dialog", { name: "Workspace guide" });
  await expect(guide).toBeVisible();
  await guide.getByRole("button", { name: "Pixel", exact: true }).click();
  await expect(guide.getByText("Hey, I’m Pixel.")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("pixel-guide.png"),
    fullPage: true,
  });
  await guide.getByRole("button", { name: "Show me around" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    guide.getByRole("heading", { name: "Start with your developer profile" }),
  ).toBeVisible();
  await guide.getByRole("button", { name: "Next stop" }).click();
  await expect(page).toHaveURL(/\/collaborate$/);
  await expect(
    guide.getByRole("heading", { name: "Find a team that fits your time" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(guide).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open Pixel, your workspace guide" }),
  ).toBeFocused();
  await page.reload();
  await page.getByRole("button", { name: "Jump to a page" }).click();
  await page.getByRole("combobox", { name: "Find a page" }).fill("messages");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/messages$/);
  await page
    .getByRole("button", { name: "Open Pixel, your workspace guide" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Keep the conversation moving" }),
  ).toBeVisible();
});

test("mobile navigation and guide fit the screen and retain keyboard focus", async ({
  page,
  context,
}, testInfo) => {
  await login(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your project spaces" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("mobile-workbench.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const navigation = page.getByRole("dialog", { name: "Main navigation" });
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "Discover developers" }).click();
  await expect(page).toHaveURL(/\/feed$/);
  await expect(navigation).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Meet your next collaborator." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open Patch, your workspace guide" })
    .click();
  const guide = page.getByRole("dialog", { name: "Workspace guide" });
  await guide.getByRole("button", { name: "Show me around" }).focus();
  await page.keyboard.press("Tab");
  await expect(
    guide.getByRole("button", { name: "Close guide" }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  const bounds = await guide.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: testInfo.outputPath("mobile-guide.png"),
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open Patch, your workspace guide" }),
  ).toBeFocused();
});

test("sign in form has accessible fields and enters the workspace", async ({
  page,
}, testInfo) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: /You bring the idea/ }),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("bob@devmesh.example");
  await page.getByLabel("Password", { exact: true }).fill("TestPassword#2026");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Hide password" }).click();
  await page.screenshot({
    path: testInfo.outputPath("developer-login.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Enter your workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Let’s build something, Bob." }),
  ).toBeVisible();
});
