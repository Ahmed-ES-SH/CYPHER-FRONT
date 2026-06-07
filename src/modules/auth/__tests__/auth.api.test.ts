import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  authKeys,
  AUTH_ERRORS,
  AUTH_ROUTES,
  AUTH_ENDPOINTS,
  AUTH_COOKIE_NAME,
} from "../constants";

/* =========================================================
   authKeys
   ========================================================= */

describe("authKeys", () => {
  it("produces stable session keys", () => {
    const key1 = authKeys.session();
    const key2 = authKeys.session();
    expect(key1).toEqual(key2);
  });

  it("produces all and session prefixes", () => {
    expect(authKeys.all).toEqual(["auth"]);
    expect(authKeys.session()).toEqual(["auth", "session"]);
  });
});

/* =========================================================
   AUTH_ERRORS
   ========================================================= */

describe("AUTH_ERRORS", () => {
  it("maps known error messages to user-friendly versions", () => {
    expect(AUTH_ERRORS["Invalid email or password"]).toBe(
      "Invalid email or password",
    );
  });

  it("maps email verification error with helpful message", () => {
    expect(AUTH_ERRORS["You need to verify your email first"]).toBe(
      "Please verify your email. A new verification link has been sent.",
    );
  });

  it("maps expired token error with guidance", () => {
    expect(AUTH_ERRORS["Invalid or expired token"]).toBe(
      "This link has expired. Please request a new one.",
    );
  });

  it("maps missing cookie error", () => {
    expect(AUTH_ERRORS["Authentication cookie not found"]).toBe(
      "Please log in again.",
    );
  });

  it("maps revoked token error", () => {
    expect(AUTH_ERRORS["This token has been revoked"]).toBe(
      "Session revoked. Please log in again.",
    );
  });

  it("returns undefined for unknown error keys", () => {
    expect(AUTH_ERRORS["Some unknown error"]).toBeUndefined();
  });
});

/* =========================================================
   AUTH_ROUTES
   ========================================================= */

describe("AUTH_ROUTES", () => {
  it("defines all expected routes", () => {
    expect(AUTH_ROUTES.LOGIN).toBe("/signin");
    expect(AUTH_ROUTES.HOME).toBe("/");
    expect(AUTH_ROUTES.VERIFY_EMAIL).toBe("/verify-email");
    expect(AUTH_ROUTES.FORGOT_PASSWORD).toBe("/forget-password");
    expect(AUTH_ROUTES.RESET_PASSWORD).toBe("/reset-password");
  });

  it("all routes are strings", () => {
    Object.values(AUTH_ROUTES).forEach((route) => {
      expect(typeof route).toBe("string");
    });
  });
});

/* =========================================================
   AUTH_ENDPOINTS
   ========================================================= */

describe("AUTH_ENDPOINTS", () => {
  it("defines all expected endpoints", () => {
    expect(AUTH_ENDPOINTS.LOGIN).toBe("/api/auth/login");
    expect(AUTH_ENDPOINTS.LOGOUT).toBe("/api/auth/logout");
    expect(AUTH_ENDPOINTS.CURRENT_USER).toBe("/api/auth/current-user");
    expect(AUTH_ENDPOINTS.VERIFY_EMAIL).toBe("/api/auth/verify-email");
    expect(AUTH_ENDPOINTS.RESET_PASSWORD_SEND).toBe(
      "/api/auth/reset-password/send",
    );
    expect(AUTH_ENDPOINTS.RESET_PASSWORD_VERIFY).toBe(
      "/api/auth/reset-password/verify",
    );
    expect(AUTH_ENDPOINTS.RESET_PASSWORD).toBe("/api/auth/reset-password");
    expect(AUTH_ENDPOINTS.GOOGLE).toBe("/api/auth/google");
  });

  it("all endpoints start with /api/auth", () => {
    Object.values(AUTH_ENDPOINTS).forEach((ep) => {
      expect(ep).toMatch(/^\/api\/auth/);
    });
  });
});

/* =========================================================
   AUTH_COOKIE_NAME
   ========================================================= */

describe("AUTH_COOKIE_NAME", () => {
  it("is a non-empty string", () => {
    expect(AUTH_COOKIE_NAME).toBeTruthy();
    expect(typeof AUTH_COOKIE_NAME).toBe("string");
  });
});

/* =========================================================
   AUTH_CONFIG
   ========================================================= */

describe("AUTH_CONFIG", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns apiUrl from env when set", async () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com";
    const { AUTH_CONFIG } = await import("../constants/auth.endpoints");
    expect(AUTH_CONFIG.apiUrl).toBe("https://api.example.com");
  });

  it("falls back to localhost when env is not set", async () => {
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    const { AUTH_CONFIG } = await import("../constants/auth.endpoints");
    expect(AUTH_CONFIG.apiUrl).toBe("http://localhost:3000");
  });

  it("returns cookieName from env when set", async () => {
    process.env.NEXT_PUBLIC_AUTH_TOKEN = "my_custom_cookie";
    const { AUTH_CONFIG } = await import("../constants/auth.endpoints");
    expect(AUTH_CONFIG.cookieName).toBe("my_custom_cookie");
  });

  it("falls back to AUTH_COOKIE_NAME when env is not set", async () => {
    delete process.env.NEXT_PUBLIC_AUTH_TOKEN;
    const { AUTH_CONFIG } = await import("../constants/auth.endpoints");
    expect(AUTH_CONFIG.cookieName).toBe(AUTH_COOKIE_NAME);
  });
});
