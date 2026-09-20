import { test, expect } from "@playwright/test";

/**
 * F10 parity — the original app's document titles.
 * Default "Real Estate Agency", template "%s | Real Estate Agency".
 */
const cases: Array<{ path: string; title: string }> = [
  { path: "/", title: "Real Estate Agency" },
  { path: "/properties", title: "Property Search | Real Estate Agency" },
  { path: "/sell", title: "Sell | Real Estate Agency" },
  { path: "/about", title: "About | Real Estate Agency" },
  { path: "/privacy", title: "Privacy | Real Estate Agency" },
  { path: "/terms", title: "Terms | Real Estate Agency" },
  { path: "/accessibility", title: "Accessibility | Real Estate Agency" },
  { path: "/login", title: "Real Estate Agency" },
];

for (const { path, title } of cases) {
  test(`title of ${path} is "${title}"`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
  });
}

test("unknown property keeps the generic Property Detail title", async ({
  page,
}) => {
  await page.goto("/property/does-not-exist");
  await expect(page).toHaveTitle("Property Detail | Real Estate Agency");
});

test("the 404 page quotes the missing route like the original", async ({
  page,
}) => {
  await page.goto("/definitely-not-a-route");
  await expect(
    page.getByText('The page "/definitely-not-a-route" could not be found')
  ).toBeVisible();
});
