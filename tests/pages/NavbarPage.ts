import { Page, Locator, expect } from "@playwright/test";

export class NavbarPage {
  readonly page: Page;
  readonly signInButton: Locator;
  readonly userMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInButton = page.locator("#user");
    this.userMenuButton = page.locator("button[aria-haspopup='true']");
  }

  async expectSignInVisible() {
    await expect(this.signInButton).toBeVisible();
    await expect(this.signInButton).toHaveAttribute("href", "/signin");
  }

  async expectSignInHidden() {
    await expect(this.signInButton).not.toBeVisible();
  }

  async openUserMenu() {
    await this.userMenuButton.click();
  }

  async expectUserMenuOpen() {
    await expect(this.page.getByText("User Dashboard")).toBeVisible();
  }

  async clickLogout() {
    await this.openUserMenu();
    const logoutBtn = this.page.locator("button").filter({ hasText: "Logout" });
    await logoutBtn.click();
  }

  async expectLogoutLoading() {
    await expect(this.page.getByText("Signing out...")).toBeVisible();
  }

  async expectAdminDashboardVisible() {
    await expect(this.page.getByText("Admin Dashboard")).toBeVisible();
  }
}
