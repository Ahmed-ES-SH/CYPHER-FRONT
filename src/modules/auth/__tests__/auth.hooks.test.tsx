import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useAuth,
  useLogin,
  useLogout,
  useSession,
  useResetPassword,
} from "../auth.hooks";
import { useAuthStore } from "../auth.store";
import * as api from "../auth.api";
import * as service from "../auth.service";
import type {
  AuthUser,
  LoginRequest,
  VerifyResetTokenRequest,
  ResetPasswordRequest,
} from "../auth.types";
import { UserRole, UserStatus } from "../../user/types/user.types";

/* =========================================================
   Test setup helpers
   ========================================================= */

const mockUser: AuthUser = {
  id: 1,
  name: "John Doe",
  email: "john@test.com",
  avatar: "/avatar.png",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  isEmailVerified: true,
  isPremium: false,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-06-01T00:00:00Z",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  useAuthStore.getState().reset();
});

/* =========================================================
   useAuth
   ========================================================= */

describe("useAuth", () => {
  it("returns default unauthenticated state", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isReady).toBe(false);
  });

  it("returns authenticated state when user is set in store", () => {
    useAuthStore.getState().setUser(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("returns isReady when initialized and not loading session", () => {
    useAuthStore.getState().setInitialized();

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isReady).toBe(true);
  });
});

/* =========================================================
   useLogin
   ========================================================= */

describe("useLogin", () => {
  const loginDto: LoginRequest = {
    email: "john@test.com",
    password: "password123",
  };

  it("calls handleLogin and succeeds", async () => {
    const spy = vi.spyOn(service, "handleLogin").mockResolvedValue(mockUser);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.login(loginDto);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("surfaces error when login fails", async () => {
    vi.spyOn(service, "handleLogin").mockRejectedValue(
      new Error("Invalid credentials"),
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    result.current.login(loginDto).catch(() => {});

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.isSuccess).toBe(false);
  });
});

/* =========================================================
   useLogout
   ========================================================= */

describe("useLogout", () => {
  it("calls handleLogout on success", async () => {
    const spy = vi.spyOn(service, "handleLogout").mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    result.current.logout();

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
  });

  it("surfaces error when logout fails", async () => {
    vi.spyOn(service, "handleLogout").mockRejectedValue(
      new Error("Logout failed"),
    );

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    result.current.logout().catch(() => {});

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error?.message).toBe("Logout failed");
  });
});

/* =========================================================
   useResetPassword
   ========================================================= */

describe("useResetPassword", () => {
  describe("send", () => {
    it("calls sendResetPasswordApi and succeeds", async () => {
      const spy = vi
        .spyOn(api, "sendResetPasswordApi")
        .mockResolvedValue({ message: "Email sent" });

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      result.current.send.mutate({ email: "john@test.com" });

      await waitFor(() => expect(result.current.send.isSuccess).toBe(true));
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("surfaces error when send fails", async () => {
      vi.spyOn(api, "sendResetPasswordApi").mockRejectedValue(
        new Error("User not found"),
      );

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      result.current.send.mutate({ email: "unknown@test.com" });

      await waitFor(() => expect(result.current.send.isError).toBe(true));
    });
  });

  describe("verify", () => {
    const verifyDto: VerifyResetTokenRequest = {
      token: "reset-token-123",
      email: "john@test.com",
    };

    it("calls verifyResetTokenApi and succeeds", async () => {
      const spy = vi
        .spyOn(api, "verifyResetTokenApi")
        .mockResolvedValue({ token: "new-token", email: "john@test.com" });

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      result.current.verify.mutate(verifyDto);

      await waitFor(() => expect(result.current.verify.isSuccess).toBe(true));
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("surfaces error when token is invalid", async () => {
      vi.spyOn(api, "verifyResetTokenApi").mockRejectedValue(
        new Error("Invalid or expired token"),
      );

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      result.current.verify.mutate(verifyDto);

      await waitFor(() => expect(result.current.verify.isError).toBe(true));
    });
  });

  describe("reset", () => {
    const resetDto: ResetPasswordRequest = {
      token: "valid-token",
      password: "newPassword123",
      passwordConfirmation: "newPassword123",
    };

    it("calls resetPasswordApi and succeeds", async () => {
      const spy = vi
        .spyOn(api, "resetPasswordApi")
        .mockResolvedValue({ message: "Password reset successfully" });

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      result.current.reset.mutate(resetDto);

      await waitFor(() => expect(result.current.reset.isSuccess).toBe(true));
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("surfaces error when passwords don't match on backend", async () => {
      vi.spyOn(api, "resetPasswordApi").mockRejectedValue(
        new Error("Passwords do not match"),
      );

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      result.current.reset.mutate({
        ...resetDto,
        passwordConfirmation: "differentPassword",
      });

      await waitFor(() => expect(result.current.reset.isError).toBe(true));
    });
  });

  it("sets resetPassword loading flag during mutations via onMutate/onSettled", async () => {
    vi.spyOn(api, "sendResetPasswordApi").mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ message: "Sent" }), 50),
        ),
    );

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    const promise = result.current.send.mutateAsync({
      email: "john@test.com",
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await promise;
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

/* =========================================================
   useSession
   ========================================================= */

describe("useSession", () => {
  it("initializes auth state on mount", async () => {
    vi.spyOn(service, "initializeSession").mockImplementation(async () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setInitialized();
    });

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.user).toEqual(mockUser);
  });

  it("returns auth state after successful session check", async () => {
    vi.spyOn(service, "initializeSession").mockImplementation(async () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setInitialized();
    });

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isInitialized).toBe(true));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("returns unauthenticated state when session check fails", async () => {
    vi.spyOn(service, "initializeSession").mockImplementation(async () => {
      useAuthStore.getState().clearUser();
      useAuthStore.getState().setInitialized();
    });

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isInitialized).toBe(true));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
