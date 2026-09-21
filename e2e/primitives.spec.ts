import { test, expect } from "@playwright/test";

/**
 * S7-1 / S7-2 / S7-3 / S7-5 / S7-6 / S7-7 regression — measured against
 * the live original (https://real-estate-agency.base44.app) during the
 * session-6 audit:
 *
 * - S7-1: the original's hero H1 computes line-height 0.9 (the
 *   `leading-[0.9]` utility beats its `.text-display-xl` custom class),
 *   so the H1 is 184px at 1280×800 and everything below it sits 31px
 *   higher than a 1.05 line-height would place it. The clone's unlayered
 *   `.text-display-xl { line-height: 1.05 }` beat the utilities-layer
 *   `leading-[0.9]`, inflating the H1 to 215px and drifting the whole
 *   hero (sentence + dropdowns + search button) down with it.
 * - S7-2: the original's shadcn primitives are the old v1-style bases
 *   (focus-visible:ring-1, shadow-sm, py-1 input, py-2 trigger, h-12
 *   triggers, max-h-96 select content without scroll buttons, v1 item
 *   indicator). The clone shipped the 2025 v4 defaults whose
 *   `data-[size=default]:h-9` even overrode the usages' h-12 (36px vs
 *   the original's 48px — visible in the mobile filter row pitch).
 * - S7-3: the original's sell H1 is plain "Ready to sell?" (no italic
 *   span on "sell?" — unlike the H2s, which do carry italic spans).
 * - S7-5: the original's inquiry forms rely on NATIVE browser
 *   validation (no `novalidate` attribute; no custom field-error DOM).
 * - S7-6: the original exposes NO aria-labels on the logo, navs, toggle,
 *   search input, filter selects, or form fields, and the newsletter
 *   form has no sr-only label — its inputs are named by placeholder.
 * - S7-7: the newsletter subscribe button is exactly
 *   `ml-4 text-background/60 hover:text-background transition-colors`.
 */

const TARGET_INPUT_BASE =
  "flex w-full rounded-md border px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

/** Byte-exact rendered strings measured on the live original (the about
 *  page's contact form — rounded-md merged away by the rounded-[6px]
 *  tail, exactly as tailwind-merge resolves it). */
const TARGET_ABOUT_INPUT =
  "flex w-full border px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px]";

const TARGET_ABOUT_TRIGGER =
  "flex w-full items-center justify-between whitespace-nowrap border px-3 py-2 shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px]";

const TARGET_ABOUT_TEXTAREA =
  "flex min-h-[60px] w-full border px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-transparent border-border/50 font-body text-sm resize-none rounded-[6px]";

const TARGET_TRIGGER_BASE =
  "flex w-full items-center justify-between whitespace-nowrap rounded-md border px-3 py-2 shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1";

const TARGET_TEXTAREA_BASE =
  "flex min-h-[60px] w-full rounded-md border px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

test("hero H1 line-height is 0.9 like the original (leading utility wins)", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForTimeout(1600); // reveal entrance must settle

  const metrics = await page.evaluate(() => {
    const h1 = document.querySelector("h1")!;
    const cs = getComputedStyle(h1);
    return {
      fontSize: parseFloat(cs.fontSize),
      lineHeight: parseFloat(cs.lineHeight),
      height: h1.getBoundingClientRect().height,
    };
  });

  expect(metrics.lineHeight / metrics.fontSize).toBeCloseTo(0.9, 2);
  // Two lines (Welcome to Your<br>Next Home) at 0.9 line-height.
  expect(Math.abs(metrics.height - 2 * metrics.fontSize * 0.9)).toBeLessThan(
    3
  );
});

test("hero search sentence sits mb-8 (32px) below the H1 like the original", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.waitForTimeout(1600);

  const gap = await page.evaluate(() => {
    const h1 = document.querySelector("h1")!;
    const sentence = [...document.querySelectorAll("p, div")].find((e) =>
      e.textContent.trim().startsWith("I am looking for")
    )!;
    return (
      sentence.getBoundingClientRect().top - h1.getBoundingClientRect().bottom
    );
  });

  expect(gap).toBe(32); // mb-8 — not stretched by an inflated H1
});

test("filter select triggers are 48px tall like the original (h-12 applies)", async ({
  page,
}) => {
  await page.goto("/properties");
  // The filter bar streams inside a Suspense boundary (useSearchParams
  // deopts to client rendering) — wait for it instead of racing the
  // hydration window between 'load' and mount.
  await page.waitForSelector('button[role="combobox"]');
  const heights = await page.evaluate(() =>
    [...document.querySelectorAll('button[role="combobox"]')].map((b) =>
      Math.round(b.getBoundingClientRect().height)
    )
  );
  expect(heights.length).toBe(4);
  for (const h of heights) expect(h).toBe(48);
});

test("mobile filter rows wrap at the original's pitch (64px, not 52px)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/properties");
  await page.waitForSelector('button[role="combobox"]');
  await page.waitForTimeout(800);

  const rows = await page.evaluate(() => {
    const ys = [...document.querySelectorAll('button[role="combobox"]')].map(
      (b) => Math.round(b.getBoundingClientRect().top)
    );
    return [...new Set(ys)];
  });

  expect(rows.length).toBe(2); // two wrapped rows
  expect(rows[1] - rows[0]).toBe(64); // 48px row + gap-4
});

test("inquiry form inputs/textarea carry the original's v1-style base classes", async ({
  page,
}) => {
  await page.goto("/about");

  const classes = await page.evaluate(() => {
    const input = document.querySelector('form input[placeholder="Full Name"]')!;
    const textarea = document.querySelector("form textarea")!;
    const trigger = document.querySelector("form button[role=combobox]")!;
    return {
      input: input.className,
      textarea: textarea.className,
      trigger: trigger.className,
    };
  });

  // Byte-exact against the live original (rounded-md merges away under
  // the rounded-[6px] tail; the trigger's w-full survives from the base).
  expect(classes.input).toBe(TARGET_ABOUT_INPUT);
  expect(classes.trigger).toBe(TARGET_ABOUT_TRIGGER);
  expect(classes.textarea).toBe(TARGET_ABOUT_TEXTAREA);
});

test("properties search input carries the original's base + rounded-md tail", async ({
  page,
}) => {
  await page.goto("/properties");
  // Streams with the filter-bar Suspense boundary — wait, don't race it.
  await page.waitForSelector("main input");

  const cls = await page.evaluate(
    () => document.querySelector("main input")!.className
  );

  expect(cls.startsWith(TARGET_INPUT_BASE)).toBe(true);
  expect(cls.endsWith("pl-10 bg-transparent border-border font-body text-sm h-12")).toBe(
    true
  );
});

test("select dropdown uses the original's v1 content (max-h-96, no scroll buttons)", async ({
  page,
}) => {
  await page.goto("/properties");
  // No aria-label on the original's comboboxes, and Playwright's accname
  // for role=combobox does not fall back to subtree text — locate by
  // role + text filter instead.
  await page
    .locator('button[role="combobox"]')
    .filter({ hasText: "All Locations" })
    .click();
  await page.waitForTimeout(400);

  const content = await page.evaluate(() => {
    const listbox = document.querySelector('[role="listbox"]')!;
    const item = listbox.querySelector('[role="option"]')!;
    const scrollButtons = document.querySelectorAll(
      "[data-radix-select-scroll-up-button], [data-radix-select-scroll-down-button]"
    ).length;
    return {
      contentCls: listbox.className,
      itemCls: item.className,
      scrollButtons,
      indicator: item.querySelector(
        "span.absolute.right-2 > span[aria-hidden='true'] svg"
      )
        ? true
        : false,
    };
  });

  expect(content.contentCls).toContain("max-h-96");
  expect(content.contentCls).toContain("overflow-hidden");
  expect(content.contentCls).toContain("rounded-[6px]");
  expect(content.scrollButtons).toBe(0);
  expect(content.itemCls).toContain("py-1.5 pl-2 pr-8");
  expect(content.itemCls).toContain("focus:bg-accent");
  expect(content.indicator).toBe(true);
});

test("primitives carry no data-slot attributes (the original's DOM has none)", async ({
  page,
}) => {
  await page.goto("/about");
  const slots = await page.evaluate(
    () => document.querySelectorAll("form [data-slot]").length
  );
  expect(slots).toBe(0);
});

test("sell H1 is plain text like the original (no italic span on 'sell?')", async ({
  page,
}) => {
  await page.goto("/sell");
  const h1 = page.locator("h1");
  await expect(h1).toHaveText("Ready to sell?");
  const spans = await page.locator("h1 span").count();
  expect(spans).toBe(0);
});

test("inquiry form uses native validation like the original (no novalidate)", async ({
  page,
}) => {
  await page.goto("/sell");
  const noValidate = await page.evaluate(
    () => document.querySelector("form")!.noValidate
  );
  expect(noValidate).toBe(false);
});

test("the original exposes no aria-labels on chrome, filters, or form fields", async ({
  page,
}) => {
  await page.goto("/properties");
  await page.waitForSelector("main input");

  const chrome = await page.evaluate(() => ({
    logo: document.querySelector("header a")!.getAttribute("aria-label"),
    nav: document.querySelector("header nav")!.getAttribute("aria-label"),
    // The toggle keeps its aria-label ("Toggle menu") — the original has
    // one too — but no aria-expanded.
    toggleExpanded: [...document.querySelectorAll("header button")]
      .find((b) => b.getAttribute("aria-label")?.includes("Toggle"))
      ?.getAttribute("aria-expanded"),
    searchInput: document.querySelector("main input")!.getAttribute("aria-label"),
    comboboxes: [...document.querySelectorAll('button[role="combobox"]')].map(
      (b) => b.getAttribute("aria-label")
    ),
  }));

  expect(chrome.logo).toBeNull();
  expect(chrome.nav).toBeNull();
  expect(chrome.searchInput).toBeNull();
  expect(chrome.toggleExpanded).toBeNull();

  // The hero's sentence dropdowns expose NO aria attributes on the
  // original — triggers carry only their class, the popover is a plain
  // div, options are plain buttons (no role=option/aria-selected).
  await page.goto("/");
  await page.waitForTimeout(1200); // hero entrance settles
  const heroAria = await page.evaluate(() => {
    const trigger = [...document.querySelectorAll("button")].find((b) =>
      b.textContent.trim() === "Any Type"
    )!;
    const attrs = [...trigger.attributes].filter(
      (a) => a.name !== "class"
    );
    return {
      triggerAria: attrs.map((a) => a.name),
      triggerAriaLabel: trigger.getAttribute("aria-label"),
    };
  });
  expect(heroAria.triggerAria).toEqual([]);
  expect(heroAria.triggerAriaLabel).toBeNull();

  await page.goto("/sell");
  const formAria = await page.evaluate(() => ({
    inputs: [...document.querySelectorAll("form input, form textarea")].map(
      (i) => i.getAttribute("aria-label")
    ),
    trigger: document
      .querySelector("form button[role=combobox]")!
      .getAttribute("aria-label"),
  }));
  expect(formAria.inputs.every((a) => a === null)).toBe(true);
  expect(formAria.trigger).toBeNull();

  // Mobile menu overlay nav — the original's nav carries no aria-label.
  // The JS click is retried because a click during React's hydration
  // window (SSR markup present, handlers not yet attached) is a no-op.
  const mobileNavLabel = await page.evaluate(async () => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      b.getAttribute("aria-label")?.includes("Toggle")
    )!;
    for (let attempt = 0; attempt < 20; attempt++) {
      btn.click();
      await new Promise((resolve) => setTimeout(resolve, 250));
      const overlay = [...document.querySelectorAll("div")].find((d) =>
        d.className.toString().includes("fixed inset-0")
      );
      if (overlay) {
        const label = overlay
          .querySelector("nav")
          ?.getAttribute("aria-label");
        btn.click(); // close it again
        return label ?? null;
      }
    }
    return "overlay-never-mounted";
  });
  expect(mobileNavLabel).toBeNull();
});

test("newsletter form matches the original: no sr-only label, exact button class", async ({
  page,
}) => {
  await page.goto("/");

  const form = await page.evaluate(() => {
    const f = document.querySelector("footer form")!;
    return {
      srOnlyLabels: f.querySelectorAll("label.sr-only").length,
      buttonCls: f.querySelector("button")!.className,
      inputAria: f.querySelector("input")!.getAttribute("aria-label"),
      buttonAria: f.querySelector("button")!.getAttribute("aria-label"),
    };
  });

  expect(form.srOnlyLabels).toBe(0);
  expect(form.buttonCls).toBe(
    "ml-4 text-background/60 hover:text-background transition-colors"
  );
  expect(form.inputAria).toBeNull();
  expect(form.buttonAria).toBeNull();
});
