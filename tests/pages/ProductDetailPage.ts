import { Page, Locator, expect } from "@playwright/test";

export class ProductDetailPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly productTitle: Locator;
  readonly wishlistButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.locator("button").filter({ hasText: /Add to cart/i });
    this.productTitle = page.locator("h1").first();
    this.wishlistButton = page.locator("button").filter({ hasText: /Add to wishlist/i });
  }

  async goto(slug: string) {
    // Navigate to product detail page by slug
    // The slug might already contain query params
    const path = slug.startsWith("/") ? slug : `/products/${slug}`;
    await this.page.goto(path);
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }

  async addToCart() {
    await this.addToCartButton.click();
    await this.page.waitForTimeout(200);
  }

  async increaseQuantity() {
    const btn = this.page.locator("button[aria-label*='Increase quantity']").first();
    await btn.click();
    await this.page.waitForTimeout(200);
  }

  async decreaseQuantity() {
    const btn = this.page.locator("button[aria-label*='Decrease quantity']").first();
    await btn.click();
    await this.page.waitForTimeout(200);
  }

  async expectInCart() {
    await expect(this.page.getByText("In Cart")).toBeVisible({ timeout: 5000 });
    await expect(this.addToCartButton).toBeDisabled();
  }

  async expectTitle(productTitle: string) {
    await expect(this.productTitle).toContainText(productTitle);
  }
}
