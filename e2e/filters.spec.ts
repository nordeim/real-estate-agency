import { test, expect } from "@playwright/test";

/**
 * Filter bar parity guards — the ORIGINAL uses Radix Select comboboxes with
 * per-filter widths: location w-[180px], type w-[160px], price w-[160px],
 * beds w-[120px] (live DOM extraction, session 3 audit). The sentinel
 * labels ("All Locations", "All Types", "Any Price", "Any Beds") were
 * verified in the session-2 audit.
 */

const EXPECTED_WIDTHS: Array<[string, string]> = [
  ["All Locations", "w-[180px]"],
  ["All Types", "w-[160px]"],
  ["Any Price", "w-[160px]"],
  ["Any Beds", "w-[120px]"],
];

test("filter comboboxes use the original's per-filter widths", async ({
  page,
}) => {
  await page.goto("/properties");

  const combos = page.locator('button[role="combobox"]');
  await expect(combos).toHaveCount(4);

  for (let i = 0; i < EXPECTED_WIDTHS.length; i++) {
    const [label, widthClass] = EXPECTED_WIDTHS[i];
    const trigger = combos.nth(i);
    await expect(trigger).toContainText(label);
    await expect(trigger).toHaveClass(new RegExp(widthClass.replace(/\[/g, "\\[")));
  }
});

test("a zero-match search renders the original's empty state", async ({
  page,
}) => {
  await page.goto("/properties?search=zzz-no-such-listing");

  await expect(
    page.getByText("0 properties found")
  ).toBeVisible();
  await expect(
    page.getByText("No properties match your criteria")
  ).toBeVisible();
  await expect(page.getByText("Try adjusting your filters")).toBeVisible();

  // The empty block is the original's serif statement, centered.
  const statement = page.getByText("No properties match your criteria");
  await expect(statement).toHaveClass(/text-display-sm/);
  await expect(statement).toHaveClass(/font-display/);
  await expect(statement).toHaveClass(/text-muted-foreground/);
});

test("active filters surface the Clear Filters control, which resets the search", async ({
  page,
}) => {
  await page.goto("/properties");

  // No filters active → no clear button, count row still present.
  await expect(page.getByText(/properties found/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /clear filters/i })
  ).toHaveCount(0);

  // One filter active → the clear control appears with the original's
  // uppercase tracking treatment.
  await page.goto("/properties?type=Penthouse");
  const clear = page.getByRole("button", { name: /clear filters/i });
  await expect(clear).toBeVisible();
  await expect(clear).toHaveClass(/tracking-label/);
  await expect(clear).toHaveClass(/uppercase/);
  await expect(clear.locator("svg")).toHaveClass(/lucide-x/);

  await clear.click();
  await page.waitForURL(/\/properties$/);
  await expect(
    page.locator('button[role="combobox"]').filter({ hasText: "All Types" })
  ).toContainText("All Types");
  await expect(
    page.getByRole("button", { name: /clear filters/i })
  ).toHaveCount(0);
});
