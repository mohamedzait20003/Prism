import { test, expect } from "@playwright/test";

const mockAgent = {
  soul: "# Identity\n\nYou are a senior software engineer.",
  rules: "# Rules\n\n## Must always flag\n\n- eval()",
  commits: [
    { hash: "abc1234", message: "init: agent definition", date: new Date().toISOString() },
  ],
};

test.describe("Agent editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/agents/reviewer", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAgent),
      })
    );

    await page.route("**/api/agents/reviewer/save", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' })
    );
  });

  test("renders SOUL.md and RULES.md textareas", async ({ page }) => {
    await page.goto("/agents/reviewer");
    await expect(page.getByLabel("SOUL.md")).toBeVisible();
    await expect(page.getByLabel("RULES.md")).toBeVisible();
  });

  test("textareas are pre-filled with current content", async ({ page }) => {
    await page.goto("/agents/reviewer");
    const soul = page.getByLabel("SOUL.md");
    await expect(soul).toHaveValue(/senior software engineer/);
    const rules = page.getByLabel("RULES.md");
    await expect(rules).toHaveValue(/Must always flag/);
  });

  test("Save button posts to /api/agents/reviewer/save", async ({ page }) => {
    let savedBody: unknown;
    await page.route("**/api/agents/reviewer/save", async (route) => {
      savedBody = await route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });

    await page.goto("/agents/reviewer");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
    expect(savedBody).toMatchObject({ soul: mockAgent.soul, rules: mockAgent.rules });
  });

  test("shows agent git history commits", async ({ page }) => {
    await page.goto("/agents/reviewer");
    await expect(page.getByText("abc1234")).toBeVisible();
    await expect(page.getByText("init: agent definition")).toBeVisible();
  });

  test("404 for unknown agent id", async ({ page }) => {
    await page.route("**/api/agents/unknown", (route) =>
      route.fulfill({ status: 404, body: '{"error":"Not found"}' })
    );
    await page.goto("/agents/unknown");
    await expect(page.getByText("404", { exact: false })).toBeVisible();
  });
});
