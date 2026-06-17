import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth.store";
import { UserRole, UserStatus } from "../../user/types/user.types";

beforeEach(() => {
  useAuthStore.getState().reset();
});

const fullUser = {
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

/* =========================================================
   Initial State
   ========================================================= */

describe("initial state", () => {
  it("starts with null user", () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("starts as not authenticated", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("starts as not initialized", () => {
    expect(useAuthStore.getState().isInitialized).toBe(false);
  });

  it("starts with all loading flags false", () => {
    const loading = useAuthStore.getState().isLoading;
    expect(loading.session).toBe(false);
    expect(loading.login).toBe(false);
    expect(loading.logout).toBe(false);
  });
});

/* =========================================================
   setUser
   ========================================================= */

describe("setUser", () => {
  it("sets user and marks as authenticated", () => {
    useAuthStore.getState().setUser(fullUser);

    expect(useAuthStore.getState().user).toEqual(fullUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("clears user and marks as not authenticated when null", () => {
    useAuthStore.getState().setUser(fullUser);

    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

/* =========================================================
   setLoading
   ========================================================= */

describe("setLoading", () => {
  it("sets login loading to true", () => {
    useAuthStore.getState().setLoading("login", true);
    expect(useAuthStore.getState().isLoading.login).toBe(true);
  });

  it("sets login loading to false", () => {
    useAuthStore.getState().setLoading("login", true);
    useAuthStore.getState().setLoading("login", false);
    expect(useAuthStore.getState().isLoading.login).toBe(false);
  });

  it("does not affect other loading flags", () => {
    useAuthStore.getState().setLoading("login", true);

    expect(useAuthStore.getState().isLoading.session).toBe(false);
    expect(useAuthStore.getState().isLoading.logout).toBe(false);
  });

  it("sets each loading key independently", () => {
    useAuthStore.getState().setLoading("session", true);
    useAuthStore.getState().setLoading("login", true);
    useAuthStore.getState().setLoading("logout", true);

    expect(useAuthStore.getState().isLoading.session).toBe(true);
    expect(useAuthStore.getState().isLoading.login).toBe(true);
    expect(useAuthStore.getState().isLoading.logout).toBe(true);
  });
});

/* =========================================================
   setInitialized
   ========================================================= */

describe("setInitialized", () => {
  it("sets isInitialized to true", () => {
    expect(useAuthStore.getState().isInitialized).toBe(false);

    useAuthStore.getState().setInitialized();

    expect(useAuthStore.getState().isInitialized).toBe(true);
  });

  it("is idempotent", () => {
    useAuthStore.getState().setInitialized();
    useAuthStore.getState().setInitialized();

    expect(useAuthStore.getState().isInitialized).toBe(true);
  });
});

/* =========================================================
   reset
   ========================================================= */

describe("reset", () => {
  it("resets all state to initial values", () => {
    useAuthStore.getState().setUser({ ...fullUser, role: UserRole.ADMIN });
    useAuthStore.getState().setInitialized();
    useAuthStore.getState().setLoading("login", true);

    useAuthStore.getState().reset();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isInitialized).toBe(false);
    expect(useAuthStore.getState().isLoading.login).toBe(false);
  });
});

/* =========================================================
   clearUser
   ========================================================= */

describe("clearUser", () => {
  it("clears user and sets authenticated to false, but keeps initialized status", () => {
    useAuthStore.getState().setUser(fullUser);
    useAuthStore.getState().setInitialized();

    useAuthStore.getState().clearUser();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });
});

