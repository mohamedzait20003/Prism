import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("PRism brand and Sign in link are visible when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "PRism" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("Sign in nav link goes to /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("PRism brand links back to landing", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "PRism" }).click();
    await expect(page).toHaveURL("/");
  });
});
