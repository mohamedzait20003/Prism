import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/stats", (route) =>
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

    await page.route("**/api/reviews", (route) =>
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
  });

  test("shows all four metric cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Reviews")).toBeVisible();
    await expect(page.getByText("Comments")).toBeVisible();
    await expect(page.getByText("Approval rate")).toBeVisible();
    await expect(page.getByText("Feedback entries")).toBeVisible();
  });

  test("displays correct metric values", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("12")).toBeVisible();
    await expect(page.getByText("47")).toBeVisible();
    await expect(page.getByText("83%")).toBeVisible();
    await expect(page.getByText("9")).toBeVisible();
  });

  test("shows recent reviews table with data", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("org/repo")).toBeVisible();
    await expect(page.getByText("#42")).toBeVisible();
    await expect(page.getByRole("link", { name: "View →" })).toBeVisible();
  });

  test("shows top rejected rules", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("console-log")).toBeVisible();
    await expect(page.getByText("eval-injection")).toBeVisible();
  });
});
