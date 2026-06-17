import { globalRequest } from "@/app/helpers/globalRequest";
import { AUTH_ENDPOINTS } from "./constants";
import { AuthError } from "./auth.types";
import type {
  CurrentUserResponse,
  MessageResponse,
  SendResetPasswordRequest,
  VerifyResetTokenRequest,
  VerifyTokenResponse,
  ResetPasswordRequest,
} from "./auth.types";

/* ======================
   Unauthorized Callback
   ====================== */

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: (() => void) | null) {
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
    throw new AuthError(
      res.message ?? "Auth error",
      res.statusCode ?? 0,
      res.errors
    );
  }
  return res.data as TResult;
}

/* ======================
   API Functions
   ====================== */

export async function getCurrentUserApi(): Promise<CurrentUserResponse> {
  const result = await authRequest<any>(AUTH_ENDPOINTS.CURRENT_USER);
  console.log("[getCurrentUserApi] raw result:", JSON.stringify(result, null, 2));
  // Backend wraps user in { data: { ... } } — unwrap if present
  const user = result?.data ?? result;
  return user as CurrentUserResponse;
}

export async function verifyEmailApi(token: string): Promise<MessageResponse> {
  return authRequest<MessageResponse>(AUTH_ENDPOINTS.VERIFY_EMAIL(token), "GET");
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
