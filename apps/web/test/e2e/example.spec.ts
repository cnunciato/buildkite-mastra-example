import { test, expect } from "@playwright/test";

test.describe("Layout", () => {
    test("Page title", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle("Astro Stuff");
    });
});
