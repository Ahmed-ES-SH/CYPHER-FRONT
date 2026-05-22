export type UserRole = "user" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface AuthLoading {
  session: boolean;
  login: boolean;
  logout: boolean;
  resetPassword: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: AuthLoading;
  isInitialized: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (key: keyof AuthLoading, value: boolean) => void;
  setInitialized: () => void;
  reset: () => void;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  access_token: string;
}

export type CurrentUserResponse = AuthUser;

export interface MessageResponse {
  message: string;
}

export interface SendResetPasswordRequest {
  email: string;
}

export interface VerifyResetTokenRequest {
  token: string;
  email?: string;
}

export interface VerifyTokenResponse {
  token: string;
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
