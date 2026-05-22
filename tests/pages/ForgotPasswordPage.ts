import { Page, Locator, expect } from "@playwright/test";

export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder("example@email.com");
    this.submitButton = page.locator('button[type="submit"]').filter({ hasText: /send|sending/i });
    this.backToLoginLink = page.getByRole("link", { name: /back to login/i });
  }

  async goto() {
    await this.page.goto("/forget-password");
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async submit() {
    await this.submitButton.click();
  }

  async sendResetLink(email: string) {
    await this.fillEmail(email);
    await this.submit();
  }

  async expectVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectLoadingState() {
    await expect(this.page.getByText("Sending...")).toBeVisible();
    await expect(this.submitButton).toBeDisabled();
  }

  async expectValidationError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
