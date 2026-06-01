import { test, expect } from "@playwright/test";

test.describe("Client Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/client/stats", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalReviews: 12,
          totalComments: 47,
          approvalRate: 83,
          feedbackCount: 9,
          topRules: [
            { ruleId: "console-log", count: 4 },
            { ruleId: "eval-injection", count: 2 },
          ],
        }),
      })
    );

    await page.route("**/api/client/reviews", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "clr1",
            repo: "org/repo",
            prNum: 42,
            commentCount: 3,
            createdAt: new Date().toISOString(),
          },
        ]),
      })
    );

    await page.route("**/api/client/repos", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { id: "repo1", fullName: "org/repo", active: true, createdAt: new Date().toISOString() },
        ]),
      })
    );

    await page.route("**/api/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: { id: "u1", email: "test@test.com", role: "CLIENT", name: "Test User" },
        }),
      })
    );
  });

  test("shows metric cards", async ({ page }) => {
    await page.goto("/client/dashboard");
    await expect(page.getByText("Reviews")).toBeVisible();
    await expect(page.getByText("Findings")).toBeVisible();
    await expect(page.getByText("Approval rate")).toBeVisible();
  });

  test("shows recent reviews section", async ({ page }) => {
    await page.goto("/client/dashboard");
    await expect(page.getByText("Recent Reviews")).toBeVisible();
  });

  test("shows connected repositories section", async ({ page }) => {
    await page.goto("/client/dashboard");
    await expect(page.getByText("Repositories")).toBeVisible();
  });
});
