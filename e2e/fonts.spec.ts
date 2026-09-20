import { test, expect } from "@playwright/test";

/**
 * F1 regression — the Instrument Serif display font must actually render.
 * Root cause being guarded against: next/font variables attached to <body>
 * while :root tokens reference them (guaranteed-invalid cascade → whole
 * site silently falls back to the system sans-serif stack).
 */
test("home hero h1 renders in Instrument Serif, not the sans fallback", async ({
  page,
}) => {
  await page.goto("/");
  const h1 = page.locator("h1").first();
  await expect(h1).toBeVisible();

  const fontFamily = await h1.evaluate(
    (el) => getComputedStyle(el).fontFamily
  );
  // next/font exposes the family as "Instrument Serif" (with a fallback
  // companion). The broken state computed to "ui-sans-serif, system-ui, …".
  expect(fontFamily.toLowerCase()).toContain("instrument serif");
});

test("body renders in Inter, not the sans fallback", async ({ page }) => {
  await page.goto("/");
  const bodyFont = await page.evaluate(
    () => getComputedStyle(document.body).fontFamily
  );
  expect(bodyFont.toLowerCase()).toContain("inter");
});
