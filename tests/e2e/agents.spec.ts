import { test, expect } from "@playwright/test";

const mockConfig = {
  soul: "# Identity\n\nYou are a senior software engineer.",
  rules: "# Rules\n\n## Must always flag\n\n- eval()",
  commits: [],
};

const mockProposals = [
  {
    id: "p1",
    proposedSoul: null,
    proposedRules: "# Rules\n\n## Updated rules\n\n- eval()\n- console.log",
    reasoning: "console-log was rejected 4 times",
    createdAt: new Date().toISOString(),
  },
];

test.describe("Admin Agents page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/admin/agents/reviewer", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockConfig),
      })
    );

    await page.route("**/api/admin/agents/reviewer/proposals", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProposals),
      })
    );

    await page.route("**/api/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "a1", email: "admin@test.com", role: "ADMIN", name: "Admin" },
        }),
      })
    );
  });

  test("renders page heading", async ({ page }) => {
    await page.goto("/admin/agents");
    await expect(page.getByRole("heading", { name: "Agent Rules" })).toBeVisible();
  });

  test("shows current RULES section", async ({ page }) => {
    await page.goto("/admin/agents");
    await expect(page.getByText("RULES")).toBeVisible();
  });

  test("shows current SOUL section", async ({ page }) => {
    await page.goto("/admin/agents");
    await expect(page.getByText("SOUL")).toBeVisible();
  });

  test("shows Proposed Changes panel", async ({ page }) => {
    await page.goto("/admin/agents");
    await expect(page.getByText("Proposed Changes")).toBeVisible();
  });

  test("shows proposal with reasoning", async ({ page }) => {
    await page.goto("/admin/agents");
    await expect(page.getByText("console-log was rejected 4 times")).toBeVisible();
  });

  test("shows Approve and Reject buttons on proposal", async ({ page }) => {
    await page.goto("/admin/agents");
    await expect(page.getByRole("button", { name: /Approve/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reject/ })).toBeVisible();
  });
});
