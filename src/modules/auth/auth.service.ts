import { loginApi, logoutApi } from "./auth.server";
import { getCurrentUserApi } from "./auth.api";
import { useAuthStore } from "./auth.store";
import type { LoginRequest, AuthUser } from "./auth.types";

let initializationPromise: Promise<void> | null = null;

export async function handleLogin(dto: LoginRequest): Promise<AuthUser> {
  const loginRes = await loginApi(dto);
  const { user: partialUser } = loginRes;

  console.log("[handleLogin] loginApi user (JWT payload):", JSON.stringify(partialUser, null, 2));

  // Set partial user (JWT payload) immediately so the UI can react
  useAuthStore.getState().setUser(partialUser);

  // Hydrate store with the full user profile from current-user endpoint
  try {
    const fullUser = await getCurrentUserApi();
    console.log("[handleLogin] full user from current-user:", JSON.stringify(fullUser, null, 2));
    useAuthStore.getState().setUser(fullUser);
    return fullUser;
  } catch (err) {
    console.warn("[handleLogin] failed to fetch full user, keeping partial:", err);
    return partialUser;
  }
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
