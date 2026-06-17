import type { AuthUser } from "../../src/modules/auth/auth.types";
import { UserRole, UserStatus } from "../../src/modules/user/types/user.types";

export const TEST_USER: AuthUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  avatar: "/images/user.png",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  isEmailVerified: true,
  isPremium: false,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-06-01T00:00:00Z",
};

export const TEST_ADMIN: AuthUser = {
  id: 2,
  name: "Admin User",
  email: "admin@example.com",
  avatar: "/images/user.png",
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  isEmailVerified: true,
  isPremium: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2025-06-01T00:00:00Z",
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
