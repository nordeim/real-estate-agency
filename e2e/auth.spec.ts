import { test, expect, type Page } from "@playwright/test";

/**
 * The original app's five-view login card: sign-in, reset-password,
 * check-email, create-account, verify-email. Guards the view
 * transitions, the observed error copy, the OTP behavior, and the
 * toaster scope (the original mounts sonner ONLY on /login — its
 * inquiry-form toast() call is a silent no-op everywhere else).
 */

/** The auth card's alert block (Next's route announcer also carries role=alert). */
const cardAlert = (page: Page) =>
  page.locator('div[role=alert]:not([id*="route-announcer"])');

test("invalid credentials show the original red alert below the buttons", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("Email", { exact: true }).fill("x@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: /^sign in$/i }).click();

  const alert = cardAlert(page);
  await expect(alert).toBeVisible();
  await expect(alert).toHaveText("Invalid email or password");
  await expect(alert).toHaveClass(/bg-red-50\/70/);
  await expect(alert).toHaveClass(/border-red-200/);
  // The alert is the form's last child — below the submit button and
  // the forgot/signup row, as on the original.
  const orderOk = await page.evaluate(() => {
    const form = document.querySelector("form");
    const alert = form?.querySelector("[role=alert]");
    const forgot = Array.from(form?.querySelectorAll("button") ?? []).find(
      (button) => /forgot password/i.test(button.textContent ?? "")
    );
    if (!form || !alert || !forgot) return false;
    return (
      Array.from(form.children).indexOf(alert) >
      Array.from(form.children).indexOf(forgot.parentElement!)
    );
  });
  expect(orderOk).toBe(true);
});

test("forgot-password opens the reset view and submitting shows check-your-email", async ({
  page,
}) => {
  await page.goto("/login");

  await page
    .getByRole("button", { name: /forgot password\?/i })
    .click();
  await expect(
    page.getByRole("heading", { name: /reset your password/i })
  ).toBeVisible();
  await expect(
    page.getByText(/enter your email and we'll send you a link/i)
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /send reset link/i })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /back to sign in/i })
  ).toBeVisible();

  await page
    .getByLabel("Email", { exact: true })
    .fill("reset-flow@example.com");
  await page.getByRole("button", { name: /send reset link/i }).click();

  await expect(
    page.getByRole("heading", { name: /check your email/i })
  ).toBeVisible();
  await expect(
    page.getByText(/we've sent password reset instructions to/i)
  ).toBeVisible();
  await expect(page.locator("text=reset-flow@example.com")).toBeVisible();
  const alert = cardAlert(page);
  await expect(alert).toBeVisible();
  await expect(alert).toHaveClass(/bg-green-50\/70/);
  await expect(alert).toHaveText(
    /please check your email for the password reset link/i
  );

  await page.getByRole("button", { name: /back to sign in/i }).click();
  await expect(
    page.getByRole("heading", { name: /welcome to real estate agency/i })
  ).toBeVisible();
});

test("reset view blocks a malformed email via native validation", async ({
  page,
}) => {
  await page.goto("/login");

  await page
    .getByRole("button", { name: /forgot password\?/i })
    .click();
  await page.getByLabel("Email", { exact: true }).fill("not-an-email");
  await page.getByRole("button", { name: /send reset link/i }).click();

  // Native required/type=email validation keeps the card on the reset
  // view — exactly as on the original.
  await expect(
    page.getByRole("heading", { name: /reset your password/i })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /check your email/i })
  ).toHaveCount(0);
});

test("sign-up validates password length, mismatch, and duplicates with the original copy", async ({
  page,
}) => {
  await page.goto("/login");

  await page
    .getByRole("button", { name: /need an account\? sign up/i })
    .click();
  await expect(
    page.getByRole("heading", { name: /create your account/i })
  ).toBeVisible();

  // Short password.
  await page.getByLabel("Email", { exact: true }).fill("pw-length@example.com");
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByLabel("Confirm Password").fill("short");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(cardAlert(page)).toHaveText(
    "Password must be at least 8 characters long"
  );

  // Mismatched confirmation.
  await page.getByLabel("Password", { exact: true }).fill("LongEnough1!");
  await page.getByLabel("Confirm Password").fill("Different99!");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(cardAlert(page)).toHaveText("Passwords do not match");

  // Duplicate email (the seeded demo user).
  await page
    .getByLabel("Email", { exact: true })
    .fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password", { exact: true }).fill("LongEnough1!");
  await page.getByLabel("Confirm Password").fill("LongEnough1!");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(cardAlert(page)).toHaveText(
    "A user with this email already exists"
  );
});

test("a valid signup reaches the verify view with six auto-advancing OTP inputs", async ({
  page,
}) => {
  await page.goto("/login");

  await page
    .getByRole("button", { name: /need an account\? sign up/i })
    .click();

  const email = `e2e-signup-${Date.now()}@example.com`;
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("LongEnough1!");
  await page.getByLabel("Confirm Password").fill("LongEnough1!");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(
    page.getByRole("heading", { name: /verify your email/i })
  ).toBeVisible();
  await expect(
    page.getByText(/we've sent a 6-digit code to/i)
  ).toBeVisible();
  await expect(page.locator("text=" + email)).toBeVisible();

  const otp = page.locator("input[inputmode=numeric]");
  await expect(otp).toHaveCount(6);

  // Auto-advance: typing a digit in box 1 moves focus to box 2.
  await otp.first().press("5");
  await expect(otp.nth(1)).toBeFocused();
  await expect(otp.first()).toHaveValue("5");
});

test("a wrong code decrements the attempt budget with the original copy", async ({
  page,
}) => {
  await page.goto("/login");

  await page
    .getByRole("button", { name: /need an account\? sign up/i })
    .click();

  const email = `e2e-wrongcode-${Date.now()}@example.com`;
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("LongEnough1!");
  await page.getByLabel("Confirm Password").fill("LongEnough1!");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(
    page.getByRole("heading", { name: /verify your email/i })
  ).toBeVisible();

  const otp = page.locator("input[inputmode=numeric]");
  for (let i = 0; i < 6; i++) {
    await otp.nth(i).fill("0");
  }
  await page.getByRole("button", { name: /verify email/i }).click();

  await expect(cardAlert(page)).toHaveText(
    "Invalid verification code. 4 attempts remaining."
  );

  // The resend control flashes its pending label and returns.
  await page.getByRole("button", { name: /^resend$/i }).click();
  await expect(
    page.getByText(/didn't receive the code\?/i)
  ).toContainText(/resend/i, { timeout: 5_000 });
});

test("the sonner toaster is mounted only on /login (original scope)", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.locator("section[aria-label='Notifications alt+T'], [data-sonner-toaster]")
  ).toHaveCount(1);

  await page.goto("/");
  await expect(
    page.locator("section[aria-label^='Notifications'], [data-sonner-toaster]")
  ).toHaveCount(0);

  await page.goto("/sell");
  await expect(
    page.locator("section[aria-label^='Notifications'], [data-sonner-toaster]")
  ).toHaveCount(0);
});
