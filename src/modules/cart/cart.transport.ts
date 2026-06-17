import type { CartApiError } from "./cart.types";
import { useCartAuthStore } from "./cart-auth.store";

/* =========================================================
   Transport Interface
   ========================================================= */

export interface Transport {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, body?: unknown): Promise<T>;
  patch<T>(endpoint: string, body?: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

/* =========================================================
   Auth Adapter
   ========================================================= */

export interface AuthAdapter {
  userId: string | null;
  isAuthenticated: boolean;
  getToken?: () => Promise<string | null>;
}

const defaultAuthAdapter: AuthAdapter = {
  userId: null,
  isAuthenticated: false,
};

let activeAuthAdapter: AuthAdapter = defaultAuthAdapter;

export function setAuthAdapter(adapter: AuthAdapter) {
  activeAuthAdapter = adapter;
  // Sync reactive Zustand store so React components re-render
  useCartAuthStore.getState().setCartAuth(adapter.isAuthenticated, adapter.userId);
}

export function getActiveAuthAdapter(): AuthAdapter {
  return activeAuthAdapter;
}

/* =========================================================
   Storage Adapter
   ========================================================= */

export interface StorageAdapter {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
}

function createDefaultStorageAdapter(): StorageAdapter {
  return {
    getItem: <T>(key: string): T | null => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    },
    setItem: <T>(key: string, value: T): void => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* quota exceeded */
      }
    },
    removeItem: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    },
  };
}

let activeStorageAdapter: StorageAdapter | null = null;

function getStorageAdapter(): StorageAdapter {
  if (!activeStorageAdapter) {
    activeStorageAdapter = createDefaultStorageAdapter();
  }
  return activeStorageAdapter;
}

export function setStorageAdapter(adapter: StorageAdapter) {
  activeStorageAdapter = adapter;
}

export function getActiveStorageAdapter(): StorageAdapter {
  return getStorageAdapter();
}

/* =========================================================
   Redirect Adapter
   ========================================================= */

export interface RedirectAdapter {
  to(url: string): void;
  replace(url: string): void;
}

const ALLOWED_REDIRECT_ORIGINS = [
  "https://checkout.stripe.com",
  typeof window !== "undefined" ? window.location.origin : "",
].filter(Boolean);

function isSafeRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_REDIRECT_ORIGINS.some((origin) => url.startsWith(origin));
  } catch {
    return false;
  }
}

const defaultRedirectAdapter: RedirectAdapter = {
  to: (url) => {
    if (!isSafeRedirectUrl(url)) {
      console.error(`[cart] Blocked unsafe redirect to: ${url}`);
      return;
    }
    window.location.href = url;
  },
  replace: (url) => {
    if (!isSafeRedirectUrl(url)) {
      console.error(`[cart] Blocked unsafe redirect to: ${url}`);
      return;
    }
    window.location.replace(url);
  },
};

let activeRedirectAdapter: RedirectAdapter = defaultRedirectAdapter;

export function setRedirectAdapter(adapter: RedirectAdapter) {
  activeRedirectAdapter = adapter;
}

export function getActiveRedirectAdapter(): RedirectAdapter {
  return activeRedirectAdapter;
}

/* =========================================================
   Error Normalization
   ========================================================= */

export function parseCartApiError(error: unknown): CartApiError {
  if (error && typeof error === "object" && "message" in error) {
    const err = error as Record<string, unknown>;
    return {
      message: (err.message as string) ?? "An unexpected error occurred",
      status: (err.status as number) ?? 500,
      path: err.path as string | undefined,
      timestamp: err.timestamp as string | undefined,
      errors: err.errors as Record<string, string[]> | undefined,
    };
  }
  return { message: "An unexpected error occurred", status: 500 };
}

export function parseCartFieldErrors(
  errors?: Record<string, string[]>,
): Record<string, string> {
  if (!errors) return {};
  const map: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    map[field] = messages[0] ?? "Invalid value";
  }
  return map;
}

/* =========================================================
   Default Fetch Transport
   ========================================================= */

function getBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  return "";
}

async function fetchRequest<TResult>(
  endpoint: string,
  method: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<TResult> {
  const baseUrl = getBaseUrl();
  const url = baseUrl + endpoint;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = await activeAuthAdapter.getToken?.();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify(body),
    credentials: "include",
    signal,
  });

  const contentType = response.headers.get("content-type") || "";
  let result: unknown;

  if (contentType.includes("application/json")) {
    result = await response.json();
  } else {
    result = await response.text();
  }

  if (!response.ok) {
    const errResult = result as Record<string, unknown> | null;
    throw {
      message: (errResult?.message as string) ?? (errResult?.error as string) ?? "Request failed",
      status: response.status,
      path: endpoint,
      timestamp: new Date().toISOString(),
      errors: errResult?.errors as Record<string, string[]> | undefined,
    } satisfies CartApiError;
  }

  return result as TResult;
}

export const defaultTransport: Transport = {
  get: <T>(endpoint: string) => fetchRequest<T>(endpoint, "GET"),
  post: <T>(endpoint: string, body?: unknown) =>
    fetchRequest<T>(endpoint, "POST", body),
  patch: <T>(endpoint: string, body?: unknown) =>
    fetchRequest<T>(endpoint, "PATCH", body),
  delete: <T>(endpoint: string) => fetchRequest<T>(endpoint, "DELETE"),
};

let activeTransport: Transport = defaultTransport;

export function setCartTransport(transport: Transport) {
  activeTransport = transport;
}

export function getActiveCartTransport(): Transport {
  return activeTransport;
}

/* =========================================================
   Transport Request Helper
   ========================================================= */

export async function transportRequest<TResult = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
  options?: { transport?: Transport; signal?: AbortSignal },
): Promise<TResult> {
  const t = options?.transport ?? activeTransport;
  switch (method) {
    case "GET":
      return t.get<TResult>(endpoint);
    case "POST":
      return t.post<TResult>(endpoint, body);
    case "PATCH":
      return t.patch<TResult>(endpoint, body);
    case "DELETE":
      return t.delete<TResult>(endpoint);
    default:
      return t.get<TResult>(endpoint);
  }
}
