import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("renders brand, heading and GitHub button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome to PRism" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Continue with GitHub/ })).toBeVisible();
  });

  test("shows privacy note", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/PRism only reads pull request diffs/)).toBeVisible();
  });

  test("unauthenticated /dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login|\/api\/auth/);
  });

  test("unauthenticated /agents redirects to login", async ({ page }) => {
    await page.goto("/agents/reviewer");
    await expect(page).toHaveURL(/\/login|\/api\/auth/);
  });
});
