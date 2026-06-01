import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
  test("login page renders heading and GitHub button", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: "Sign in to PRism" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Continue with GitHub/ })).toBeVisible();
  });

  test("register page renders heading and GitHub button", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign up with GitHub/ })).toBeVisible();
  });

  test("register page shows admin note", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByText(/make-admin/)).toBeVisible();
  });

  test("unauthenticated /client/dashboard redirects to auth", async ({ page }) => {
    await page.goto("/client/dashboard");
    await expect(page).toHaveURL(/\/auth\/login|\/api\/auth/);
  });

  test("unauthenticated /admin/dashboard redirects to auth", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/auth\/login|\/api\/auth/);
  });

  test("unauthenticated /admin/agents redirects to auth", async ({ page }) => {
    await page.goto("/admin/agents");
    await expect(page).toHaveURL(/\/auth\/login|\/api\/auth/);
  });
});
