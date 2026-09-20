import { test, expect } from "@playwright/test";

/**
 * S5-1 regression — the three legal pages must ship the original app's
 * VERBATIM Wix-template placeholder copy with its exact DOM structure
 * (label → h1 → space-y-14 sections opened by hairlines; accessibility
 * page carries the dash-prefixed adjustment lists and the bracketed
 * "[only add if relevant]" italic spans).
 *
 * The clone previously shipped authored legal content — this spec pins
 * the original's actual text byte-for-byte.
 */

const HAIRLINE_COUNTS: Record<string, number> = {
  // privacy/terms: 3 sections → 3 hairlines; accessibility: 6 sections → 6
  "/privacy": 3,
  "/terms": 3,
  "/accessibility": 6,
};

for (const path of ["/privacy", "/terms", "/accessibility"]) {
  test(`legal page ${path} renders the original's label, h1 and hairline rhythm`, async ({
    page,
  }) => {
    await page.goto(path);

    // The "LEGAL" kicker label with the original's exact classes.
    const label = page.locator("main p.tracking-label").first();
    await expect(label).toHaveText("Legal");
    await expect(label).toHaveClass(/mb-4/);

    // H1 uses the editorial display scale (not text-2xl) and the
    // original's bottom margin.
    const h1 = page.locator("main h1").first();
    await expect(h1).toHaveClass(/text-display-lg/);

    // No authored extras the original does not render: no subtitle line,
    // no "Last updated" footer, no italic <em> note outside accessibility.
    await expect(page.locator("main p em")).toHaveCount(
      path === "/accessibility" ? 1 : 0,
    );
    await expect(page.locator("main")).not.toContainText("Last updated: September");
    await expect(page.locator("main")).not.toContainText(
      "protected with the same discretion",
    );

    // Every content section opens with a hairline divider.
    const hairlines = page.locator("main div.hairline");
    await expect(hairlines).toHaveCount(HAIRLINE_COUNTS[path]!);

    // Section headings use the display-sm scale with mb-4.
    const h2 = page.locator("main h2").first();
    await expect(h2).toHaveClass(/text-display-sm/);
    await expect(h2).toHaveClass(/mb-4/);
  });
}

test("privacy page ships the original's template copy verbatim", async ({
  page,
}) => {
  await page.goto("/privacy");

  await expect(page.locator("h1")).toHaveText("Privacy Policy");
  await expect(page.locator("h1")).toHaveClass(/mb-16/);

  await expect(
    page.getByRole("heading", { level: 2, name: "A legal disclaimer" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", { level: 2, name: "Privacy Policy - the basics" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "What to include in the Privacy Policy",
    }),
  ).toHaveCount(1);

  // Verbatim opening sentence of the disclaimer section.
  await expect(page.locator("main")).toContainText(
    "The explanations and information provided on this page are only general and high-level explanations and information on how to write your own document of a Privacy Policy.",
  );
  await expect(page.locator("main")).toContainText(
    "Different jurisdictions have different legal obligations of what must be included in a Privacy Policy.",
  );
  await expect(page.locator("main")).toContainText(
    "Generally speaking, a Privacy Policy often addresses these types of issues:",
  );
  // The original drops "that" — "make sure you are", not "make sure that
  // you are" (byte-diffed against the live original).
  await expect(page.locator("main")).toContainText(
    "You are responsible to make sure you are following the relevant legislation to your activities and location.",
  );
});

test("terms page ships the original's template copy verbatim", async ({
  page,
}) => {
  await page.goto("/terms");

  await expect(page.locator("h1")).toHaveText("Terms & Conditions");
  await expect(page.locator("h1")).toHaveClass(/mb-16/);

  await expect(
    page.getByRole("heading", { level: 2, name: "A legal disclaimer" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Terms & Conditions - the basics",
    }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "What to include in the T&C document",
    }),
  ).toHaveCount(1);

  await expect(page.locator("main")).toContainText(
    'Having said that, Terms and Conditions ("T&C") are a set of legally binding terms defined by you, as the owner of this website.',
  );
  await expect(page.locator("main")).toContainText(
    "T&C should be defined according to the specific needs and nature of each website.",
  );
  await expect(page.locator("main")).toContainText(
    "Generally speaking, T&C often address these types of issues: Who is allowed to use the website;",
  );
});

test("accessibility page ships the original's statement template verbatim", async ({
  page,
}) => {
  await page.goto("/accessibility");

  await expect(page.locator("h1")).toHaveText("Accessibility Statement");
  // The accessibility card uses mb-12 (vs mb-16 on privacy/terms).
  await expect(page.locator("h1")).toHaveClass(/mb-12/);

  // Intro block: template purpose, the italic *Note line, the article
  // reference — all before the first hairline.
  await expect(page.locator("main")).toContainText(
    "The purpose of the following template is to assist you in writing your accessibility statement.",
  );
  const note = page.locator("main p em").first();
  await expect(note).toHaveText(
    "*Note: This page currently has several sections. Once you complete editing the Accessibility Statement below, you need to delete this section.",
  );
  await expect(page.locator("main")).toContainText(
    'To learn more about this, check out our article "Accessibility: Adding an Accessibility Statement to Your Site".',
  );

  // Placeholder square-bracket copy ships as-is.
  await expect(page.locator("main")).toContainText(
    "This statement was last updated on [enter relevant date].",
  );
  await expect(page.locator("main")).toContainText(
    "We at [enter organization / business name] are working to make our site [enter site name and address] accessible to people with disabilities.",
  );

  // Section headings — the two optional ones carry the italic bracket span
  // preceded by a space (the original renders "content [only add if
  // relevant]", not "content[only add if relevant]").
  await expect(
    page.getByRole("heading", { level: 2, name: "What web accessibility is" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Declaration of partial compliance with the standard due to third-party content [only add if relevant]",
    }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Accessibility arrangements in the organization [only add if relevant]",
    }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Requests, issues and suggestions",
    }),
  ).toHaveCount(1);
  const optionalSpan = page.locator("main h2 span.italic");
  await expect(optionalSpan).toHaveCount(2);
  await expect(optionalSpan.first()).toHaveText("[only add if relevant]");

  // The 8-item adjustments list and 4-item coordinator list render with
  // the original's dash-prefix structure (ul.space-y-2 > li.flex.gap-3
  // with an accent "—" span).
  const lists = page.locator("main ul.space-y-2");
  await expect(lists).toHaveCount(2);
  const adjustments = lists.first();
  await expect(adjustments.locator("li")).toHaveCount(8);
  await expect(adjustments.locator("li").first()).toContainText(
    "Used the Accessibility Wizard to find and fix potential accessibility issues",
  );
  await expect(adjustments.locator("li").last()).toContainText(
    "Ensured all videos, audio, and files on the site are accessible",
  );
  const coordinator = lists.nth(1);
  await expect(coordinator.locator("li")).toHaveCount(4);
  await expect(coordinator.locator("li").last()).toContainText(
    "[Enter any additional contact details if relevant / available]",
  );

  const dash = adjustments.locator("li span").first();
  await expect(dash).toHaveText("—");
  await expect(dash).toHaveClass(/text-accent/);
});

test("legal pages use the original's container geometry (max-w-[760px] column)", async ({
  page,
}) => {
  await page.goto("/privacy");

  // main > div.min-h-screen > section.pt-40 … > div.max-w-[760px]
  const column = page.locator("main div.max-w-\\[760px\\]");
  await expect(column).toHaveCount(1);

  const section = page.locator("main > div > section").first();
  await expect(section).toHaveClass(/pt-40/);
  await expect(section).toHaveClass(/pb-24/);
  await expect(section).toHaveClass(/max-w-\[1400px\]/);
});
