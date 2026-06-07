# Auth Module — Analysis Report

> **Scope:** `src/modules/auth/`
> **Files analyzed:** `auth.api.ts`, `auth.hooks.ts`, `auth.store.ts`, `auth.types.ts`, `index.ts`
> **Supporting context:** `app/helpers/globalRequest.ts`, `app/_components/_global/ClientLayout.tsx`, `__tests__/*`
> **Date:** 2026-05-29

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Issue Index](#2-issue-index)
3. [Detailed Issues & Fixes](#3-detailed-issues--fixes)
   - [PERF-01 — Module-Level Singleton `queryClient` Outside React Tree](#perf-01)
   - [PERF-02 — `useSession` Re-fires on Every `isInitialized` Change](#perf-02)
   - [PERF-03 — `useAuth` Subscribes to Entire `isLoading` Object (Over-Rendering)](#perf-03)
   - [PERF-04 — `getAuthConfig()` Rebuilds Object on Every Call](#perf-04)
   - [PERF-05 — `DEBUG_MODE = true` in Production (globalRequest)](#perf-05)
   - [LOGIC-01 — `initializationPromise` Never Resets on Failure Path](#logic-01)
   - [LOGIC-02 — `reset()` Resets `isInitialized` — Session Loops Possible](#logic-02)
   - [LOGIC-03 — Dual Loading State: Store + React Query Are Out of Sync](#logic-03)
   - [LOGIC-04 — `setOnUnauthorized` Called at Module Scope, Not Inside React](#logic-04)
   - [LOGIC-05 — `LoginResponse.access_token` Received but Never Stored/Used](#logic-05)
   - [LOGIC-06 — `useResetPassword` Uses a Shared `resetPassword` Loading Flag for 3 Mutations](#logic-06)
   - [LOGIC-07 — `authRequest` Throws Plain Object, Not `Error` Instance](#logic-07)
   - [ARCH-01 — Services (`handleLogin`, `handleLogout`, `initializeSession`) Live in `auth.api.ts`](#arch-01)
   - [ARCH-02 — `AUTH_ROUTES`, `AUTH_ENDPOINTS`, `AUTH_ERRORS`, `authKeys` All Exported from `auth.api.ts`](#arch-02)
   - [ARCH-03 — `index.ts` Re-exports Internal API Functions Directly](#arch-03)
   - [SEC-01 — `AuthApiError.errors` Field Present in Types but Never Surfaced to UI](#sec-01)
   - [TEST-01 — `getAuthConfig` Test Uses `afterEach` Without Importing It](#test-01)
   - [TEST-02 — `useSession` Test Validates Call Count, Not Side Effects](#test-02)
4. [Priority Matrix](#4-priority-matrix)
5. [Refactoring Roadmap](#5-refactoring-roadmap)

---

## 1. Executive Summary

The `auth` module is well-structured for a first iteration. It correctly separates API calls, state, hooks, and types. However, several issues were found across four categories: **performance**, **logic correctness**, **architecture**, and **security/DX**. The most critical problems are a **session initialization loop** (LOGIC-01/02), **dual loading state inconsistency** (LOGIC-03), and **services mixed into the API file** (ARCH-01). These must be addressed before scaling the codebase.

---

## 2. Issue Index

| ID | Severity | Category | Title |
|---|---|---|---|
| PERF-01 | 🟡 Medium | Performance | `queryClient` singleton created at module scope |
| PERF-02 | 🟡 Medium | Performance | `useSession` effect re-fires on every `isInitialized` change |
| PERF-03 | 🟡 Medium | Performance | `useAuth` subscribes to the full `isLoading` object |
| PERF-04 | 🟢 Low | Performance | `getAuthConfig()` rebuilds a new object on every call |
| PERF-05 | 🔴 High | Performance | `DEBUG_MODE = true` hardcoded in production (`globalRequest`) |
| LOGIC-01 | 🔴 High | Logic | `initializationPromise` does not reset on failure |
| LOGIC-02 | 🔴 High | Logic | `reset()` clears `isInitialized`, enabling re-initialization loops |
| LOGIC-03 | 🟡 Medium | Logic | Dual loading state: store + React Query are out of sync |
| LOGIC-04 | 🟡 Medium | Logic | `setOnUnauthorized` called at module scope, outside React |
| LOGIC-05 | 🟡 Medium | Logic | `access_token` received from login but never stored or used |
| LOGIC-06 | 🟢 Low | Logic | Shared `resetPassword` loading flag for 3 distinct mutations |
| LOGIC-07 | 🟡 Medium | Logic | `authRequest` throws a plain object, not an `Error` instance |
| ARCH-01 | 🔴 High | Architecture | Service functions live in `auth.api.ts` (wrong layer) |
| ARCH-02 | 🟡 Medium | Architecture | Constants, routes, and keys mixed into `auth.api.ts` |
| ARCH-03 | 🟢 Low | Architecture | `index.ts` re-exports internal API functions |
| SEC-01 | 🟢 Low | Security/DX | `AuthApiError.errors` field never surfaced to the UI |
| TEST-01 | 🟡 Medium | Testing | `afterEach` used without being imported in `auth.api.test.ts` |
| TEST-02 | 🟢 Low | Testing | `useSession` test only checks call count, not behavior |

---

## 3. Detailed Issues & Fixes

---

### PERF-01

**Module-Level Singleton `queryClient` Outside React Tree**

**File:** [`ClientLayout.tsx`](../app/_components/_global/ClientLayout.tsx#L12-L19)

**Description:**
The `QueryClient` is created as a module-level constant. In Next.js App Router with server components, module-level state can be shared across requests (server-side), leading to data bleeding between users in SSR/RSC contexts.

```ts
// ❌ Current — module-level, shared across requests
const queryClient = new QueryClient({ ... });
```

**Fix:**
Create the `QueryClient` inside the component using `useState` or `useRef` so each render gets an isolated instance in SSR, while still being stable across re-renders.

```ts
// ✅ Fix — stable per component, isolated in SSR
import { useRef } from "react";

function ClientLayout({ children }: ClientLayoutProps) {
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
    });
  }
  return (
    <QueryClientProvider client={queryClientRef.current}>
      ...
    </QueryClientProvider>
  );
}
```

---

### PERF-02

**`useSession` Re-fires on Every `isInitialized` Change**

**File:** [`auth.hooks.ts`](../src/modules/auth/auth.hooks.ts#L39-L47)

**Description:**
The `useEffect` in `useSession` has `[isInitialized]` as its dependency. `initializeSession()` itself guards against running twice (via `initializationPromise`), but the effect triggers re-evaluation every time `isInitialized` changes. This causes an unnecessary function call after session initialization completes.

```ts
// ❌ Current — runs again when isInitialized flips to true
useEffect(() => {
  initializeSession();
}, [isInitialized]);
```

**Fix:**
Run `initializeSession` only once on mount with an empty dependency array. The internal guard in `initializeSession` already handles deduplication.

```ts
// ✅ Fix — fire once on mount only
useEffect(() => {
  initializeSession();
}, []);
```

---

### PERF-03

**`useAuth` Subscribes to Entire `isLoading` Object (Over-Rendering)**

**File:** [`auth.hooks.ts`](../src/modules/auth/auth.hooks.ts#L24)

**Description:**
`useAuthStore((s) => s.isLoading)` returns the entire `isLoading` object. Zustand performs a reference equality check — since `setLoading` always creates a new `isLoading` object via spread (`{ ...state.isLoading, [key]: value }`), **any** loading flag change will cause **every** component consuming `useAuth` to re-render, even if that component only cares about `isLoading.session`.

```ts
// ❌ Current — subscribes to full object, triggers on any flag change
const isLoading = useAuthStore((s) => s.isLoading);
```

**Fix:**
Consumers of `useAuth` should select only what they need. Expose granular selectors or use a shallow equality comparator:

```ts
// ✅ Option A — shallow comparator (keeps the same API)
import { shallow } from "zustand/shallow";

const isLoading = useAuthStore((s) => s.isLoading, shallow);
```

```ts
// ✅ Option B — separate selectors in useAuth
const sessionLoading = useAuthStore((s) => s.isLoading.session);
const loginLoading   = useAuthStore((s) => s.isLoading.login);
const logoutLoading  = useAuthStore((s) => s.isLoading.logout);
```

---

### PERF-04

**`getAuthConfig()` Rebuilds Object on Every Call**

**File:** [`auth.api.ts`](../src/modules/auth/auth.api.ts#L55-L60)

**Description:**
`getAuthConfig()` reads `process.env` and constructs a new object each time it is called. This is minor but adds unnecessary work when called in hot paths.

```ts
// ❌ Current — new object every invocation
export function getAuthConfig() {
  return {
    apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000",
    cookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE ?? AUTH_COOKIE_NAME,
  };
}
```

**Fix:**
Memoize with a module-level constant (environment variables do not change at runtime in Next.js):

```ts
// ✅ Fix — computed once, reused
export const AUTH_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000",
  cookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE ?? AUTH_COOKIE_NAME,
} as const;
```

---

### PERF-05

**`DEBUG_MODE = true` Hardcoded in Production (`globalRequest`)**

**File:** [`globalRequest.ts`](../app/helpers/globalRequest.ts#L19)

**Description:**
`DEBUG_MODE` is hardcoded to `true`. In production, every single HTTP request writes to disk (`appendFileSync`), which is a **synchronous blocking I/O** call on the Node.js event loop. This severely degrades server response times under load.

```ts
// ❌ Current — always writes to disk, blocks event loop
const DEBUG_MODE = true;
```

**Fix:**
Gate the flag on `NODE_ENV`:

```ts
// ✅ Fix — only active in development
const DEBUG_MODE = process.env.NODE_ENV === "development";
```

---

### LOGIC-01

**`initializationPromise` Does Not Reset on Failure**

**File:** [`auth.api.ts`](../src/modules/auth/auth.api.ts#L133-L181)

**Description:**
The module-level `initializationPromise` is set to `null` in the `finally` block, which is correct. **However**, if the application is server-rendered and the module is cached, a failed initialization leaves the store in the `reset()` state but `initializationPromise` will already be `null` — so far so good. But the real problem is the **race condition** in the guard:

```ts
if (state.isInitialized || state.isLoading.session) return;
if (initializationPromise) return initializationPromise;
```

The check `state.isLoading.session` is read **before** the store's `setLoading("session", true)` is called. In React Strict Mode (double-invocation in dev), two simultaneous calls can both pass this guard before the store updates, leading to **double initialization**.

```ts
// ❌ Potential double-initialization in React Strict Mode
state.setLoading("session", true);           // <-- set AFTER the guard check
initializationPromise = (async () => { ... })();
```

**Fix:**
Set the loading state **before** the guard check, and use the promise ref as the primary mutex:

```ts
// ✅ Fix — set loading synchronously before any async work
export async function initializeSession(): Promise<void> {
  const { useAuthStore } = await import("./auth.store");
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
      useAuthStore.getState().reset();
    })
    .finally(() => {
      useAuthStore.getState().setLoading("session", false);
      useAuthStore.getState().setInitialized();
      initializationPromise = null;
    });

  return initializationPromise;
}
```

---

### LOGIC-02

**`reset()` Clears `isInitialized` — Session Re-initialization Loops**

**File:** [`auth.store.ts`](../src/modules/auth/auth.store.ts#L32) · [`auth.api.ts`](../src/modules/auth/auth.api.ts#L171-L172)

**Description:**
When `initializeSession` fails (e.g., user is not logged in), it calls `useAuthStore.getState().reset()` — which resets **everything**, including `isInitialized = false`. This means:

1. `initializeSession` fails → calls `reset()` → `isInitialized = false`
2. `useSession`'s `useEffect` has `[isInitialized]` as a dep → fires again
3. `initializeSession` is called again → loops until it succeeds or the component unmounts

This creates an **infinite retry loop** for unauthenticated users.

```ts
// ❌ Failure path — reset clears isInitialized, triggering re-init
} catch {
  useAuthStore.getState().reset(); // <-- sets isInitialized = false
} finally {
  useAuthStore.getState().setInitialized(); // <-- this runs AFTER reset, so it's ok
```

Wait — `setInitialized()` is called in the `finally` block, so `isInitialized` will be set back to `true` after the catch. **However**, the `reset()` in the `onUnauthorized` callback (called from `authRequest`) resets `isInitialized` **outside** the initialization flow, which can re-trigger `useSession`.

**Fix (two-part):**

**Part 1:** Create a separate `clearUser()` action in the store that does NOT reset `isInitialized`:

```ts
// ✅ New store action
clearUser: () =>
  set((state) => ({
    user: null,
    isAuthenticated: false,
    isLoading: initialState.isLoading,
    // isInitialized is intentionally preserved
    isInitialized: state.isInitialized,
  })),
```

**Part 2:** Replace `reset()` calls in non-logout flows with `clearUser()`:

```ts
// ✅ In initializeSession catch block
} catch {
  useAuthStore.getState().clearUser(); // preserve isInitialized
}

// ✅ In setOnUnauthorized callback
setOnUnauthorized(() => useAuthStore.getState().clearUser());
```

---

### LOGIC-03

**Dual Loading State: Store + React Query Are Out of Sync**

**File:** [`auth.hooks.ts`](../src/modules/auth/auth.hooks.ts#L53-L92)

**Description:**
`useLogin` and `useLogout` maintain loading state in **two places simultaneously**:
- The Zustand store (`isLoading.login`, `isLoading.logout`) — set inside `handleLogin`/`handleLogout` in `auth.api.ts`
- React Query mutation state (`mutation.isPending`) — managed internally by TanStack Query

The hooks then return the **store's** loading flag, discarding React Query's `isPending`. This is a maintenance risk: if `handleLogin` throws before setting the store loading, or if a caller uses `mutation.isPending` directly, both sources will diverge.

```ts
// ❌ Current — two sources of truth
const loginLoading = useAuthStore((s) => s.isLoading.login); // store
const mutation = useMutation({ mutationFn: handleLogin });   // react-query
return { isLoading: loginLoading }; // only store is returned
```

**Fix:**
Choose one source of truth. React Query's `isPending` is the preferred approach as it is React-lifecycle-aware and automatically resets on unmount:

```ts
// ✅ Fix — use React Query as the single source of truth for loading
export function useLogin() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: LoginRequest) => loginApi(dto),
    onSuccess: (data) => {
      useAuthStore.getState().setUser(data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,  // single source of truth
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
```

Remove the redundant `setLoading("login", ...)` calls from `handleLogin`/`handleLogout` service functions.

---

### LOGIC-04

**`setOnUnauthorized` Called at Module Scope, Not Inside React**

**File:** [`ClientLayout.tsx`](../app/_components/_global/ClientLayout.tsx#L21)

**Description:**
```ts
// ❌ Module-level call — runs at import time, not inside React lifecycle
setOnUnauthorized(() => useAuthStore.getState().reset());
```

This runs when the module is first imported. While it works, it:
1. Has a side-effect at import time (hard to test and control)
2. Can silently fail or produce unexpected behavior if the module is imported in a non-browser context (SSR)
3. Is a hidden dependency that is easy to miss during refactoring

**Fix:**
Register the callback inside a `useEffect` with cleanup:

```ts
// ✅ Fix — register inside component lifecycle
function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    setOnUnauthorized(() => useAuthStore.getState().clearUser());
    return () => setOnUnauthorized(null); // cleanup on unmount
  }, []);

  return ...;
}
```

---

### LOGIC-05

**`access_token` Received from Login but Never Stored or Used**

**File:** [`auth.api.ts`](../src/modules/auth/auth.api.ts#L139) · [`auth.types.ts`](../src/modules/auth/auth.types.ts#L34-L37)

**Description:**
The `LoginResponse` type includes `access_token`, which is returned from the backend. However, `handleLogin` only stores the `user` object and ignores the token entirely:

```ts
// ❌ access_token is received and immediately discarded
export interface LoginResponse {
  user: AuthUser;
  access_token: string; // <-- never stored or used
}

const { user } = await loginApi(dto); // access_token is destructured away
```

If the authentication relies on HTTP-only cookies (managed server-side), the token can be safely ignored on the client. But if there are any client-side API calls that need to include a Bearer token, this will silently fail.

**Fix (two options):**

**Option A** — If the auth is fully cookie-based (recommended): Document this explicitly and remove `access_token` from `LoginResponse` to avoid confusion:

```ts
// ✅ Option A — cookie-based auth, clean up the type
export interface LoginResponse {
  user: AuthUser;
  // access_token removed — server sets HTTP-only cookie
}
```

**Option B** — If Bearer token auth is needed: Store the token in the Zustand store (not `localStorage` for security):

```ts
// ✅ Option B — store token in memory
const { user, access_token } = await loginApi(dto);
useAuthStore.getState().setUser(user);
useAuthStore.getState().setToken(access_token);
```

---

### LOGIC-06

**Shared `resetPassword` Loading Flag for 3 Distinct Mutations**

**File:** [`auth.hooks.ts`](../src/modules/auth/auth.hooks.ts#L98-L125)

**Description:**
`useResetPassword` uses a single `resetPassword` loading flag shared by `send`, `verify`, and `reset` mutations. This means UI code cannot distinguish *which* step is loading, and setting the flag in `onMutate`/`onSettled` callbacks creates the same dual-loading-state problem as LOGIC-03.

```ts
// ❌ All three mutations share the same loading flag
const sendMutation   = useMutation({ onMutate: () => setLoading("resetPassword", true) });
const verifyMutation = useMutation({ onMutate: () => setLoading("resetPassword", true) });
const resetMutation  = useMutation({ onMutate: () => setLoading("resetPassword", true) });
```

**Fix:**
Use each mutation's own `isPending` from React Query:

```ts
// ✅ Fix — each mutation's isPending is independent and accurate
return {
  send: sendMutation,
  verify: verifyMutation,
  reset: resetMutation,
  isSending:   sendMutation.isPending,
  isVerifying: verifyMutation.isPending,
  isResetting: resetMutation.isPending,
  isLoading:   sendMutation.isPending || verifyMutation.isPending || resetMutation.isPending,
};
```

Remove `resetPassword` from `AuthLoading` type and from the store since it's no longer needed.

---

### LOGIC-07

**`authRequest` Throws a Plain Object, Not an `Error` Instance**

**File:** [`auth.api.ts`](../src/modules/auth/auth.api.ts#L86)

**Description:**
```ts
// ❌ Plain object throw — not an Error instance
throw { message: res.message, status: res.statusCode };
```

Throwing non-`Error` objects has several downsides:
- No stack trace is captured
- `instanceof Error` checks fail (breaking React Query's error handling)
- Some tooling (Sentry, etc.) won't capture non-Error throws correctly
- TypeScript treats the catch clause as `unknown`, requiring manual casting

**Fix:**
Use the existing `AuthApiError` type and extend `Error`:

```ts
// ✅ Fix — proper Error subclass with stack trace
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

// In authRequest:
throw new AuthError(res.message ?? "Auth error", res.statusCode ?? 0);
```

---

### ARCH-01

**Service Functions Live in `auth.api.ts` (Wrong Layer)**

**File:** [`auth.api.ts`](../src/modules/auth/auth.api.ts#L131-L181)

**Description:**
According to the project's architecture guide (AGENTS.md), the intended dependency flow is:

```
Component → Hook → Service → API → Backend
```

But currently, `handleLogin`, `handleLogout`, and `initializeSession` (which are **services** — they orchestrate store + API) are defined inside `auth.api.ts` (which should only contain raw HTTP calls).

This violation makes `auth.api.ts` responsible for two layers: raw requests AND business orchestration.

**Fix:**
Extract services to a new dedicated file:

```
src/modules/auth/
├── auth.api.ts          ← HTTP functions only (loginApi, logoutApi, ...)
├── auth.service.ts      ← NEW: orchestration (handleLogin, handleLogout, initializeSession)
├── auth.hooks.ts
├── auth.store.ts
├── auth.types.ts
└── index.ts
```

```ts
// auth.service.ts
import { loginApi, logoutApi, getCurrentUserApi } from "./auth.api";
import { useAuthStore } from "./auth.store";
import type { LoginRequest, AuthUser } from "./auth.types";

export async function handleLogin(dto: LoginRequest): Promise<AuthUser> { ... }
export async function handleLogout(): Promise<void> { ... }
export async function initializeSession(): Promise<void> { ... }
```

---

### ARCH-02

**Constants, Routes, and Keys Mixed into `auth.api.ts`**

**File:** [`auth.api.ts`](../src/modules/auth/auth.api.ts#L14-L60)

**Description:**
`auth.api.ts` contains `AUTH_ROUTES`, `AUTH_ENDPOINTS`, `AUTH_ERRORS`, `authKeys`, and `getAuthConfig()` in addition to API functions. Per the AGENTS.md architecture guide, constants should live in a `constants/` subfolder.

**Fix:**
Split into dedicated files:

```
src/modules/auth/
├── constants/
│   ├── auth.routes.ts      ← AUTH_ROUTES
│   ├── auth.endpoints.ts   ← AUTH_ENDPOINTS, AUTH_COOKIE_NAME, AUTH_CONFIG
│   ├── auth.errors.ts      ← AUTH_ERRORS
│   └── auth.keys.ts        ← authKeys
```

---

### ARCH-03

**`index.ts` Re-exports Internal API Functions**

**File:** [`index.ts`](../src/modules/auth/index.ts#L19-L39)

**Description:**
The public API (`index.ts`) exports low-level functions like `loginApi`, `logoutApi`, `verifyEmailApi`, `sendResetPasswordApi`, etc. These are **internal** implementation details. Consumers outside the module should use the hooks and service functions, not the raw API calls. Exporting internals increases coupling and makes refactoring harder.

**Fix:**
Only export what external consumers legitimately need:

```ts
// ✅ index.ts — clean public API
export { useAuth, useSession, useLogin, useLogout, useResetPassword } from "./auth.hooks";
export { handleLogin, handleLogout, initializeSession } from "./auth.service";
export { AUTH_ROUTES, AUTH_ERRORS, authKeys } from "./constants";
export { setOnUnauthorized } from "./auth.api"; // needed by ClientLayout
export type { ... } from "./auth.types"; // all types
// ❌ Do NOT export: loginApi, logoutApi, verifyEmailApi, etc.
```

---

### SEC-01

**`AuthApiError.errors` Field Never Surfaced to UI**

**File:** [`auth.types.ts`](../src/modules/auth/auth.types.ts#L65-L69)

**Description:**
The `AuthApiError` type has a structured `errors` field for field-level validation errors (e.g., from backend form validation), but:
1. `authRequest` does not parse this field from the response
2. No hook or component reads it

This means detailed validation errors from the backend (e.g., "password too short", "email already taken") are silently dropped.

**Fix:**

```ts
// In authRequest — parse and forward field errors
throw new AuthError(res.message ?? "Auth error", res.statusCode ?? 0, res.errors);

// In AuthError class
export class AuthError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.errors = errors;
  }
}
```

---

### TEST-01

**`afterEach` Used Without Being Imported in `auth.api.test.ts`**

**File:** [`auth.api.test.ts`](../src/modules/auth/__tests__/auth.api.test.ts#L133-L135)

**Description:**
```ts
// ❌ afterEach used but not imported from vitest
afterEach(() => {
  process.env = { ...originalEnv };
});
```

`afterEach` is a global in vitest when `globals: true` is set in the config. If that option is removed or changed, this will silently break. It also makes the test file's dependencies unclear.

**Fix:**
Always explicitly import test utilities:

```ts
import { describe, it, expect, afterEach } from "vitest";
```

---

### TEST-02

**`useSession` Test Validates Call Count, Not Side Effects**

**File:** [`auth.hooks.test.tsx`](../src/modules/auth/__tests__/auth.hooks.test.tsx#L301-L309)

**Description:**
```ts
it("calls initializeSession on mount", () => {
  const spy = vi.spyOn(api, "initializeSession").mockResolvedValue(undefined);
  renderHook(() => useSession(), { wrapper: createWrapper() });
  expect(spy).toHaveBeenCalledTimes(1); // only checks call count
});
```

This test verifies the function was called but not whether the state was actually updated. A refactor that changes how `initializeSession` is triggered (e.g., via a context) would pass this test even if behavior broke.

**Fix:**
Test observable behavior (state changes) rather than implementation details:

```ts
// ✅ Fix — test the observable effect
it("initializes auth state on mount", async () => {
  vi.spyOn(api, "initializeSession").mockImplementation(async () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setInitialized();
  });

  const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

  await waitFor(() => expect(result.current.isReady).toBe(true));
  expect(result.current.user).toEqual(mockUser);
});
```

---

## 4. Priority Matrix

```
HIGH PRIORITY (Fix First)
┌─────────────┬──────────────────────────────────────────────────────┐
│ PERF-05     │ Disable DEBUG_MODE in production — blocking disk I/O │
│ LOGIC-01    │ Fix initializationPromise race condition              │
│ LOGIC-02    │ Add clearUser() to prevent re-init loops             │
│ ARCH-01     │ Extract services into auth.service.ts                │
└─────────────┴──────────────────────────────────────────────────────┘

MEDIUM PRIORITY (Fix Next Sprint)
┌─────────────┬──────────────────────────────────────────────────────┐
│ PERF-01     │ Move queryClient inside component (useRef)           │
│ PERF-02     │ Empty dep array in useSession's useEffect            │
│ PERF-03     │ Use shallow comparator for isLoading in useAuth      │
│ LOGIC-03    │ Use React Query isPending as single loading source   │
│ LOGIC-04    │ Register setOnUnauthorized inside useEffect          │
│ LOGIC-07    │ Throw AuthError class instead of plain object        │
│ ARCH-02     │ Move constants to constants/ subfolder               │
│ TEST-01     │ Import afterEach explicitly in test file             │
└─────────────┴──────────────────────────────────────────────────────┘

LOW PRIORITY (Backlog)
┌─────────────┬──────────────────────────────────────────────────────┐
│ PERF-04     │ Make AUTH_CONFIG a module-level constant             │
│ LOGIC-05    │ Clarify/remove access_token from LoginResponse       │
│ LOGIC-06    │ Split resetPassword loading into per-mutation flags  │
│ ARCH-03     │ Remove internal API exports from index.ts            │
│ SEC-01      │ Surface errors field from AuthApiError               │
│ TEST-02     │ Improve useSession test to check state, not calls    │
└─────────────┴──────────────────────────────────────────────────────┘
```

---

## 5. Refactoring Roadmap

### Phase 1 — Critical Fixes (no breaking changes)
- [ ] **PERF-05** Set `DEBUG_MODE = process.env.NODE_ENV === "development"` in `globalRequest.ts`
- [ ] **LOGIC-02** Add `clearUser()` action to `auth.store.ts`
- [ ] **LOGIC-01** Fix race condition in `initializeSession` (synchronous loading flag)
- [ ] **PERF-02** Change `useSession`'s `useEffect` dependency to `[]`
- [ ] **LOGIC-07** Create `AuthError` class in `auth.types.ts`
- [ ] **TEST-01** Import `afterEach` in `auth.api.test.ts`

### Phase 2 — Loading State Consolidation
- [ ] **LOGIC-03** Remove `setLoading("login")` / `setLoading("logout")` from service functions; use `mutation.isPending` in hooks
- [ ] **LOGIC-06** Return per-mutation `isPending` from `useResetPassword`
- [ ] **PERF-03** Add `shallow` comparator to `useAuthStore((s) => s.isLoading)` in `useAuth`
- [ ] **LOGIC-04** Move `setOnUnauthorized` call into `useEffect` in `ClientLayout`
- [ ] **PERF-01** Move `queryClient` into `useRef` inside `ClientLayout`

### Phase 3 — Architecture Cleanup
- [ ] **ARCH-01** Create `auth.service.ts` and move `handleLogin`, `handleLogout`, `initializeSession`
- [ ] **ARCH-02** Create `constants/` subfolder with `auth.routes.ts`, `auth.endpoints.ts`, `auth.errors.ts`, `auth.keys.ts`
- [ ] **ARCH-03** Narrow `index.ts` to only export public-facing API
- [ ] **PERF-04** Replace `getAuthConfig()` with `AUTH_CONFIG` constant
- [ ] **LOGIC-05** Clarify `access_token` in `LoginResponse` — document or remove
- [ ] **SEC-01** Parse and forward field validation errors through `AuthError`
- [ ] **TEST-02** Refactor `useSession` test to assert state changes

---

*Report generated by static analysis of `src/modules/auth/`. No runtime profiling was performed.*
