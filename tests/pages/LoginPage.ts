import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  readonly googleButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly passwordToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder("Enter your email");
    this.passwordInput = page.getByPlaceholder("Enter your password");
    this.submitButton = page.locator('button[type="submit"]').filter({ hasText: /login|logging/i });
    this.forgotPasswordLink = page.getByRole("link", { name: /forgot password/i });
    this.signUpLink = page.getByRole("link", { name: /sign up/i });
    this.googleButton = page.getByRole("button", { name: /continue with google/i });
    this.rememberMeCheckbox = page.getByRole("checkbox", { name: /remember me/i });
    this.passwordToggle = page.locator("button").filter({ has: page.locator("svg") }).first();
  }

  async goto() {
    await this.page.goto("/signin");
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async expectVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  async expectValidationError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async expectLoadingState() {
    await expect(this.page.getByText("Logging in...")).toBeVisible();
    await expect(this.submitButton).toBeDisabled();
  }

  async expectIdleState() {
    await expect(this.submitButton).toBeEnabled();
    await expect(this.page.getByText("Login")).toBeVisible();
  }
}
