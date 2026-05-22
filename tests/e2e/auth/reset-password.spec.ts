import { test, expect } from "@playwright/test";
import { ForgotPasswordPage } from "../../pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../../pages/ResetPasswordPage";

test.describe("Forgot Password", () => {
  let forgotPage: ForgotPasswordPage;

  test.beforeEach(async ({ page }) => {
    forgotPage = new ForgotPasswordPage(page);
    await forgotPage.goto();
  });

  test("shows forgot password form elements", async () => {
    await forgotPage.expectVisible();
    await expect(forgotPage.backToLoginLink).toBeVisible();
    await expect(
      forgotPage.page.getByText("Forgot your password?"),
    ).toBeVisible();
  });

  test("shows validation error for empty email", async () => {
    await forgotPage.submit();
    await forgotPage.expectValidationError(
      "Please enter a valid email address",
    );
  });

  test("shows validation error for invalid email format", async ({ page }) => {
    await forgotPage.fillEmail("not-an-email");
    await page.evaluate(() => document.querySelector("form")?.setAttribute("novalidate", ""));
    await forgotPage.submit();
    await forgotPage.expectValidationError(
      "Please enter a valid email address",
    );
  });

  test("successful send shows success toast and redirects", async ({
    page,
  }) => {
    await page.route("**/auth/reset-password/send", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Reset email sent" }),
      });
    });

    await forgotPage.sendResetLink("test@example.com");
    await expect(
      page.getByText("Reset email sent successfully"),
    ).toBeVisible();
    await expect(page).toHaveURL("/signin");
  });

  test("handles API error for unknown email", async ({ page }) => {
    await page.route("**/auth/reset-password/send", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Email not found" }),
      });
    });

    await forgotPage.sendResetLink("unknown@example.com");
    await expect(page.getByText("Email not found").first()).toBeVisible();
  });

  test("back to login link goes to /signin", async ({ page }) => {
    await forgotPage.backToLoginLink.click();
    await expect(page).toHaveURL("/signin");
  });
});

test.describe("Reset Password", () => {
  let resetPage: ResetPasswordPage;
  const VALID_TOKEN = "valid-reset-token-123";
  const USER_EMAIL = "test@example.com";

  test("shows invalid link state when token is missing", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByText("Invalid Reset Link")).toBeVisible();
  });

  test("shows invalid link state for expired token", async ({ page }) => {
    resetPage = new ResetPasswordPage(page);

    await page.route("**/auth/reset-password/verify", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Invalid or expired token",
        }),
      });
    });

    await resetPage.goto("expired-token", USER_EMAIL);
    await expect(page.getByText("Invalid Reset Link")).toBeVisible();
  });

  test("shows reset password form for valid token", async ({ page }) => {
    resetPage = new ResetPasswordPage(page);

    await page.route("**/auth/reset-password/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: VALID_TOKEN,
          email: USER_EMAIL,
        }),
      });
    });

    await resetPage.goto(VALID_TOKEN, USER_EMAIL);
    await page.waitForTimeout(1000);
    const createNewPassword = page.getByText("Create New Password");
    await createNewPassword.waitFor({ state: "visible", timeout: 15000 });
    await expect(createNewPassword).toBeVisible();
  });

  test("validates password minimum length", async ({ page }) => {
    resetPage = new ResetPasswordPage(page);

    await page.route("**/auth/reset-password/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: VALID_TOKEN, email: USER_EMAIL }),
      });
    });

    await resetPage.goto(VALID_TOKEN, USER_EMAIL);

    const createNewPassword = page.getByText("Create New Password");
    await createNewPassword.waitFor({ state: "visible", timeout: 15000 });

    await resetPage.resetPassword("12345", "12345");
    await resetPage.expectError(
      "Password must be at least 6 characters long.",
    );
  });

  test("validates passwords match", async ({ page }) => {
    resetPage = new ResetPasswordPage(page);

    await page.route("**/auth/reset-password/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: VALID_TOKEN, email: USER_EMAIL }),
      });
    });

    await resetPage.goto(VALID_TOKEN, USER_EMAIL);

    const createNewPassword = page.getByText("Create New Password");
    await createNewPassword.waitFor({ state: "visible", timeout: 15000 });

    await resetPage.resetPassword("password123", "different-pass");
    await resetPage.expectError("Passwords do not match.");
  });

  test("successful reset shows success state and redirects", async ({
    page,
  }) => {
    resetPage = new ResetPasswordPage(page);

    await page.route("**/auth/reset-password/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: VALID_TOKEN, email: USER_EMAIL }),
      });
    });

    await page.route("**/auth/reset-password", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Password reset successfully" }),
      });
    });

    await resetPage.goto(VALID_TOKEN, USER_EMAIL);

    const createNewPassword = page.getByText("Create New Password");
    await createNewPassword.waitFor({ state: "visible", timeout: 15000 });

    await resetPage.resetPassword("newpassword123", "newpassword123");

    await expect(
      page.getByText("Password Reset Successfully!"),
    ).toBeVisible();
    await expect(page.getByText("Go to Login")).toBeVisible();
  });

  test("back to login button goes to /signin", async ({ page }) => {
    resetPage = new ResetPasswordPage(page);

    await page.route("**/auth/reset-password/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: VALID_TOKEN, email: USER_EMAIL }),
      });
    });

    await resetPage.goto(VALID_TOKEN, USER_EMAIL);

    const createNewPassword = page.getByText("Create New Password");
    await createNewPassword.waitFor({ state: "visible", timeout: 15000 });

    await resetPage.backToLoginButton.click();
    await expect(page).toHaveURL("/signin");
  });
});
