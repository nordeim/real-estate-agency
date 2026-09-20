import { expect, test } from "@playwright/test";

/**
 * Metadata parity guards — expectations extracted from the ORIGINAL app's
 * served HTML (session 3 audit). The original emits a full social/SEO meta
 * layer: description, og:*, twitter:*, the SVG favicon, and per-page OG on
 * every public page.
 */

const OG_IMAGE = "/media/brand/og-image.svg";

test("home page emits the original's meta layer", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Real Estate Agency");

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "A prestigious real estate platform providing an editorial-style viewing experience for luxury properties and neighborhood insights."
  );

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Real Estate Agency"
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    new RegExp(`${OG_IMAGE.replace(/\//g, "\\/")}$`)
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "Real Estate Agency"
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website"
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image"
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    "Real Estate Agency"
  );

  // The favicon is wired through metadata.icons (SVG, like the original).
  const iconLink = page.locator('link[rel="icon"]');
  await expect(iconLink).toHaveCount(1);
  await expect(iconLink).toHaveAttribute("href", new RegExp("favicon\\.svg$"));
});

test("sub-pages emit per-page og/twitter metadata like the original", async ({ page }) => {
  await page.goto("/properties");

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Property Search | Real Estate Agency"
  );
  await expect(
    page.locator('meta[property="og:description"]')
  ).toHaveAttribute(
    "content",
    "Property Search on Real Estate Agency. A prestigious real estate platform providing an editorial-style viewing experience for luxury properties and neighborhood insights."
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    /\/properties$/
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    "Property Search | Real Estate Agency"
  );

  await page.goto("/about");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "About | Real Estate Agency"
  );

  await page.goto("/sell");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Sell | Real Estate Agency"
  );

  await page.goto("/privacy");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Privacy | Real Estate Agency"
  );
});

test("the og:image asset is served", async ({ request }) => {
  const response = await request.get(OG_IMAGE);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("svg");
});

test("the favicon asset is served", async ({ request }) => {
  const response = await request.get("/media/brand/favicon.svg");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("svg");
});
