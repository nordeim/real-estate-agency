import { test, expect } from "@playwright/test";

/**
 * F8 parity — an unknown property renders an inline editorial state inside
 * the normal site chrome (NOT the global 404 page): "Property not found"
 * plus a "Back to Collection" ghost button linking to /properties.
 */
test("unknown property renders inline not-found with Back to Collection", async ({
  page,
}) => {
  await page.goto("/property/does-not-exist");

  await expect(
    page.getByText("Property not found", { exact: true })
  ).toBeVisible();
  const back = page.getByRole("link", { name: /back to collection/i });
  await expect(back).toBeVisible();
  await expect(back).toHaveAttribute("href", "/properties");

  // The global 404 page must NOT be what rendered.
  await expect(page.getByRole("heading", { name: "404" })).toHaveCount(0);
});

test("known property renders the detail page with stats and inquiry form", async ({
  page,
}) => {
  // Navigate from the listings to pick a real seeded property id.
  await page.goto("/properties");
  const firstCard = page.locator('a[href^="/property/"]').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();
  await page.waitForURL(/\/property\//);

  await expect(
    page.getByRole("heading", { level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Schedule a Viewing")).toBeVisible();
  await expect(
    page.locator('button[role="combobox"]').filter({ hasText: "Schedule a Tour" })
  ).toBeVisible();
});

test("property detail back link returns to the listings", async ({ page }) => {
  await page.goto("/properties");
  const firstCard = page.locator('a[href^="/property/"]').first();
  await firstCard.click();
  await page.waitForURL(/\/property\//);

  await page.getByRole("link", { name: /back to collection/i }).click();
  await page.waitForURL(/\/properties/);
});
