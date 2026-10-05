import { test, expect } from "@playwright/test";
const api = "http://localhost:7778";
async function login(context) {
  const response = await context.request.post(api + "/login", {
    data: { email: "alice@devmesh.example", password: "TestPassword#2026" },
  });
  expect(response.ok()).toBeTruthy();
}

test("a new account has empty collections without errors, including legacy deployed responses", async ({
  page,
  context,
}) => {
  const signup = await context.request.post(api + "/signup", {
    data: {
      firstName: "New",
      lastName: "Builder",
      email: "empty-network@devmesh.example",
      password: "TestPassword#2026",
    },
  });
  expect(signup.ok()).toBeTruthy();
  for (const path of ["/user/connections", "/user/requests/received"]) {
    const response = await context.request.get(api + path);
    expect(response.status()).toBe(200);
    expect((await response.json()).data).toEqual([]);
  }
  await page.goto("/");
  await expect(
    page.getByText("No conversations yet.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).not.toBeVisible();
  await page.goto("/requests");
  await expect(
    page.getByRole("heading", { name: "No pending connection requests" }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).not.toBeVisible();
  await page.route(api + "/user/connections", (route) =>
    route.fulfill({ status: 404, json: { message: "No connections found" } }),
  );
  await page.route(api + "/user/requests/received", (route) =>
    route.fulfill({
      status: 404,
      json: { message: "No pending connection requests found" },
    }),
  );
  await page.goto("/");
  await expect(
    page.getByText("No conversations yet.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).not.toBeVisible();
  await page.goto("/requests");
  await expect(
    page.getByRole("heading", { name: "No pending connection requests" }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).not.toBeVisible();
});

test("real service failures identify the section and status, then recover on retry", async ({
  page,
  context,
}) => {
  await login(context);
  let unavailable = true;
  await page.route(api + "/conversations", (route) =>
    unavailable
      ? route.fulfill({
          status: 503,
          json: { message: "Messaging temporarily unavailable" },
        })
      : route.continue(),
  );
  await page.route(api + "/collaboration/profile", (route) =>
    unavailable
      ? route.fulfill({ status: 404, json: { message: "Route not found" } })
      : route.continue(),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Could not load: Conversations, Availability.",
  );
  await expect(
    page.getByText("This service is temporarily unavailable.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("This feature is missing from the connected backend.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your project spaces" }),
  ).toBeVisible();
  await expect(
    page.getByText("Project spaces are temporarily unavailable."),
  ).not.toBeVisible();
  await page.getByText("Request details", { exact: true }).first().click();
  await expect(
    page.getByText("GET /conversations · HTTP 503", { exact: true }),
  ).toBeVisible();
  unavailable = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("alert")).not.toBeVisible();
  await expect(
    page.getByText("Conversations are temporarily unavailable."),
  ).not.toBeVisible();
});

test("a misconfigured API response reports an error instead of crashing the workspace", async ({
  page,
  context,
}) => {
  await login(context);
  await page.route(api + "/projects?limit=50", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html>Wrong frontend host</html>",
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Let’s build something, Alice." }),
  ).toBeVisible();
  await expect(page.getByRole("alert")).toContainText(
    "Could not load: Project spaces.",
  );
  await expect(
    page.getByText("The server returned an unexpected response.", {
      exact: false,
    }),
  ).toBeVisible();
});
