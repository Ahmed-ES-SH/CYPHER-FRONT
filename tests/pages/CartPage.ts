import { Page, Locator, expect } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly clearCartButton: Locator;
  readonly orderSummary: Locator;
  readonly emptyCartTitle: Locator;
  readonly startShoppingLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator("button").filter({ hasText: /Proceed to Checkout/i });
    this.clearCartButton = page.locator("button").filter({ hasText: /Clear cart/i });
    this.orderSummary = page.getByText("Order Summary");
    this.emptyCartTitle = page.getByText("Your cart is empty");
    this.startShoppingLink = page.locator("a").filter({ hasText: "Start Shopping" });
  }

  async goto() {
    await this.page.goto("/cart");
    await this.page.waitForLoadState("networkidle");
  }

  getCartItem(productName: string): Locator {
    return this.page.getByText(productName).locator("..").locator("..");
  }

  /**
   * Find the increase quantity button by its aria-label attribute.
   * The CartItems component renders: <button aria-label={`Increase quantity of ${name}`}>
   */
  getIncreaseButton(productName: string): Locator {
    return this.page.locator(`button[aria-label*="Increase quantity of ${this.escapeAttr(productName)}"]`);
  }

  /**
   * Find the decrease quantity button by its aria-label attribute.
   */
  getDecreaseButton(productName: string): Locator {
    return this.page.locator(`button[aria-label*="Decrease quantity of ${this.escapeAttr(productName)}"]`);
  }

  getQuantityInput(productName: string): Locator {
    return this.getDecreaseButton(productName).locator("..").locator("input[type='number']");
  }

  /**
   * Find the remove button by its aria-label attribute.
   */
  getRemoveButton(productName: string): Locator {
    return this.page.locator(`button[aria-label*="Remove ${this.escapeAttr(productName)} from cart"]`);
  }

  private escapeAttr(str: string): string {
    // Escape special CSS attribute selector characters
    return str.replace(/"/g, '\\"');
  }

  async expectItemInCart(productName: string) {
    await expect(this.page.getByText(productName).first()).toBeVisible();
  }

  async expectQuantity(productName: string, expectedQty: number) {
    const input = this.getQuantityInput(productName);
    await expect(input).toHaveValue(String(expectedQty));
  }

  async expectSubtotal(productName: string, expectedSubtotal: string) {
    const item = this.getCartItem(productName);
    await expect(item).toContainText(expectedSubtotal);
  }

  async increaseQuantity(productName: string) {
    await this.getIncreaseButton(productName).click();
    await this.page.waitForTimeout(200);
  }

  async decreaseQuantity(productName: string) {
    await this.getDecreaseButton(productName).click();
    await this.page.waitForTimeout(200);
  }

  async removeItem(productName: string) {
    await this.getRemoveButton(productName).click();
    await this.page.waitForTimeout(200);
  }

  async clearCart() {
    await this.clearCartButton.click();
    await this.page.waitForTimeout(200);
  }

  async clickCheckout() {
    await this.checkoutButton.click();
    await this.page.waitForTimeout(500);
  }

  async expectEmptyCart() {
    await expect(this.emptyCartTitle).toBeVisible();
    await expect(this.startShoppingLink).toBeVisible();
  }

  async expectCheckoutDisabled() {
    await expect(this.checkoutButton).toBeDisabled();
  }

  async expectLowStockWarning(productName: string, expectedText: string) {
    const item = this.getCartItem(productName);
    await expect(item).toContainText(expectedText);
  }

  async expectMaxStockReached(productName: string) {
    const item = this.getCartItem(productName);
    await expect(item).toContainText("Max stock reached");
  }

  async expectTotalAmount(expectedTotal: string) {
    await expect(this.page.getByText(`$${expectedTotal}`)).toBeVisible();
  }
}
