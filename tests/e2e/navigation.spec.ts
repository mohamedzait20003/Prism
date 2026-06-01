import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("logo image and Sign in button are visible when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("img", { name: "PRism" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("Sign in button links to /auth/login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("logo links back to landing from auth pages", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("img", { name: "PRism" }).click();
    await expect(page).toHaveURL("/");
  });

  test("Get started button links to /auth/register", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Get started" }).click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
