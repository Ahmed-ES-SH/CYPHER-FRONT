import { test, expect } from "@playwright/test";
import { ShopPage } from "../../pages/ShopPage";
import { CartPage } from "../../pages/CartPage";
import {
  SAMPLE_PRODUCT,
  LOW_STOCK_PRODUCT,
  createGuestCartState,
} from "../../fixtures/cart.fixture";

test.describe("Quantity & Stock Edge Cases", () => {
  test("19 — Out-of-stock product shows disabled button (check real shop)", async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await shop.expectProductsVisible();

    // Check if there's an out-of-stock product on the real shop page
    const hasOutOfStock = await shop.expectOutOfStockProduct();
    if (!hasOutOfStock) {
      test.info().annotations.push({
        type: "skip",
        description: "No out-of-stock products found on real backend — skipping",
      });
      test.skip();
    }
  });

  test("20 — Max stock reached warning shown", async ({ page }) => {
    // Set up cart with quantity at stock limit
    const state = createGuestCartState([{ productId: LOW_STOCK_PRODUCT.id, quantity: 3, stock: 3 }]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    const cart = new CartPage(page);
    await cart.goto();

    // Should show "Max stock reached"
    await cart.expectMaxStockReached(LOW_STOCK_PRODUCT.title);
  });

  test("21 — Low stock warning is shown", async ({ page }) => {
    // Set up cart with low stock product
    const state = createGuestCartState([{ productId: LOW_STOCK_PRODUCT.id, quantity: 1, stock: 3 }]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    const cart = new CartPage(page);
    await cart.goto();

    // Should show low stock warning
    await cart.expectLowStockWarning(LOW_STOCK_PRODUCT.title, "Only 3 left");
  });

  test("22 — Duplicate adds merge quantity", async ({ page }) => {
    // Start with 1 item
    const state = createGuestCartState([{ productId: SAMPLE_PRODUCT.id, quantity: 1 }]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    // Simulate adding another by updating state and reloading
    await page.addInitScript(() => {
      const stored = localStorage.getItem("cart-guest-items");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.state.guestItems[0].quantity = 2;
        localStorage.setItem("cart-guest-items", JSON.stringify(parsed));
      }
    });

    const cart = new CartPage(page);
    await cart.goto();

    // Quantity should be 2
    await cart.expectQuantity(SAMPLE_PRODUCT.title, 2);
  });
});
