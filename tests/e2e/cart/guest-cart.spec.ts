import { test, expect } from "@playwright/test";
import { ShopPage } from "../../pages/ShopPage";
import { CartPage } from "../../pages/CartPage";
import { CartNavbar } from "../../pages/CartNavbar";
import { ProductDetailPage } from "../../pages/ProductDetailPage";
import {
  SAMPLE_PRODUCT,
  SAMPLE_PRODUCT_2,
  createGuestCartState,
} from "../../fixtures/cart.fixture";

test.describe("Guest Cart — Add to Cart from Shop", () => {
  test("1 — Add product to cart from product card", async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await shop.expectProductsVisible();

    await shop.addFirstProductToCart();

    // Assert toast "Added to cart!"
    await expect(page.getByText("Added to cart!")).toBeVisible({ timeout: 5000 });
  });

  test("2 — Add product to cart from search results", async ({ page }) => {
    // First, get a real product name from the shop page
    const shop = new ShopPage(page);
    await shop.goto();
    await shop.expectProductsVisible();

    const productName = await shop.getFirstProductName();

    // Search for the first few characters of the product name
    const searchQuery = productName.trim().split(/\s+/)[0];
    const searchInput = page.getByPlaceholder(/search/i).first();
    await searchInput.fill(searchQuery);
    await page.waitForTimeout(2000);

    // Look for a search result with an add button
    const addBtn = page.locator(`button[aria-label*="${searchQuery}"]`).first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    await expect(page.getByText("Added to cart!")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Guest Cart — Quantity & Manage Items", () => {
  test.beforeEach(async ({ page }) => {
    // Set up cart with 2 items via localStorage BEFORE navigating
    const state = createGuestCartState([
      { productId: SAMPLE_PRODUCT.id, quantity: 2 },
      { productId: SAMPLE_PRODUCT_2.id, quantity: 1 },
    ]);
    // Use addInitScript to set localStorage before any page loads
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));
  });

  test("4 — Increase quantity in cart", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await cart.expectItemInCart(SAMPLE_PRODUCT.title);

    await cart.increaseQuantity(SAMPLE_PRODUCT.title);
    await cart.expectQuantity(SAMPLE_PRODUCT.title, 3);
  });

  test("5 — Decrease quantity in cart", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await cart.expectItemInCart(SAMPLE_PRODUCT.title);

    await cart.decreaseQuantity(SAMPLE_PRODUCT.title);
    await cart.expectQuantity(SAMPLE_PRODUCT.title, 1);
  });

  test("6 — Remove item from cart", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();
    await cart.expectItemInCart(SAMPLE_PRODUCT_2.title);

    await cart.removeItem(SAMPLE_PRODUCT_2.title);
    await expect(page.getByText("Removed from cart")).toBeVisible({ timeout: 5000 });
  });

  test("7 — Clear cart", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goto();

    await cart.clearCart();
    await cart.expectEmptyCart();
  });
});

test.describe("Guest Cart — Add from Product Detail Page", () => {
  test("3 — Add product to cart from detail page", async ({ page }) => {
    // Navigate to shop to get a product link
    const shop = new ShopPage(page);
    await shop.goto();
    await shop.expectProductsVisible();

    const productLink = await shop.getFirstProductLink();

    // Navigate to the product detail page
    const slug = productLink.startsWith("/") ? productLink : `/products/${productLink}`;
    const detail = new ProductDetailPage(page);
    await detail.goto(slug);

    // Wait for product to load
    await page.waitForTimeout(1000);

    // Add to cart
    await detail.addToCart();
    await expect(page.getByText("Added to cart!")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Guest Cart — Empty & Navbar State (localStorage setup)", () => {
  test("8 — Empty cart state", async ({ page }) => {
    // Ensure cart is empty
    await page.addInitScript(() => localStorage.removeItem("cart-guest-items"));

    const cart = new CartPage(page);
    await cart.goto();
    await cart.expectEmptyCart();
  });

  test("9 — Cart navbar badge shows correct count", async ({ page }) => {
    const state = createGuestCartState([
      { productId: SAMPLE_PRODUCT.id, quantity: 1 },
      { productId: SAMPLE_PRODUCT_2.id, quantity: 2 },
    ]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    const navbar = new CartNavbar(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // Badge shows unique item count = 2
    await navbar.expectBadgeCount(2);
  });

  test("10 — Mini-cart dropdown shows items and actions", async ({ page }) => {
    const state = createGuestCartState([{ productId: SAMPLE_PRODUCT.id, quantity: 1 }]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    const navbar = new CartNavbar(page);
    await page.goto("/", { waitUntil: "networkidle" });

    await navbar.openMiniCart();
    await navbar.expectMiniCartVisible();
    await navbar.expectMiniCartItem(SAMPLE_PRODUCT.title);
  });

  test("11 — Remove item from mini-cart", async ({ page }) => {
    const state = createGuestCartState([
      { productId: SAMPLE_PRODUCT.id, quantity: 1 },
      { productId: SAMPLE_PRODUCT_2.id, quantity: 1 },
    ]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    const navbar = new CartNavbar(page);
    await page.goto("/", { waitUntil: "networkidle" });

    await navbar.removeItemFromMiniCart(SAMPLE_PRODUCT_2.title);
    await expect(page.getByText("Removed from cart")).toBeVisible({ timeout: 5000 });
  });

  test("12 — Cart persists after page refresh", async ({ page }) => {
    const state = createGuestCartState([{ productId: SAMPLE_PRODUCT.id, quantity: 1 }]);
    await page.addInitScript((s) => {
      localStorage.setItem("cart-guest-items", s);
    }, JSON.stringify(state));

    const cart = new CartPage(page);
    await cart.goto();

    await cart.expectItemInCart(SAMPLE_PRODUCT.title);
  });
});
