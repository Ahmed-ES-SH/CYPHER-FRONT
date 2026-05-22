import { Page, Locator, expect } from "@playwright/test";

export class ResetPasswordPage {
  readonly page: Page;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newPasswordInput = page.locator("#newPassword");
    this.confirmPasswordInput = page.locator("#confirmPassword");
    this.submitButton = page.getByRole("button", { name: /reset password/i });
    this.backToLoginButton = page.getByRole("button", { name: /back to login/i });
  }

  async goto(token: string, email?: string) {
    const params = new URLSearchParams({ token });
    if (email) params.set("e", email);
    await this.page.goto(`/reset-password?${params.toString()}`);
  }

  async fillNewPassword(password: string) {
    await this.newPasswordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async resetPassword(newPassword: string, confirmPassword: string) {
    await this.fillNewPassword(newPassword);
    await this.fillConfirmPassword(confirmPassword);
    await this.submit();
  }

  async expectFormVisible() {
    await expect(this.newPasswordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectVisible() {
    await expect(this.page.getByText("Create New Password")).toBeVisible();
  }

  async expectLoadingState() {
    await expect(this.page.getByText("Resetting Password...")).toBeVisible();
    await expect(this.submitButton).toBeDisabled();
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
