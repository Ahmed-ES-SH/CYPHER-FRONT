export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  CURRENT_USER: "/api/auth/current-user",
  VERIFY_EMAIL: ({ token, email }: { token: string; email: string }) =>
    `/api/auth/verify-email?token=${token}&email=${email}` as const,
  RESET_PASSWORD_SEND: "/api/auth/reset-password/send",
  RESET_PASSWORD_VERIFY: "/api/auth/reset-password/verify",
  RESET_PASSWORD: "/api/auth/reset-password",
  GOOGLE: "/api/auth/google",
} as const;

export const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_TOKEN ?? "cypher_auth_token";
export const AUTH_SESSION_STALE_TIME = 5 * 60 * 1000;
export const AUTH_TOKEN_MAX_AGE = 5 * 24 * 60 * 60 * 1000;

export const AUTH_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000",
  cookieName: process.env.NEXT_PUBLIC_AUTH_TOKEN ?? AUTH_COOKIE_NAME,
} as const;

export function getAuthConfig() {
  return { ...AUTH_CONFIG };
}
