import { Page, Locator, expect } from "@playwright/test";

export class ShopPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/shop");
    // Wait for products to load from the real backend
    await this.page.waitForLoadState("networkidle");
    // Wait for product cards to appear (the loading spinner should disappear)
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get the first product card that has an "Add to cart" button.
   * ProductAction button text is "Add to cart" (lowercase c).
   */
  getFirstProductCard(): Locator {
    return this.page.locator("button").filter({ hasText: /Add to cart/i }).first().locator("..").locator("..");
  }

  /**
   * Get the name of the first visible product.
   * ProductCard renders the title inside a <Link href="/products/...">.
   */
  async getFirstProductName(): Promise<string> {
    const firstLink = this.page.locator("a[href*='/products/']").filter({ hasText: /./ }).first();
    await expect(firstLink).toBeVisible({ timeout: 10000 });
    return (await firstLink.textContent()) || "";
  }

  /**
   * Get the first "Add to Cart" button on the page
   */
  getFirstAddToCartButton(): Locator {
    return this.page.locator("button").filter({ hasText: /Add to cart/i }).first();
  }

  /**
   * Add the first available product to cart
   */
  async addFirstProductToCart(): Promise<string> {
    const productName = await this.getFirstProductName();
    const addBtn = this.getFirstAddToCartButton();
    await addBtn.hover();
    await this.page.waitForTimeout(300);
    await addBtn.click();
    return productName;
  }

  /**
   * Add a specific product (by title) to cart
   */
  async addProductToCart(productTitle: string) {
    const card = this.page.locator("a").filter({ hasText: productTitle }).first().locator("..");
    await card.hover();
    await this.page.waitForTimeout(400);
    const addBtn = card.locator("button").filter({ hasText: /Add to cart/i });
    if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addBtn.click();
    } else {
      await card.locator("div").first().hover();
      await this.page.waitForTimeout(300);
      await addBtn.click({ force: true, timeout: 3000 });
    }
  }

  async getFirstProductLink(): Promise<string> {
    const link = this.page.locator("a[href*='/products/']").filter({ hasText: /./ }).first();
    await expect(link).toBeVisible({ timeout: 10000 });
    return (await link.getAttribute("href")) || "";
  }

  /** Check if at least one product is rendered */
  async expectProductsVisible() {
    const productLink = this.page.locator("a[href*='/products/']").filter({ hasText: /./ }).first();
    await expect(productLink).toBeVisible({ timeout: 15000 });
  }

  /** Look for any out-of-stock product */
  async expectOutOfStockProduct(): Promise<boolean> {
    const outOfStockButton = this.page.locator("button").filter({ hasText: /Out of Stock/i }).first();
    try {
      await expect(outOfStockButton).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /** Get the slug from the first product link */
  getProductSlugFromLink(link: string): string {
    const match = link.match(/\/products\/([^?]+)/);
    return match ? match[1] : "";
  }
}
