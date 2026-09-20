import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

/**
 * Core user flows, browser-verified end to end. The inquiry assertions
 * read the real SQLite database — the same file the dev/prod server uses.
 */
const db = new PrismaClient();

test("home page renders the full editorial composition", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /welcome to your/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /featured properties/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /neighborhood expertise/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /buyer & seller/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /featured advisors/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /market insights,/i })
  ).toBeVisible();

  // Video hero present.
  await expect(page.locator("video source[src*='hero-video']")).toHaveCount(1);
});

test("neighborhood cards link to filtered listings with live counts", async ({
  page,
}) => {
  await page.goto("/");
  // Scope to the Neighborhood Expertise section and match the card whose
  // h3 is exactly the neighborhood name (property-card kickers also contain
  // the neighborhood name but in a <p>, not an <h3>).
  const section = page
    .getByRole("heading", { name: /neighborhood expertise/i })
    .locator("xpath=ancestor::section[1]");
  const card = section
    .locator("a")
    .filter({
      has: page.getByRole("heading", {
        name: "Pacific Heights",
        exact: true,
      }),
    })
    .first();
  await expect(card).toBeVisible();
  await card.click();
  await page.waitForURL(
    /\/properties\?location=(Pacific\+Heights|Pacific%20Heights)/
  );
  await expect(
    page.getByRole("combobox", { name: "Location filter" })
  ).toContainText("Pacific Heights");
});

test("properties filters narrow the grid and update the count", async ({
  page,
}) => {
  await page.goto("/properties");
  const initialCount = await page
    .locator("p")
    .filter({ hasText: /properties found/ })
    .textContent();

  await page.getByLabel("Type filter").click();
  await page.getByRole("option", { name: "Penthouse" }).click();
  await page.waitForURL(/type=Penthouse/);
  const filteredCount = await page
    .locator("p")
    .filter({ hasText: /properties found/ })
    .textContent();
  expect(filteredCount).not.toBe(initialCount);

  // URL-driven: back/forward works.
  await page.goBack();
  await page.waitForURL(/\/properties$/);
});

test("property inquiry form persists to the database", async ({ page }) => {
  await page.goto("/properties");
  await page.locator('a[href^="/property/"]').first().click();
  await page.waitForURL(/\/property\//);

  const email = `e2e-inquiry-${Date.now()}@example.com`;
  await page.getByLabel("Full name").fill("E2E Inquiry Test");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Message").fill("Sent from the Playwright e2e suite.");

  await page.getByRole("button", { name: /send inquiry/i }).click();

  // The original never shows a toast here — its sonner Toaster is
  // mounted ONLY on /login, so the inquiry form's toast() call is a
  // silent no-op and the form simply resets.
  await expect(
    page.getByLabel("Full name")
  ).toHaveValue("", { timeout: 10_000 });
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("");
  await expect(page.getByText(/inquiry sent/i)).toHaveCount(0);
  await expect(
    page.locator("section[aria-label^='Notifications'], [data-sonner-toaster]")
  ).toHaveCount(0);

  const inquiry = await db.inquiry.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  expect(inquiry).not.toBeNull();
  expect(inquiry?.fullName).toBe("E2E Inquiry Test");
  expect(inquiry?.inquiryType).toBe("Tour Request");
  expect(inquiry?.status).toBe("New");
  expect(inquiry?.propertyId).not.toBeNull();
});

test("footer newsletter persists as a sentinel inquiry", async ({ page }) => {
  await page.goto("/");
  const email = `e2e-news-${Date.now()}@example.com`;
  await page
    .getByRole("textbox", { name: "Your email address" })
    .last()
    .fill(email);
  await page.getByRole("button", { name: "Subscribe" }).last().click();
  // The original's success line: plain uppercase tracking-label text,
  // no icon, no trailing period.
  const success = page.getByText(/thank you for subscribing/i);
  await expect(success).toBeVisible({ timeout: 10_000 });
  await expect(success).toHaveText("Thank you for subscribing");
  await expect(success).toHaveClass(/tracking-label/);
  await expect(success).toHaveClass(/uppercase/);

  const subscription = await db.inquiry.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
  expect(subscription?.fullName).toBe("Newsletter Subscriber");
  expect(subscription?.message).toBe("Newsletter subscription");
});

test("login with the demo credentials redirects home", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: /welcome to real estate agency/i })
  ).toBeVisible();

  await page.getByLabel("Email", { exact: true }).fill(
    "sepnetflix2023@outlook.com"
  );
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByRole("button", { name: /^sign in$/i }).click();

  await page.waitForURL(/\/$/);
});

test("mobile menu opens and navigates", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await page.getByRole("link", { name: "Properties" }).first().click();
  await page.waitForURL(/\/properties/);
});
