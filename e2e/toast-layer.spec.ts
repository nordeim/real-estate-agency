import { test, expect } from "@playwright/test";

/**
 * S7-4 regression — the original mounts an EMPTY global toast container
 * on every page EXCEPT /login: two nested
 * `div.fixed.top-0.z-[100].flex.max-h-screen.w-full.flex-col-reverse.p-4.
 * sm:bottom-0.sm:right-0.sm:top-auto.sm:flex-col.md:max-w-[420px]` divs.
 *
 * On mobile (<640px) the container is top-positioned, full-width and
 * 32px tall (just its p-4 padding) at z-[100] — covering the top strip
 * of the viewport and intercepting taps on the top 24px of the hamburger
 * toggle (the original's menu only opens from the lower part of the
 * button; a Playwright center-click is refused). On desktop (sm+) it
 * repositions to the bottom-right corner (420×32) where it blocks
 * nothing. The clone lacked the layer entirely, making its toggle
 * fully tappable — a functional divergence from the original's UX.
 *
 * This layer is a deliberate fidelity artifact: it reproduces the
 * original's DOM (and its mobile tap-blocking) exactly.
 */

const CONTAINER_CLASSES =
  "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]";

const LAYERED_PAGES = [
  "/",
  "/properties",
  "/sell",
  "/about",
  "/privacy",
  "/terms",
  "/accessibility",
  "/does-not-exist-404",
];

test("every non-login page mounts the original's empty global toast container", async ({
  page,
}) => {
  for (const path of LAYERED_PAGES) {
    await page.goto(path);
    const layer = await page.evaluate((classes) => {
      const divs = [...document.querySelectorAll("div")].filter(
        (d) => d.className.toString() === classes
      );
      return {
        count: divs.length,
        outerEmpty: divs.every((d) => d.children.length === 0 || d.children.length === 1),
        nested:
          divs.length === 2 &&
          divs[0].children.length === 1 &&
          divs[0].children[0] === divs[1] &&
          divs[1].children.length === 0,
      };
    }, CONTAINER_CLASSES);

    expect(layer.count, `layer on ${path}`).toBe(2);
    expect(layer.nested, `nested structure on ${path}`).toBe(true);
  }
});

test("the global toast container is absent on /login (the original mounts only its sonner section there)", async ({
  page,
}) => {
  await page.goto("/login");
  const count = await page.evaluate(
    (classes) =>
      [...document.querySelectorAll("div")].filter(
        (d) => d.className.toString() === classes
      ).length,
    CONTAINER_CLASSES
  );
  expect(count).toBe(0);
});

test("on mobile the container covers the top 32px strip and blocks the toggle's center", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.waitForTimeout(1200);

  const probe = await page.evaluate((classes) => {
    const layer = [...document.querySelectorAll("div")].find(
      (d) => d.className.toString() === classes
    );
    const btn = [...document.querySelectorAll("button")].find((b) =>
      b.getAttribute("aria-label")?.includes("Toggle")
    );
    const layerRect = layer!.getBoundingClientRect();
    const btnRect = btn!.getBoundingClientRect();
    const hit = (x, y) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.closest(`div[class*="z-[100]"]`) !== null : false;
    };
    return {
      layerTop: layerRect.top,
      layerHeight: layerRect.height,
      layerWidth: layerRect.width,
      toggleTop: btnRect.top,
      toggleBottom: btnRect.bottom,
      centerBlocked: hit(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2),
      lowerPartTappable: !hit(
        btnRect.left + btnRect.width / 2,
        btnRect.bottom - 4
      ),
    };
  }, CONTAINER_CLASSES);

  expect(probe.layerTop).toBe(0);
  expect(probe.layerHeight).toBe(32);
  expect(probe.layerWidth).toBe(375);
  // The toggle (y 8..48) is 60% covered — exactly the original's geometry.
  expect(probe.toggleTop).toBe(8);
  expect(probe.toggleBottom).toBe(48);
  expect(probe.centerBlocked).toBe(true);
  expect(probe.lowerPartTappable).toBe(true);
});

test("on desktop the container repositions to the bottom-right and blocks nothing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.waitForTimeout(1200);

  const probe = await page.evaluate((classes) => {
    const layer = [...document.querySelectorAll("div")].find(
      (d) => d.className.toString() === classes
    );
    const r = layer!.getBoundingClientRect();
    const blockedInteractive = [...document.querySelectorAll("a, button, input, textarea")]
      .filter((e) => e.getBoundingClientRect().height > 0)
      .filter((e) => {
        const b = e.getBoundingClientRect();
        return (
          b.bottom > r.top && b.top < r.bottom && b.right > r.left && b.left < r.right
        );
      }).length;
    return {
      top: Math.round(r.top),
      left: Math.round(r.left),
      width: Math.round(r.width),
      height: Math.round(r.height),
      blockedInteractive,
    };
  }, CONTAINER_CLASSES);

  expect(probe.top).toBe(768); // bottom-0 at 800px viewport
  expect(probe.left).toBe(860); // right-0, 420px wide
  expect(probe.width).toBe(420);
  expect(probe.height).toBe(32);
  expect(probe.blockedInteractive).toBe(0);
});

test("the mobile menu still opens from the lower part of the toggle (original behavior)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.waitForTimeout(1200);

  const btn = page.getByRole("button", { name: "Toggle menu" });
  const box = await btn.boundingBox();
  expect(box).not.toBeNull();
  // Tap the lower part (below the 32px cover strip) like the original
  // requires — the menu overlay must open.
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height - 6);
  await expect(
    page.locator("div.fixed.inset-0 nav a", { hasText: "Properties" })
  ).toBeVisible();
});
