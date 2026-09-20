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
