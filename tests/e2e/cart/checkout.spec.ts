import { test, expect } from "@playwright/test";
import { CartPage } from "../../pages/CartPage";
import { CartNavbar } from "../../pages/CartNavbar";
import {
  SAMPLE_PRODUCT,
  SAMPLE_PRODUCT_2,
  createGuestCartState,
} from "../../fixtures/cart.fixture";

test.describe("Checkout Flow", () => {
  test("13 — Proceed to checkout from cart page", async ({ page }) => {
    // Set up cart with items via localStorage BEFORE navigation
    const state = createGuestCartState([{ productId: SAMPLE_PRODUCT.id, quantity: 1 }]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    // Mock the checkout API route (regular Next.js API route, interceptable)
    let checkoutCalled = false;
    await page.route("**/api/checkout", async (route) => {
      checkoutCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ sessionId: "cs_test_123456" }),
      });
    });

    const cart = new CartPage(page);
    await cart.goto();
    await cart.clickCheckout();

    // The checkout API should have been called
    expect(checkoutCalled).toBeTruthy();
  });

  test("14 — Proceed to checkout from mini-cart", async ({ page }) => {
    const state = createGuestCartState([{ productId: SAMPLE_PRODUCT.id, quantity: 1 }]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    let checkoutCalled = false;
    await page.route("**/api/checkout", async (route) => {
      checkoutCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ sessionId: "cs_test_123456" }),
      });
    });

    const navbar = new CartNavbar(page);
    await page.goto("/", { waitUntil: "networkidle" });

    await navbar.openMiniCart();
    await navbar.clickCheckout();

    expect(checkoutCalled).toBeTruthy();
  });

  test("15 — Empty cart checkout is prevented", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();

    // Checkout button should be disabled
    await cart.expectCheckoutDisabled();
  });

  test("16 — Checkout API error shows error toast", async ({ page }) => {
    const state = createGuestCartState([{ productId: SAMPLE_PRODUCT.id, quantity: 1 }]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    // Mock checkout API to return 500
    await page.route("**/api/checkout", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error" }),
      });
    });

    const cart = new CartPage(page);
    await cart.goto();
    await cart.clickCheckout();

    // Should show error toast
    await expect(page.getByText(/failed|could not|error/i)).toBeVisible({ timeout: 5000 });
  });

  test("17 — Payment success page loads and clears cart", async ({ page }) => {
    // Set up cart with items first
    const state = createGuestCartState([
      { productId: SAMPLE_PRODUCT.id, quantity: 2 },
      { productId: SAMPLE_PRODUCT_2.id, quantity: 1 },
    ]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    // Navigate to payment success page
    await page.goto("/paymentsuccess?payment_status=success&amount=50&productLength=2");
    await page.waitForLoadState("networkidle");

    // Should show success message
    await expect(page.getByText("Payment Successful!")).toBeVisible();
    await expect(page.getByText("Thank you for your purchase")).toBeVisible();

    // Cart should be cleared (the PaymentSuccess component clears it)
    await page.waitForTimeout(1000);
    const stored = await page.evaluate(() => localStorage.getItem("cart-guest-items"));
    if (stored) {
      const parsed = JSON.parse(stored);
      const guestItems = parsed.state?.guestItems ?? [];
      expect(guestItems.length).toBe(0);
    }
  });

  test("18 — Payment failure page shows error details and retry button", async ({ page }) => {
    await page.goto("/paymentfaild?amount=50");
    await page.waitForLoadState("networkidle");

    // Should show failure message
    await expect(page.getByText("Payment Failed")).toBeVisible();
    await expect(page.getByRole("button", { name: /Try Again/i })).toBeVisible();
  });
});
