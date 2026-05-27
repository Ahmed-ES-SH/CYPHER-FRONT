import { describe, it, expect } from "vitest";
import { formatUserName, getInitials, isAdmin } from "../services/user.service";
import { UserRole, UserStatus } from "../types/user.types";
import type { User } from "../types/user.types";

const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: "john@example.com",
  name: "John Doe",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  isEmailVerified: true,
  isPremium: false,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  avatar: undefined,
  ...overrides,
});

/* =========================================================
   formatUserName
   ========================================================= */

describe("formatUserName", () => {
  it("returns name when user has a name", () => {
    expect(formatUserName(mockUser())).toBe("John Doe");
  });

  it("falls back to email local part when name is undefined", () => {
    expect(formatUserName(mockUser({ name: undefined }))).toBe("john");
  });

  it("falls back to email local part when name is empty", () => {
    expect(formatUserName(mockUser({ name: "" }))).toBe("john");
  });
});

/* =========================================================
   getInitials
   ========================================================= */

describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials(mockUser())).toBe("JD");
  });

  it("returns single initial for single-word name", () => {
    expect(getInitials(mockUser({ name: "Alice" }))).toBe("A");
  });

  it("returns up to 2 initials for multi-word names", () => {
    expect(getInitials(mockUser({ name: "John Michael Doe" }))).toBe("JM");
  });

  it("falls back to email prefix when name is missing", () => {
    expect(getInitials(mockUser({ name: undefined }))).toBe("J");
  });
});

/* =========================================================
   isAdmin
   ========================================================= */

describe("isAdmin", () => {
  it("returns true when user role is ADMIN", () => {
    expect(isAdmin(mockUser({ role: UserRole.ADMIN }))).toBe(true);
  });

  it("returns false when user role is USER", () => {
    expect(isAdmin(mockUser({ role: UserRole.USER }))).toBe(false);
  });
});
