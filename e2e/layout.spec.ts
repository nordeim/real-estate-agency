import { test, expect } from "@playwright/test";

/**
 * S5-2 / S5-3 / S5-4 / S5-5 regression — the original wraps every
 * content page in `div.min-h-screen.flex.flex-col` (fixed header,
 * `main.flex-1`, footer) and starts each page's content at the
 * original's measured offsets. The clone previously added a universal
 * `main.pt-24` (+96px on properties/sell, +28px on legal) and missed
 * the about page's `div.pt-32.pb-24` wrapper (−32px).
 *
 * H1 viewport-top values below were measured on the live original at
 * 1280px width (Playwright's Desktop Chrome default) with scrollY=0.
 */

const CONTENT_PAGES = [
  "/",
  "/properties",
  "/sell",
  "/about",
  "/privacy",
  "/terms",
  "/accessibility",
];

test("content pages use the original's flex-column chrome (sticky footer)", async ({
  page,
}) => {
  for (const path of CONTENT_PAGES) {
    await page.goto(path);
    // The chrome wrapper is the page root (the original nests it inside
    // one extra classless app-shell div — visually identical).
    const chrome = page.locator("body > div.min-h-screen.flex.flex-col");
    await expect(chrome, `chrome wrapper on ${path}`).toHaveCount(1);

    const main = chrome.locator("> main");
    await expect(main, `main inside chrome on ${path}`).toHaveCount(1);
    await expect(main, `main flex-1 on ${path}`).toHaveClass(/flex-1/);
    // The clone's universal pt-24 compensation is gone.
    await expect(main, `no pt-24 on ${path}`).not.toHaveClass(/pt-24/);

    await expect(chrome.locator("> header")).toHaveCount(1);
    await expect(chrome.locator("> footer")).toHaveCount(1);
  }
});

test("properties page h1 sits at the original's measured offset", async ({
  page,
}) => {
  await page.goto("/properties");
  await expect(page.locator("h1")).toHaveText("Our Listings");
  // Let the Reveal entrance (0.6s) settle before measuring geometry.
  await page.waitForTimeout(900);

  const top = await page.locator("h1").evaluate(
    (el) => Math.round(el.getBoundingClientRect().top),
  );
  // Original: 140 (pt-32 = 128 + h1 mt-3 = 12).
  expect(Math.abs(top - 140)).toBeLessThanOrEqual(8);

  // The original's single container: pt-32 pb-24 px-[2%] max-w-[1400px].
  const container = page.locator("main > div.pt-32");
  await expect(container).toHaveCount(1);
  await expect(container).toHaveClass(/pb-24/);
  await expect(container).toHaveClass(/max-w-\[1400px\]/);
});

test("sell page h1 sits at the original's measured offset", async ({
  page,
}) => {
  await page.goto("/sell");
  await page.waitForTimeout(900);
  const top = await page.locator("h1").evaluate(
    (el) => Math.round(el.getBoundingClientRect().top),
  );
  // Original: 172 (pt-40 = 160 + h1 mt-3 = 12).
  expect(Math.abs(top - 172)).toBeLessThanOrEqual(8);

  // The original nests the sections inside div.min-h-screen.
  const wrapper = page.locator("main > div.min-h-screen");
  await expect(wrapper).toHaveCount(1);
});

test("legal pages start at the original's measured offset", async ({
  page,
}) => {
  await page.goto("/privacy");
  await page.waitForTimeout(900);
  const top = await page.locator("main p.tracking-label").evaluate(
    (el) => Math.round(el.getBoundingClientRect().top),
  );
  // Original: 160 (section pt-40, label is the first element).
  expect(Math.abs(top - 160)).toBeLessThanOrEqual(8);
});

test("hairline dividers render the original's visible beige line", async ({
  page,
}) => {
  // The original's hairlines paint rgb(228, 224, 221) (measured live on
  // /privacy and /about). The clone's `.hairline` originally wrapped the
  // full-color --border token in another hsl() — invalid at computed-value
  // time, silently falling back to a transparent background (invisible
  // dividers on about, the legal pages and property detail).
  for (const path of ["/privacy", "/about"]) {
    await page.goto(path);
    const first = page.locator("main div.hairline").first();
    await expect(first, `hairline present on ${path}`).toHaveCount(1);
    const bg = await first.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bg, `hairline color on ${path}`).toBe("rgb(228, 224, 221)");
    const height = await first.evaluate(
      (el) => getComputedStyle(el).height,
    );
    expect(height, `hairline height on ${path}`).toBe("0.5px");
  }
});

test("about page wraps its sections in the original's pt-32 pb-24 div", async ({
  page,
}) => {
  await page.goto("/about");

  const wrapper = page.locator("main > div.pt-32.pb-24");
  await expect(wrapper).toHaveCount(1);
  // All about sections live inside the wrapper (original: 8 children —
  // hero, hairline, advisors, hairline, credentials, community, band,
  // contact).
  await expect(wrapper.locator("> *")).toHaveCount(8);

  // S5-4: hairline dividers between hero→advisors and advisors→credentials.
  const hairlines = wrapper.locator("> div.hairline");
  await expect(hairlines).toHaveCount(2);
  await expect(hairlines.first()).toHaveClass(/max-w-\[1400px\]/);

  // S5-4: the parallax image band between community and contact.
  const band = wrapper.locator(
    "> div.overflow-hidden.relative.h-\\[500px\\]",
  );
  await expect(band).toHaveCount(1);
  await expect(band).toHaveClass(/md:h-\[650px\]/);
  const img = band.locator("img");
  await expect(img).toHaveAttribute("alt", "Luxury property");
  // The parallax inner: absolute inset-0 h-[140%] top-[-20%].
  await expect(band.locator("> div.h-\\[140\\%\\]")).toHaveCount(1);
});

test("sell page carries the original's #contact anchor div", async ({
  page,
}) => {
  await page.goto("/sell");

  // Empty anchor div with the original's inline scroll-margin-top.
  const anchor = page.locator("div#contact");
  await expect(anchor).toHaveCount(1);
  await expect(await anchor.textContent()).toBe("");
  const marginTop = await anchor.evaluate(
    (el) => getComputedStyle(el).scrollMarginTop,
  );
  expect(marginTop).toBe("80px");

  // The anchor precedes the contact section (which no longer carries
  // the id itself).
  const section = page.locator("main section", { hasText: "Begin Your" });
  await expect(section).toHaveCount(1);
  await expect(section).not.toHaveAttribute("id", "contact");
});

test("home page hero geometry is unchanged by the chrome rework", async ({
  page,
}) => {
  await page.goto("/");
  // The hero's fade-up runs 1s with a 0.3s delay.
  await page.waitForTimeout(1600);
  const top = await page.locator("h1").evaluate(
    (el) => Math.round(el.getBoundingClientRect().top),
  );
  // The hero content sits at md:pt-[35vh], so the H1 position is
  // viewport-height-relative by design (the original measured 202 at a
  // 576px-tall viewport; at Playwright's 720px default 35vh = 252).
  const vh = page.viewportSize()?.height ?? 720;
  expect(Math.abs(top - Math.round(vh * 0.35))).toBeLessThanOrEqual(16);
  await expect(page.locator("main section.h-screen")).toHaveCount(1);
});
