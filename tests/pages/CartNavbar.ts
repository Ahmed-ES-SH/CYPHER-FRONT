import { Page, Locator, expect } from "@playwright/test";

export class CartNavbar {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly miniCart: Locator;
  readonly miniCartTitle: Locator;
  readonly viewCartButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Find the cart trigger: the outermost div.relative that contains "Total" text and an SVG
    this.cartIcon = page.locator("div.relative").filter({
      has: page.locator("p").filter({ hasText: "Total" }),
    }).first();
    this.miniCart = page.locator("h4").filter({ hasText: "Cart Items" }).locator("..");
    this.miniCartTitle = page.locator("h4").filter({ hasText: "Cart Items" });
    this.viewCartButton = page.locator("button").filter({ hasText: "View Cart" });
    this.checkoutButton = page.locator("button").filter({ hasText: /^Checkout$/ });
  }

  async openMiniCart() {
    // Hover over the cart icon area to trigger the mini-cart
    await this.cartIcon.hover();
    await this.page.waitForTimeout(600);
  }

  async expectCartBadgeVisible() {
    // Badge is a grandchild of div.relative (the cart trigger), not a direct child
    const badge = this.cartIcon.locator("div.relative div.absolute").filter({ hasText: /^\d+$/ }).first();
    await expect(badge).toBeVisible();
  }

  async expectBadgeCount(count: number) {
    const badge = this.cartIcon.locator("div.relative div.absolute").filter({ hasText: String(count) }).first();
    await expect(badge).toContainText(String(count));
  }

  async expectMiniCartVisible() {
    await expect(this.miniCartTitle).toBeVisible();
  }

  async expectMiniCartItem(productName: string) {
    await expect(this.page.getByText(productName).first()).toBeVisible();
  }

  async expectMiniCartTotal(expectedTotal: string) {
    const totalText = this.page.locator("span.text-primary-blue");
    await expect(totalText).toContainText(expectedTotal);
  }

  async removeItemFromMiniCart(productName: string) {
    await this.openMiniCart();
    // Find the remove button (top-right X icon) within the item div
    const itemDiv = this.page.locator("h4").filter({ hasText: "Cart Items" })
      .locator("..")
      .locator("div.flex.items-center.gap-3")
      .filter({ hasText: productName });
    const removeBtn = itemDiv.locator("div.cursor-pointer").first();
    await removeBtn.click();
  }

  async clickViewCart() {
    await this.viewCartButton.click();
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }

  async expectMiniCartEmpty() {
    await expect(this.page.getByText("Your cart is empty.")).toBeVisible();
  }

  async closeMiniCart() {
    // Click outside to close
    await this.page.locator("body").click({ position: { x: 0, y: 0 } });
    await this.page.waitForTimeout(200);
  }
}
