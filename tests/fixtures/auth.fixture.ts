import type { AuthUser, UserRole } from "../../src/modules/auth/auth.types";

export const TEST_USER: AuthUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  avatar: "/images/user.png",
  role: "user",
};

export const TEST_ADMIN: AuthUser = {
  id: 2,
  name: "Admin User",
  email: "admin@example.com",
  avatar: "/images/user.png",
  role: "admin",
};

export const API_URL = "http://localhost:3000";

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  LOGOUT: `${API_URL}/auth/logout`,
  CURRENT_USER: `${API_URL}/auth/current-user`,
  VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
  RESET_PASSWORD_SEND: `${API_URL}/auth/reset-password/send`,
  RESET_PASSWORD_VERIFY: `${API_URL}/auth/reset-password/verify`,
  RESET_PASSWORD: `${API_URL}/auth/reset-password`,
  GOOGLE: `${API_URL}/auth/google`,
};
