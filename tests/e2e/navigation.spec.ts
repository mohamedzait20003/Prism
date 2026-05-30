import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("nav links are visible on every page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Agent" })).toBeVisible();
  });

  test("clicking Dashboard navigates to /dashboard", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("clicking Agent navigates to /agents/reviewer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Agent" }).click();
    await expect(page).toHaveURL(/\/agents\/reviewer/);
  });
});
