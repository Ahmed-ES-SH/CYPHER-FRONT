import { test, expect } from "@playwright/test";
import { NavbarPage } from "../../pages/NavbarPage";
import { TEST_USER } from "../../fixtures/auth.fixture";

test.describe("Logout Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/auth/current-user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(TEST_USER),
      });
    });

    await page.goto("/", { waitUntil: "load" });
  });

  test("user menu opens and shows account info", async ({ page }) => {
    const navbar = new NavbarPage(page);
    await navbar.openUserMenu();
    await navbar.expectUserMenuOpen();
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
    await expect(page.getByText("Member")).toBeVisible();
  });

  test("admin user sees admin dashboard link", async ({ page }) => {
    await page.route("**/auth/current-user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...TEST_USER,
          role: "admin",
        }),
      });
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    const navbar = new NavbarPage(page);
    await navbar.openUserMenu();
    await navbar.expectAdminDashboardVisible();
  });

  test("logout clears state and redirects to sign in", async ({ page }) => {
    await page.route("**/auth/logout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    const navbar = new NavbarPage(page);
    await navbar.clickLogout();
    await expect(page).toHaveURL("/signin");
  });

  test("shows loading state during logout", async ({ page }) => {
    await page.route("**/auth/logout", async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    const navbar = new NavbarPage(page);
    await navbar.openUserMenu();
    const logoutBtn = page.locator("button").filter({ hasText: "Logout" });
    await logoutBtn.click();
    await navbar.expectLogoutLoading();
  });

  test("handles logout API failure gracefully", async ({ page }) => {
    await page.route("**/auth/logout", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Server error" }),
      });
    });

    const navbar = new NavbarPage(page);
    await navbar.openUserMenu();

    const logoutBtn = page.locator("button").filter({ hasText: "Logout" });
    await logoutBtn.click();
    await page.waitForTimeout(1000);
  });

  test("user dashboard link is visible in dropdown", async ({ page }) => {
    const navbar = new NavbarPage(page);
    await navbar.openUserMenu();
    await expect(page.getByText("User Dashboard")).toBeVisible();
  });
});
