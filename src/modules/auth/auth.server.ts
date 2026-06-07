"use server";

import { globalRequest } from "@/app/helpers/globalRequest";
import { AUTH_ENDPOINTS } from "./constants";
import { AuthError } from "./auth.types";
import type {
  LoginRequest,
  LoginResponse,
} from "./auth.types";

export async function loginApi(dto: LoginRequest): Promise<LoginResponse> {
  const res = await globalRequest<LoginRequest, LoginResponse>({
    endpoint: AUTH_ENDPOINTS.LOGIN,
    method: "POST",
    body: dto,
  });

  if (!res.success) {
    throw new AuthError(res.message ?? "Auth error", res.statusCode ?? 0, res.errors);
  }

  const raw = res.data as any;

  console.log("[loginApi] raw response:", JSON.stringify(raw, null, 2));
  console.log("[loginApi] raw keys:", Object.keys(raw));

  // Some backends wrap in { data: { user, access_token } }, others return directly
  const unwrapped = raw?.data?.access_token ? raw.data : raw;
  const user = unwrapped?.user ?? raw?.user;
  const access_token = unwrapped?.access_token ?? raw?.data?.access_token ?? raw?.access_token;

  console.log("[loginApi] extracted access_token:", access_token ? `${access_token.slice(0, 20)}...` : undefined);
  console.log("[loginApi] extracted access_token length:", access_token?.length);

  const { setAuthCookie } = await import("@/app/helpers/session");
  await setAuthCookie(access_token);

  console.log("[loginApi] cookie set successfully");

  return { user, access_token } as LoginResponse;
}

export async function logoutApi(): Promise<void> {
  const { getAuthCookie, deleteAuthCookie } = await import("@/app/helpers/session");
  const token = await getAuthCookie();

  const res = await globalRequest({
    endpoint: AUTH_ENDPOINTS.LOGOUT,
    method: "POST",
    body: { token },
  });

  if (!res.success) {
    throw new AuthError(res.message ?? "Logout failed", res.statusCode ?? 0, res.errors);
  }

  await deleteAuthCookie();
}
