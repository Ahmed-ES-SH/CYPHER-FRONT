import { globalRequest } from "@/app/helpers/globalRequest";
import type {
  LoginRequest,
  LoginResponse,
  CurrentUserResponse,
  MessageResponse,
  SendResetPasswordRequest,
  VerifyResetTokenRequest,
  VerifyTokenResponse,
  ResetPasswordRequest,
  AuthUser,
} from "./auth.types";

/* ======================
   Constants
====================== */

export const AUTH_ROUTES = {
  LOGIN: "/signin",
  HOME: "/",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forget-password",
  RESET_PASSWORD: "/reset-password",
} as const;

export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  CURRENT_USER: "/api/auth/current-user",
  VERIFY_EMAIL: "/api/auth/verify-email",
  RESET_PASSWORD_SEND: "/api/auth/reset-password/send",
  RESET_PASSWORD_VERIFY: "/api/auth/reset-password/verify",
  RESET_PASSWORD: "/api/auth/reset-password",
  GOOGLE: "/api/auth/google",
} as const;

export const AUTH_COOKIE_NAME = "cypher_auth_token";
export const AUTH_SESSION_STALE_TIME = 5 * 60 * 1000;
export const AUTH_TOKEN_MAX_AGE = 5 * 24 * 60 * 60 * 1000;

export const AUTH_ERRORS: Record<string, string> = {
  "Invalid email or password": "Invalid email or password",
  "You need to verify your email first":
    "Please verify your email. A new verification link has been sent.",
  "Invalid or expired token": "This link has expired. Please request a new one.",
  "Authentication cookie not found": "Please log in again.",
  "This token has been revoked": "Session revoked. Please log in again.",
};

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export function getAuthConfig() {
  return {
    apiUrl: process.env.NEXT_PUBLIC_BACK_END_URL ?? "http://localhost:3000",
    cookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE ?? "sanad_auth_token",
  };
}

/* ======================
   Unauthorized Callback
====================== */

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

/* ======================
   Global Request Wrapper
====================== */

async function authRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    if (res.statusCode === 401 && onUnauthorized) {
      onUnauthorized();
    }
    throw { message: res.message, status: res.statusCode };
  }
  return res.data as TResult;
}

/* ======================
   API Functions
====================== */

export async function loginApi(dto: LoginRequest): Promise<LoginResponse> {
  return authRequest<LoginResponse>(AUTH_ENDPOINTS.LOGIN, "POST", dto);
}

export async function logoutApi(): Promise<void> {
  await authRequest(AUTH_ENDPOINTS.LOGOUT, "POST");
}

export async function getCurrentUserApi(): Promise<CurrentUserResponse> {
  return authRequest<CurrentUserResponse>(AUTH_ENDPOINTS.CURRENT_USER);
}

export async function verifyEmailApi(token: string): Promise<MessageResponse> {
  return authRequest<MessageResponse>(AUTH_ENDPOINTS.VERIFY_EMAIL, "POST", { token });
}

export async function sendResetPasswordApi(
  dto: SendResetPasswordRequest,
): Promise<MessageResponse> {
  return authRequest<MessageResponse>(AUTH_ENDPOINTS.RESET_PASSWORD_SEND, "POST", dto);
}

export async function verifyResetTokenApi(
  dto: VerifyResetTokenRequest,
): Promise<VerifyTokenResponse> {
  return authRequest<VerifyTokenResponse>(AUTH_ENDPOINTS.RESET_PASSWORD_VERIFY, "POST", dto);
}

export async function resetPasswordApi(
  dto: ResetPasswordRequest,
): Promise<MessageResponse> {
  return authRequest<MessageResponse>(AUTH_ENDPOINTS.RESET_PASSWORD, "POST", dto);
}

/* ======================
   Auth Services
====================== */

let initializationPromise: Promise<void> | null = null;

export async function handleLogin(dto: LoginRequest): Promise<AuthUser> {
  const { useAuthStore } = await import("./auth.store");
  useAuthStore.getState().setLoading("login", true);
  try {
    const { user } = await loginApi(dto);
    useAuthStore.getState().setUser(user);
    return user;
  } finally {
    useAuthStore.getState().setLoading("login", false);
  }
}

export async function handleLogout(): Promise<void> {
  const { useAuthStore } = await import("./auth.store");
  useAuthStore.getState().setLoading("logout", true);
  try {
    await logoutApi();
    useAuthStore.getState().reset();
  } finally {
    useAuthStore.getState().setLoading("logout", false);
  }
}

export async function initializeSession(): Promise<void> {
  const { useAuthStore } = await import("./auth.store");
  const state = useAuthStore.getState();

  if (state.isInitialized || state.isLoading.session) return;
  if (initializationPromise) return initializationPromise;

  state.setLoading("session", true);

  initializationPromise = (async () => {
    try {
      const user = await getCurrentUserApi();
      useAuthStore.getState().setUser(user);
    } catch {
      useAuthStore.getState().reset();
    } finally {
      useAuthStore.getState().setLoading("session", false);
      useAuthStore.getState().setInitialized();
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}
