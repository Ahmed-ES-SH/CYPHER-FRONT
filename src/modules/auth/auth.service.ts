import { loginApi, logoutApi } from "./auth.server";
import { getCurrentUserApi } from "./auth.api";
import { useAuthStore } from "./auth.store";
import type { LoginRequest, AuthUser } from "./auth.types";

let initializationPromise: Promise<void> | null = null;

export async function handleLogin(dto: LoginRequest): Promise<AuthUser> {
  const { user } = await loginApi(dto);
  useAuthStore.getState().setUser(user);
  return user;
}

export async function handleLogout(): Promise<void> {
  await logoutApi();
  useAuthStore.getState().reset();
}

export async function initializeSession(): Promise<void> {
  const state = useAuthStore.getState();

  if (state.isInitialized) return;
  if (initializationPromise) return initializationPromise;

  // Set loading BEFORE any await to prevent race conditions
  state.setLoading("session", true);

  initializationPromise = getCurrentUserApi()
    .then((user) => {
      useAuthStore.getState().setUser(user);
    })
    .catch(() => {
      useAuthStore.getState().clearUser();
    })
    .finally(() => {
      useAuthStore.getState().setLoading("session", false);
      useAuthStore.getState().setInitialized();
      initializationPromise = null;
    });

  return initializationPromise;
}
