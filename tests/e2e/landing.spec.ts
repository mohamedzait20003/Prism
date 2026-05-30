import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders hero headline and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Code review that");
    await expect(page.getByRole("link", { name: "Get started free" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "View on GitHub" })).toBeVisible();
  });

  test("renders all four feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Instant reviews")).toBeVisible();
    await expect(page.getByText("Security first")).toBeVisible();
    await expect(page.getByText("Learns from feedback")).toBeVisible();
    await expect(page.getByText("Self-improving")).toBeVisible();
  });

  test("renders how-it-works steps", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Connect your repo")).toBeVisible();
    await expect(page.getByText("Open a pull request")).toBeVisible();
    await expect(page.getByText("Review inline comments")).toBeVisible();
    await expect(page.getByText("PRism gets smarter")).toBeVisible();
  });

  test("Get started CTA links to /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Get started free" }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
