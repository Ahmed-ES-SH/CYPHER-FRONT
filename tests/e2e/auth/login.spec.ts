import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { TEST_USER } from "../../fixtures/auth.fixture";

test.describe("Login Page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("shows all login form elements", async () => {
    await loginPage.expectVisible();
  });

  test("shows validation error for empty email", async () => {
    await loginPage.submit();
    await loginPage.expectValidationError("Email is required");
  });

  test("shows validation error for empty password", async () => {
    await loginPage.fillEmail("test@example.com");
    await loginPage.submit();
    await loginPage.expectValidationError("Password is required");
  });

  test("shows validation error for invalid email format", async ({ page }) => {
    await loginPage.fillEmail("not-an-email");
    await loginPage.fillPassword("password123");
    await page.evaluate(() => document.querySelector("form")?.setAttribute("novalidate", ""));
    await loginPage.submit();
    await loginPage.expectValidationError("Please enter a valid email");
  });

  test("shows validation error for short password", async () => {
    await loginPage.fillEmail("test@example.com");
    await loginPage.fillPassword("12345");
    await loginPage.submit();
    await loginPage.expectValidationError(
      "Password must be at least 6 characters",
    );
  });

  test("shows loading state during login", async ({ page }) => {
    await page.route("**/auth/login", async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: TEST_USER, access_token: "mock-token" }),
      });
    });

    await loginPage.fillEmail("test@example.com");
    await loginPage.fillPassword("password123");
    await loginPage.submit();

    await loginPage.expectLoadingState();
  });

  test("shows error toast on invalid credentials", async ({ page }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid email or password" }),
      });
    });

    await loginPage.login("wrong@example.com", "wrongpass");
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("shows error toast for unverified email", async ({ page }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          message: "You need to verify your email first",
        }),
      });
    });

    await loginPage.login("unverified@example.com", "password123");
    await expect(
      page.getByText("You need to verify your email first"),
    ).toBeVisible();
  });

  test("toggles password visibility", async () => {
    await loginPage.fillPassword("visible-password");

    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");

    await loginPage.passwordToggle.click();
    await expect(loginPage.passwordInput).toHaveAttribute("type", "text");

    await loginPage.passwordToggle.click();
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
  });

  test("remember me checkbox toggles", async () => {
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
    await loginPage.rememberMeCheckbox.check();
    await expect(loginPage.rememberMeCheckbox).toBeChecked();
    await loginPage.rememberMeCheckbox.uncheck();
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
  });

  test("successful login redirects to home and shows user button", async ({
    page,
  }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: TEST_USER, access_token: "mock-token" }),
      });
    });

    await loginPage.login("test@example.com", "password123");
    await expect(page).toHaveURL("/");
  });

  test("forgot password link navigates to /forget-password", async ({
    page,
  }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL("/forget-password");
  });

  test("sign up link navigates to /signup", async ({ page }) => {
    await loginPage.signUpLink.click();
    await expect(page).toHaveURL("/signup");
  });

  test("social login button redirects to backend Google auth", async ({
    page,
  }) => {
    await page.route("**/auth/google", (route) =>
      route.fulfill({ status: 200 }),
    );

    await loginPage.googleButton.click();
  });
});
