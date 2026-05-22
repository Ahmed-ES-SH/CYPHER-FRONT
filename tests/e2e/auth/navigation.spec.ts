import { test, expect } from "@playwright/test";
import { TEST_USER } from "../../fixtures/auth.fixture";

test.describe("Auth Navigation Guards", () => {
  test("unauthenticated user can access /signin", async ({ page }) => {
    await page.route("**/auth/current-user", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Authentication cookie not found" }),
      });
    });

    await page.goto("/signin");
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
  });

  test("authenticated user redirected to home after login", async ({
    page,
  }) => {
    await page.goto("/signin");

    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: TEST_USER, access_token: "mock-token" }),
      });
    });

    await page.getByPlaceholder("Enter your email").fill("test@example.com");
    await page.getByPlaceholder("Enter your password").fill("password123");
    await page.getByRole("button", { name: /login/i }).click();

    await expect(page).toHaveURL("/");
  });

  test("authenticated user is initialized on protected pages", async ({
    page,
  }) => {
    await page.route("**/auth/current-user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(TEST_USER),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("button[aria-haspopup='true']")).toBeVisible();
  });
});

test.describe("Auth Form Navigation", () => {
  test("forgot password link from login page", async ({ page }) => {
    await page.goto("/signin");
    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL("/forget-password");
  });

  test("back to login from forgot password page", async ({ page }) => {
    await page.goto("/forget-password");
    await page.getByRole("link", { name: /back to login/i }).click();
    await expect(page).toHaveURL("/signin");
  });

  test("sign up link from login page", async ({ page }) => {
    await page.goto("/signin");
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/signup");
  });

  test("sign in link from sign up page", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL("/signin");
  });

  test("invalid reset link shows request new link button", async ({
    page,
  }) => {
    await page.goto("/reset-password");
    await expect(page.getByText("Invalid Reset Link")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /request new reset link/i }),
    ).toBeVisible();
  });

  test("request new reset link navigates to forgot password", async ({
    page,
  }) => {
    await page.goto("/reset-password");
    await page
      .getByRole("button", { name: /request new reset link/i })
      .click();
    await expect(page).toHaveURL("/forgot-password");
  });
});

test.describe("Unauthorized Access", () => {
  test("unauthenticated user can still access public pages", async ({
    page,
  }) => {
    await page.route("**/auth/current-user", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Authentication cookie not found" }),
      });
    });

    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("#user")).toBeVisible();
  });
});
