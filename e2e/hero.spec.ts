import { test, expect } from "@playwright/test";

/**
 * F2 parity — the sentence-style hero search uses the original's custom
 * popover dropdowns (serif italic labels with underlines), not native
 * selects, with "Any X" sentinels and glass menus.
 */
test("hero search renders popover dropdowns with Any X sentinels", async ({
  page,
}) => {
  await page.goto("/");

  // No native selects inside the hero pill.
  const heroSection = page.locator("section").first();
  await expect(heroSection.locator("select")).toHaveCount(0);

  for (const label of ["Any Type", "Any Location", "Any Price"]) {
    const trigger = page.getByRole("button", { name: new RegExp(label, "i") });
    await expect(trigger).toBeVisible();
  }
  await expect(
    page.getByRole("button", { name: /search properties/i })
  ).toBeVisible();
});

test("hero type dropdown opens, lists options, and selects", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: /any type/i }).click();
  const menu = page.locator("div.absolute.top-full");
  await expect(menu).toBeVisible();
  await expect(menu.getByText("Penthouse")).toBeVisible();
  await expect(menu.getByText("Condo")).toBeVisible();

  await menu.getByText("Penthouse").click();
  await expect(
    page.getByRole("button", { name: /penthouse/i }).first()
  ).toBeVisible();
});

test("hero search navigates to /properties with selected filters", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: /any type/i }).click();
  await page.locator("div.absolute.top-full").getByText("Waterfront").click();

  await page.getByRole("button", { name: /any location/i }).click();
  await page.locator("div.absolute.top-full").getByText("Sea Cliff").click();

  await page.getByRole("button", { name: /search properties/i }).click();
  await page.waitForURL(/\/properties\?/);
  expect(page.url()).toContain("type=Waterfront");
  // URLSearchParams encodes spaces as "+" (form encoding) — both + and %20
  // decode to the same value server-side.
  expect(page.url()).toMatch(/location=(Sea\+Cliff|Sea%20Cliff)/);
});

test("hero search with defaults only navigates to bare /properties", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /search properties/i }).click();
  await page.waitForURL(/\/properties/);
  expect(page.url()).not.toContain("?");
});
