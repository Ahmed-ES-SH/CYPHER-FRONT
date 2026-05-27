import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth.store";

beforeEach(() => {
  useAuthStore.getState().reset();
});

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
    expect(loading.resetPassword).toBe(false);
  });
});

/* =========================================================
   setUser
   ========================================================= */

describe("setUser", () => {
  it("sets user and marks as authenticated", () => {
    const user = {
      id: 1,
      name: "John Doe",
      email: "john@test.com",
      avatar: "/avatar.png",
      role: "user" as const,
    };

    useAuthStore.getState().setUser(user);

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("clears user and marks as not authenticated when null", () => {
    useAuthStore.getState().setUser({
      id: 1,
      name: "John",
      email: "john@test.com",
      avatar: "/avatar.png",
      role: "user",
    });

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
    expect(useAuthStore.getState().isLoading.resetPassword).toBe(false);
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
    useAuthStore.getState().setUser({
      id: 1,
      name: "John",
      email: "john@test.com",
      avatar: "/avatar.png",
      role: "admin",
    });
    useAuthStore.getState().setInitialized();
    useAuthStore.getState().setLoading("login", true);

    useAuthStore.getState().reset();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isInitialized).toBe(false);
    expect(useAuthStore.getState().isLoading.login).toBe(false);
  });
});
