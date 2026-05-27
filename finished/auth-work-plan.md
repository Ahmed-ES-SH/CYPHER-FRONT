# Auth Module — Frontend Implementation Work Plan

> **Stack:** Next.js 16 · React 19 · TypeScript · Zustand · TanStack React Query · Axios  
> **Auth:** httpOnly cookie (frontend NEVER touches the token)  
> **Architecture:** Feature-first, portable, lightweight, frontend-only, production-ready

---

## Table of Contents

1. [Current Problems & Solutions](#1-current-problems--solutions)
2. [Target Architecture](#2-target-architecture)
3. [Layer Responsibilities](#3-layer-responsibilities)
4. [File Responsibilities](#4-file-responsibilities)
5. [Dependency Flow](#5-dependency-flow)
6. [Auth Lifecycle](#6-auth-lifecycle)
7. [Phase Breakdown](#7-phase-breakdown)
8. [Anti-Patterns & Best Practices](#8-anti-patterns--best-practices)
9. [Portability Strategy](#9-portability-strategy)
10. [Implementation Order](#10-implementation-order)

---

## 1. Current Problems & Solutions

### Problem 1: Frontend Touches httpOnly Cookie

**Current:** `getAuthToken()`, `deleteAuthToken()`, `logoutApi({ token })` — reads/stores/sends the token on the frontend. This completely breaks httpOnly cookie security.

**Solution:** Frontend NEVER touches the token. At all. Period.

| Violation                           | Fix                                                        |
| ----------------------------------- | ---------------------------------------------------------- |
| `getAuthToken()`                    | Delete. Frontend cannot read httpOnly cookies.             |
| `deleteAuthToken()`                 | Delete. Backend clears the cookie on logout.               |
| `logoutApi({ token })`              | Change to `logoutApi()` — no params. Backend reads cookie. |
| Callback route `/api/auth/callback` | Delete. Backend sets cookie directly in login response.    |
| JWT parsing / decoding              | Never do this. Frontend has no access to the token.        |

**Correct login flow:**

1. `POST /auth/login { email, password }`
2. Backend validates → sets `Set-Cookie: sanad_auth_token=...` (httpOnly, secure, sameSite)
3. Response body: `{ user: { id, email, role, name, avatar } }`
4. Frontend stores ONLY `user` in Zustand

**Correct logout flow:**

1. `POST /auth/logout` — no body, cookie sent automatically
2. Backend blacklists token, clears cookie
3. Frontend clears Zustand state + React Query cache

---

### Problem 2: Store Contains Business Logic

**Current:** Mixes state + HTTP calls + orchestration inside Zustand store.

**Solution:** Store is pure state ONLY.

```
Store ALLOWED:                Store FORBIDDEN:
  user                          API calls
  isAuthenticated               Redirects
  loading state                 Business logic
  isInitialized                 Async orchestration
  pure setters
```

---

### Problem 3: Single Global Loading State

**Current:** One `isLoading` boolean for everything → collisions between login, logout, session check, password reset.

**Solution:** Granular loading with separate flags:

```typescript
interface AuthLoading {
  session: boolean;
  login: boolean;
  logout: boolean;
  resetPassword: boolean;
}
```

Each action sets only its own flag. No collisions.

---

### Problem 4: Auth Logic Coupled to Project Structure

**Current:** Dependencies on navbar, dashboard, specific routes, page names.

**Solution:** Auth module knows NOTHING about the consuming app. The only coupling point is `auth.routes.ts` — a single file with URL constants that gets edited per project.

---

### Problem 5: Scattered File Structure

**Current:** Auth logic spread across `app/store/`, `app/hooks/`, `app/helpers/`, `app/api/`, `app/components/`.

**Solution:** Every auth file lives under `src/modules/auth/`. One folder. Clear ownership.

---

### Problem 6: Callback Route for Cookie Handling

**Current:** A `/api/auth/callback` Next.js API route that encrypts and stores the token.

**Solution:** Delete it. The backend sets the httpOnly cookie directly in the login response. No extra network hop. No encrypted token hopping through frontend.

---

### Problem 7: Auth Initialization Race Conditions

**Current:** Risk of duplicate `initializeSession()` calls, React Strict Mode double execution, flickering during refresh.

**Solution:**

- `isInitialized` flag in store prevents duplicate runs
- The session hook guards against Strict Mode by checking `isInitialized` before proceeding
- Expose `isReady = isInitialized && !loading.session` for stable hydration

---

### Problem 8: Redirects Inside Axios Interceptors

**Current:** Risk of `window.location` redirects inside interceptors causing redirect chaos, infinite loops, unpredictable navigation.

**Solution:** Axios interceptor does ONLY:

- Normalize error shape to `AuthApiError`
- Optionally clear auth state on 401 (via callback, not direct store import)

It NEVER:

- Redirects
- Navigates
- Manipulates UI

UI components react naturally through hooks + state changes.

---

## 2. Target Architecture

```
src/
└── modules/
    └── auth/
        ├── auth.api.ts       ← Axios instance + endpoints + raw HTTP calls
        ├── auth.hooks.ts     ← All React hooks (useAuth, useLogin, useLogout, useSession, useResetPassword)
        ├── auth.store.ts     ← Pure Zustand state only
        ├── auth.types.ts     ← All types, interfaces, enums
        └── index.ts          ← Public API barrel
```

**1 folder. 5 files. One job.**

---

## 3. Layer Responsibilities

```
┌──────────────────────────────────────────────────────────┐
│                     CONSUMERS                             │
│            (pages, components, layouts)                   │
│                                                           │
│  import { useAuth, useLogin } from "@/modules/auth"       │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    HOOKS LAYER                             │
│              auth.hooks.ts (all hooks)                    │
│                                                           │
│  WHAT IT DOES:                                            │
│  - React integration layer                                │
│  - Orchestrates React Query + store                       │
│  - Exposes clean frontend API                             │
│  - Handles React-specific concerns (effects, memoization) │
│                                                           │
│  WHAT IT NEVER DOES:                                      │
│  - Raw HTTP calls                                         │
│  - UI rendering                                           │
└──────┬──────────────────────┬────────────────────────────┘
       │                      │
       ▼                      ▼
┌──────────────────┐  ┌─────────────────────────────────────┐
│   STORE LAYER    │  │       API LAYER (in auth.api.ts)    │
│   auth.store.ts  │  │                                      │
│                  │  │  WHAT IT DOES:                       │
│  WHAT IT DOES:   │  │  - Axios instance config             │
│  - user          │  │  - Endpoint URL constants            │
│  - isAuthenticated│  │  - Raw HTTP requests                │
│  - loading state │  │  - withCredentials: true             │
│  - isInitialized │  │  - Error normalization               │
│  - pure setters  │  │  - Login/logout orchestration        │
│                  │  │  - Session lifecycle                 │
│  PURE STATE ONLY │  │                                      │
│  No HTTP calls.  │  │  WHAT IT NEVER DOES:                 │
│  No async logic. │  │  - State updates                     │
│  No side effects.│  │  - Redirects / UI logic              │
└──────────────────┘  └──────────────┬──────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────────────┐
                    │        BACKEND (NestJS)                 │
                    │  POST /auth/login   → Sets httpOnly     │
                    │  POST /auth/logout  → Clears cookie     │
                    │  GET  /auth/current-user → Returns user │
                    └─────────────────────────────────────────┘
```

---

## 4. File Responsibilities

### 4.1 `auth.api.ts` — Axios Instance + Endpoints + HTTP Functions + Services + Config + Constants

Single file containing everything needed for API communication and orchestration:

**Axios instance:**
```typescript
import axios from "axios";
import type { AuthConfig } from "./auth.types";

export function createAuthClient(config: AuthConfig) {
  const client = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  // Response interceptor normalizes errors — NEVER redirects
  client.interceptors.response.use(
    (res) => res,
    (error) => normalizeAuthError(error),
  );

  return client;
}
```

**Endpoint constants:**
```typescript
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  CURRENT_USER: "/auth/current-user",
  VERIFY_EMAIL: "/auth/verify-email",
  RESET_PASSWORD_SEND: "/auth/reset-password/send",
  RESET_PASSWORD_VERIFY: "/auth/reset-password/verify",
  RESET_PASSWORD: "/auth/reset-password",
  GOOGLE: "/auth/google",
} as const;
```

**Config:**
```typescript
export function getAuthConfig(): AuthConfig {
  return {
    apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000",
    cookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE ?? "sanad_auth_token",
  };
}
```

**Constants:**
```typescript
export const AUTH_COOKIE_NAME = "sanad_auth_token";
export const AUTH_SESSION_STALE_TIME = 5 * 60 * 1000;
export const AUTH_TOKEN_MAX_AGE = 5 * 24 * 60 * 60 * 1000;

export const AUTH_ERRORS: Record<string, string> = {
  "Invalid email or password": "Invalid email or password",
  "You need to verify your email first": "Please verify your email. A new verification link has been sent.",
  "Invalid or expired token": "This link has expired. Please request a new one.",
  "Authentication cookie not found": "Please log in again.",
};

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export const AUTH_ROUTES = {
  LOGIN: "/signin",
  HOME: "/",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forget-password",
  RESET_PASSWORD: "/reset-password",
} as const;
```

**Raw HTTP functions (pure, no state):**
```typescript
export function loginApi(dto: LoginRequest): Promise<LoginResponse>;
export function logoutApi(): Promise<void>;
export function getCurrentUserApi(): Promise<CurrentUserResponse>;
export function verifyEmailApi(token: string): Promise<MessageResponse>;
export function sendResetPasswordApi(dto: SendResetPasswordRequest): Promise<MessageResponse>;
export function verifyResetTokenApi(dto: VerifyResetTokenRequest): Promise<VerifyTokenResponse>;
export function resetPasswordApi(dto: ResetPasswordRequest): Promise<MessageResponse>;
```

**Service orchestration:**
```typescript
export async function handleLogin(dto: LoginRequest): Promise<AuthUser>;
export async function handleLogout(): Promise<void>;

let initializationPromise: Promise<void> | null = null;
export async function initializeSession(): Promise<void>;
```

### 4.2 `auth.store.ts` — Pure Zustand Store

```typescript
// PURE STATE. NO HTTP. NO ASYNC. NO SIDE EFFECTS.

interface AuthLoading {
  session: boolean;
  login: boolean;
  logout: boolean;
  resetPassword: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: AuthLoading;
  isInitialized: boolean;

  // Pure setters — only update state, nothing else
  setUser: (user: AuthUser | null) => void;
  setLoading: (key: keyof AuthLoading, value: boolean) => void;
  setInitialized: () => void;
  reset: () => void; // Clear everything (logout)
}

// Initial state:
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: {
    session: false,
    login: false,
    logout: false,
    resetPassword: false,
  },
  isInitialized: false,
};
```

### 4.3 `auth.hooks.ts` — All React Hooks

Single file containing all hooks:

```typescript
// --- useAuth: Expose auth state ---
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isLoading = useAuthStore((s) => s.isLoading);

  return {
    user,
    isAuthenticated,
    isInitialized,
    isLoading,
    isReady: isInitialized && !isLoading.session,
  };
}

// --- useSession: Session init hook (fires on mount) ---
export function useSession() {
  const { isInitialized } = useAuth();

  useEffect(() => {
    initializeSession();
  }, [isInitialized]);

  return useAuth();
}

// --- useLogin: Login mutation ---
export function useLogin() {
  const queryClient = useQueryClient();
  const loginLoading = useAuthStore((s) => s.isLoading.login);

  const mutation = useMutation({
    mutationFn: handleLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });

  return {
    login: mutation.mutateAsync,
    isLoading: loginLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// --- useLogout: Logout mutation ---
export function useLogout() {
  const queryClient = useQueryClient();
  const logoutLoading = useAuthStore((s) => s.isLoading.logout);

  const mutation = useMutation({
    mutationFn: handleLogout,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: logoutLoading,
    error: mutation.error,
  };
}

// --- useResetPassword: Reset password mutations ---
export function useResetPassword() {
  return {
    send: useMutation({ mutationFn: sendResetPasswordApi }),
    verify: useMutation({ mutationFn: verifyResetTokenApi }),
    reset: useMutation({ mutationFn: resetPasswordApi }),
  };
}
```

### 4.4 `auth.types.ts` — All Types

Single file containing:

- `AuthUser` — user object stored in Zustand
- `AuthLoading` — granular loading flags
- `AuthState` — Zustand store shape
- `AuthConfig` — runtime config shape
- `LoginRequest`, `SendResetPasswordRequest`, `VerifyResetTokenRequest`, `ResetPasswordRequest`
- `LoginResponse`, `CurrentUserResponse`, `MessageResponse`, `VerifyTokenResponse`
- `AuthApiError` — normalized error shape
- `UserRole` enum

### 4.5 `index.ts` — Public API Barrel

```typescript
export { useAuth, useSession, useLogin, useLogout, useResetPassword } from "./auth.hooks";
export type { AuthUser, AuthLoading, LoginRequest, AuthApiError } from "./auth.types";
export { AUTH_ROUTES } from "./auth.api";
```

---

## 5. Dependency Flow

```
index.ts (public API)
  │
  ├── auth.hooks.ts
  │     ├── auth.store.ts (selectors + setters)
  │     └── auth.api.ts (HTTP functions + service orchestration)
  │
  └── auth.types.ts → used across ALL layers

auth.api.ts → auth.types.ts, auth.store.ts (setters via getState)
auth.store.ts → auth.types.ts
```

---

## 6. Auth Lifecycle

### 6.1 App Start (Session Restore)

```
1. App mounts
2. Any component calls useSession()
3. Check: isInitialized === false → proceed
4. Set loading.session = true
5. GET /auth/current-user (cookie sent automatically)
   6a. 200 → setUser(response)
   6b. 401 → reset() (user stays null)
7. Set loading.session = false
8. Set isInitialized = true
9. App is ready: isReady === true
```

### 6.2 Login

```
1. User submits email + password
2. Component calls login(dto)
3. Set loading.login = true
4. POST /auth/login { email, password }
5. Backend validates, sets httpOnly cookie (Set-Cookie header)
6. Response: { user: { id, email, role, name, avatar } }
7. setUser(response.user)
8. queryClient.invalidateQueries({ queryKey: authKeys.all })
9. Set loading.login = false
```

### 6.3 Logout

```
1. User clicks logout
2. Component calls logout()
3. Set loading.logout = true
4. POST /auth/logout (no body, cookie sent automatically)
5. Backend blacklists token, clears cookie
6. reset() → user: null, isAuthenticated: false
7. queryClient.clear() → wipe ALL cached data
8. Set loading.logout = false
```

---

## 7. Phase Breakdown

### Phase 1 — Types + Store

| File                               | Action | Dependencies |
| ---------------------------------- | ------ | ------------ |
| `src/modules/auth/auth.types.ts`   | Create | None         |
| `src/modules/auth/auth.store.ts`   | Create | types        |

### Phase 2 — API Layer (+ Config, Constants, Services, Orchestration)

| File                             | Action | Dependencies |
| -------------------------------- | ------ | ------------ |
| `src/modules/auth/auth.api.ts`   | Create | types, store |

Contains: axios client, endpoints, config, constants, error messages, query keys, routes, raw HTTP functions, login/logout orchestration, session lifecycle.

### Phase 3 — Hooks Layer

| File                              | Action | Dependencies |
| --------------------------------- | ------ | ------------ |
| `src/modules/auth/auth.hooks.ts`  | Create | api, store   |

Contains ALL hooks in one file: useAuth, useSession, useLogin, useLogout, useResetPassword.

### Phase 4 — Module Assembly

| File                        | Action | Dependencies |
| --------------------------- | ------ | ------------ |
| `src/modules/auth/index.ts` | Create | hooks, types |

### Phase 7 — App Integration

| Step | What                         | Details                                           |
| ---- | ---------------------------- | ------------------------------------------------- |
| 1    | Add `QueryClientProvider`    | In root layout or ClientLayout                    |
| 2    | Call `useSession()`          | In a top-level client component                   |
| 3    | Rewire `SignInForm`          | Replace raw axios + local state with `useLogin()` |
| 4    | Add `LogoutButton` component | Use `useLogout()`                                 |
| 5    | Update `SocialLogin`         | Point to backend `/auth/google`                   |
| 6    | Update `SocialSignup`        | Same as SocialLogin                               |
| 7    | Create `middleware.ts`       | Server-side cookie check for protected routes     |
| 8    | Update navbar/user menu      | Use `useAuth()` for user state                    |

### Phase 8 — Cleanup

| Task                                    | Reason                             |
| --------------------------------------- | ---------------------------------- |
| Delete `app/store/useAuthStore.ts`      | Replaced by module store           |
| Delete `app/api/auth/logout/route.ts`   | Logout is direct to backend        |
| Delete `app/api/auth/callback/route.ts` | Backend sets cookie directly       |
| Clean up `constants/endpoints.ts`       | Module has its own endpoints       |
| Update imports across app               | Old store → `@/modules/auth` hooks |

---

## 8. Anti-Patterns & Best Practices

### Anti-Patterns (What NOT to do)

| #   | Anti-Pattern                            | Why It's Wrong                       | Correct Approach                            |
| --- | --------------------------------------- | ------------------------------------ | ------------------------------------------- |
| 1   | `getAuthToken()` reading cookie         | httpOnly cookies are invisible to JS | Never try to read it                        |
| 2   | `logoutApi({ token })` sending token    | Backend already reads cookie         | `logoutApi()` — no params                   |
| 3   | Token in localStorage                   | XSS vulnerability                    | httpOnly cookie only                        |
| 4   | Single `isLoading` boolean              | Collisions between actions           | Granular loading object                     |
| 5   | Store making HTTP calls                 | Breaks separation of concerns        | Service layer does orchestration            |
| 6   | Redirects inside axios interceptor      | Redirect chaos, infinite loops       | Interceptor normalizes errors only          |
| 7   | Auth module knowing page names          | Kills portability                    | `auth.routes.ts` is the only coupling point |
| 8   | Splitting logic into deep subdirectories | Unnecessary complexity, hurts portability | Flat 5-file structure keeps it simple |
| 9   | Provider wrappers for auth              | Unnecessary overhead                 | `useSession()` hook fires on mount          |
| 10  | Exposing internal files from `index.ts` | Leaks implementation                 | Export hooks + types only                   |

### Best Practices (What TO do)

| #   | Practice                   | Why                                          |
| --- | -------------------------- | -------------------------------------------- |
| 1   | Feature-first architecture | Single module ownership, clear boundaries    |
| 2   | Pure Zustand store         | Testable, predictable, no side effects       |
| 3   | Granular loading states    | No collisions, precise UI feedback           |
| 4   | React Query for async      | Caching, deduplication, invalidation         |
| 5   | Services for orchestration | Clean separation from React                  |
| 6   | Typed everything           | Catch errors at compile time                 |
| 7   | Strict public exports      | Clear API contract                           |
| 8   | Environment-driven config  | No hardcoded values                          |
| 9   | Single redirect file       | One edit when porting projects               |
| 10  | `isInitialized` guard      | Prevents race conditions, Strict Mode issues |

---

## 9. Portability Strategy

### Moving the Module to Another Project

```
1. COPY src/modules/auth/ → new-project/src/modules/auth/
2. EDIT auth.api.ts (getAuthConfig) → update apiUrl, routes
3. ENSURE dependencies exist:       → zustand, @tanstack/react-query, axios
4. ADD QueryClientProvider           → if not already in the app
5. IMPORT hooks:                    → import { useAuth, useLogin } from "@/modules/auth"
6. CALL useSession()                → in a top-level client component
```

### What Changes Per Project

| File                     | Always?   | What changes                      |
| ------------------------ | --------- | --------------------------------- |
| `auth.api.ts`            | Yes       | `apiUrl`, route paths             |
| `auth.types.ts`          | Sometimes | User object shape may differ      |

### What Never Changes

| File                 | Pattern is universal |
| -------------------- | -------------------- |
| `auth.store.ts`      | State pattern        |
| `auth.hooks.ts`      | Hook patterns        |
| `index.ts`           | Public API           |

---

## 10. Implementation Order

| Order | Phase                      | Effort             | Files                                     | Dependencies |
| ----- | -------------------------- | ------------------ | ----------------------------------------- | ------------ |
| 1     | Types + Store              | Low (2 files)      | `auth.types.ts`, `auth.store.ts`          | None         |
| 2     | API Layer                  | Low (1 file)       | `auth.api.ts`                             | Phase 1      |
| 3     | Hooks Layer                | Low (1 file)       | `auth.hooks.ts`                           | Phase 2      |
| 4     | Module Assembly            | Low (1 file)       | `index.ts`                                | Phase 3      |
| 5     | App Integration            | Medium (mult. files) | `ClientLayout.tsx`, `SignInForm.tsx`    | Phase 4      |
| 6     | Cleanup                    | Low (delete old)   | Old store, API routes, stale imports      | Phase 5      |

**Estimated total: 5 new files, ~5 modified files, ~4 deleted files.**

---

## File Tree (Final)

```
src/modules/auth/
├── auth.api.ts        # requests + endpoints
├── auth.hooks.ts      # all hooks
├── auth.store.ts      # auth state
├── auth.types.ts      # interfaces/types
└── index.ts
```

**1 folder · 5 files · 1 concern: authentication.**
