export { useAuth, useSession, useLogin, useLogout, useResetPassword } from "./auth.hooks";

export type {
  AuthUser,
  AuthLoading,
  AuthState,
  LoginRequest,
  LoginResponse,
  CurrentUserResponse,
  MessageResponse,
  SendResetPasswordRequest,
  VerifyResetTokenRequest,
  VerifyTokenResponse,
  ResetPasswordRequest,
  AuthApiError,
  UserRole,
} from "./auth.types";

export {
  AUTH_ROUTES,
  AUTH_ENDPOINTS,
  AUTH_COOKIE_NAME,
  AUTH_SESSION_STALE_TIME,
  AUTH_TOKEN_MAX_AGE,
  AUTH_ERRORS,
  authKeys,
  getAuthConfig,
  setOnUnauthorized,
  loginApi,
  logoutApi,
  getCurrentUserApi,
  verifyEmailApi,
  sendResetPasswordApi,
  verifyResetTokenApi,
  resetPasswordApi,
  handleLogin,
  handleLogout,
  initializeSession,
} from "./auth.api";

export { useAuthStore } from "./auth.store";
