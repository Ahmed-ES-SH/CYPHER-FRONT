import { test, expect } from "@playwright/test";
import { NavbarPage } from "../../pages/NavbarPage";
import { TEST_USER } from "../../fixtures/auth.fixture";

test.describe("Session Initialization", () => {
  test("unauthenticated user sees sign in button", async ({ page }) => {
    await page.route("**/auth/current-user", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Authentication cookie not found" }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const navbar = new NavbarPage(page);
    await navbar.expectSignInVisible();
  });

  test("authenticated user sees user button", async ({ page }) => {
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

  test("session initialization fires exactly once", async ({ page }) => {
    let callCount = 0;

    await page.route("**/auth/current-user", async (route) => {
      callCount++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(TEST_USER),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(callCount).toBe(1);
  });

  test("401 on session check keeps user unauthenticated", async ({
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
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#user")).toBeVisible();
  });

  test("network error during session init does not break app", async ({
    page,
  }) => {
    await page.route("**/auth/current-user", async (route) => {
      await route.abort("connectionrefused");
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("#user")).toBeVisible();
  });
});
