import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  USER_ENDPOINTS,
  registerApi,
  listUsersApi,
  getUserStatsApi,
  getUserByIdApi,
  updateUserApi,
  deleteUserApi,
} from "../api/user.api";
import type { CreateUserDto, UpdateUserDto } from "../types/user.types";
import { UserRole, UserStatus } from "../types/user.types";

// Mock globalRequest
vi.mock("@/app/helpers/globalRequest", () => ({
  globalRequest: vi.fn(),
}));

import { globalRequest } from "@/app/helpers/globalRequest";

/* =========================================================
   USER_ENDPOINTS
   ========================================================= */

describe("USER_ENDPOINTS", () => {
  it("defines REGISTER endpoint", () => {
    expect(USER_ENDPOINTS.REGISTER).toBe("/api/user");
  });

  it("defines LIST endpoint", () => {
    expect(USER_ENDPOINTS.LIST).toBe("/api/user");
  });

  it("defines STATS endpoint", () => {
    expect(USER_ENDPOINTS.STATS).toBe("/api/user/stats");
  });

  it("BY_ID interpolates id", () => {
    expect(USER_ENDPOINTS.BY_ID(42)).toBe("/api/user/42");
  });
});

/* =========================================================
   registerApi
   ========================================================= */

describe("registerApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls globalRequest with correct endpoint and body", async () => {
    const dto: CreateUserDto = {
      email: "test@example.com",
      password: "secret123",
      name: "Test User",
    };

    vi.mocked(globalRequest).mockResolvedValue({
      success: true,
      data: {
        id: 1,
        ...dto,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: false,
        isPremium: false,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      message: "Created",
      statusCode: 201,
    });

    const result = await registerApi(dto);

    expect(globalRequest).toHaveBeenCalledWith({
      endpoint: "/api/user",
      method: "POST",
      body: dto,
    });
    expect(result.email).toBe("test@example.com");
  });

  it("throws when globalRequest fails", async () => {
    vi.mocked(globalRequest).mockResolvedValue({
      success: false,
      message: "Email already exists",
      statusCode: 409,
    });

    await expect(registerApi({ email: "t@t.com", password: "123456" })).rejects.toThrow();
  });
});

/* =========================================================
   listUsersApi
   ========================================================= */

describe("listUsersApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls without query when no params", async () => {
    vi.mocked(globalRequest).mockResolvedValue({
      success: true,
      message: "OK",
      statusCode: 200,
      data: { data: [], total: 0, page: 1, perPage: 10, lastPage: 0 },
    });

    await listUsersApi();
    expect(globalRequest).toHaveBeenCalledWith({
      endpoint: "/api/user",
      method: "GET",
    });
  });

  it("appends query string when params provided", async () => {
    vi.mocked(globalRequest).mockResolvedValue({
      success: true,
      message: "OK",
      statusCode: 200,
      data: { data: [], total: 0, page: 1, perPage: 10, lastPage: 0 },
    });

    await listUsersApi({ role: "admin", page: "2" });
    expect(globalRequest).toHaveBeenCalledWith({
      endpoint: "/api/user?role=admin&page=2",
      method: "GET",
    });
  });
});

/* =========================================================
   getUserStatsApi
   ========================================================= */

describe("getUserStatsApi", () => {
  it("calls globalRequest with stats endpoint", async () => {
    vi.mocked(globalRequest).mockResolvedValue({
      success: true,
      message: "OK",
      statusCode: 200,
      data: { adminsNumber: 2, verifiedUsersNumber: 50, unverifiedUsersNumber: 10 },
    });

    const stats = await getUserStatsApi();
    expect(globalRequest).toHaveBeenCalledWith({
      endpoint: "/api/user/stats",
      method: "GET",
    });
    expect(stats.adminsNumber).toBe(2);
  });
});

/* =========================================================
   getUserByIdApi
   ========================================================= */

describe("getUserByIdApi", () => {
  it("calls with correct endpoint", async () => {
    vi.mocked(globalRequest).mockResolvedValue({
      success: true,
      message: "OK",
      statusCode: 200,
      data: { id: 7, email: "user@example.com", role: UserRole.USER, status: UserStatus.ACTIVE },
    });

    const user = await getUserByIdApi(7);
    expect(globalRequest).toHaveBeenCalledWith({
      endpoint: "/api/user/7",
      method: "GET",
    });
    expect(user.id).toBe(7);
  });
});

/* =========================================================
   updateUserApi
   ========================================================= */

describe("updateUserApi", () => {
  it("calls with PATCH method and body", async () => {
    const dto: UpdateUserDto = { name: "Updated Name" };
    vi.mocked(globalRequest).mockResolvedValue({
      success: true,
      message: "OK",
      statusCode: 200,
      data: { id: 1, name: "Updated Name", email: "u@u.com", role: UserRole.USER, status: UserStatus.ACTIVE },
    });

    const result = await updateUserApi(1, dto);
    expect(globalRequest).toHaveBeenCalledWith({
      endpoint: "/api/user/1",
      method: "PATCH",
      body: dto,
    });
    expect(result.name).toBe("Updated Name");
  });
});

/* =========================================================
   deleteUserApi
   ========================================================= */

describe("deleteUserApi", () => {
  it("calls with DELETE method", async () => {
    vi.mocked(globalRequest).mockResolvedValue({
      success: true,
      data: null,
      message: "Deleted",
      statusCode: 200,
    });

    await deleteUserApi(5);
    expect(globalRequest).toHaveBeenCalledWith({
      endpoint: "/api/user/5",
      method: "DELETE",
    });
  });
});
