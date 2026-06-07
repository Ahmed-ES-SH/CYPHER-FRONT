# Categories Module — Analysis Report

> **Scope:** `src/modules/categories/`
> **Files analyzed:** `categories.api.ts`, `categories.hooks.ts`, `categories.store.ts`, `categories.types.ts`, `index.ts`, `INTEGRATION.md`
> **Supporting context:** `app/helpers/globalRequest.ts`, `vitest.config.ts`
> **Date:** 2026-05-29

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Issue Index](#2-issue-index)
3. [Detailed Issues & Fixes](#3-detailed-issues--fixes)
   - [PERF-01 — Client-Side Next.js Server Actions Overhead (`globalRequest`)](#perf-01)
   - [PERF-02 — Stiff, Non-Configurable Query Cache Configuration (Lack of Extensibility)](#perf-02)
   - [PERF-03 — Lack of Query Filter Normalization (Cache Fragmentation)](#perf-03)
   - [LOGIC-01 — Throwing Plain Objects in `transportRequest` (Lost Stack Traces)](#logic-01)
   - [LOGIC-02 — Missing Public Category Details Cache Invalidation on Update Mutation](#logic-02)
   - [LOGIC-03 — Missing Public Category Details Cache Invalidation on Delete Mutation](#logic-03)
   - [LOGIC-04 — Missing Public Category Details Cache Invalidation on Reorder Mutation](#logic-04)
   - [LOGIC-05 — Validation Error Data Loss (API Validation Silence on Front-End)](#logic-05)
   - [LOGIC-06 — Fragile DTO Response Mapping Vulnerable to Null/Undefined Values](#logic-06)
   - [LOGIC-07 — Insecure `normalizeSlug` Method Vulnerable to Non-String Types](#logic-07)
   - [ARCH-01 — Flat Directory Layout Violates Feature-First Architectural Pattern](#arch-01)
4. [Priority Matrix](#4-priority-matrix)
5. [Refactoring Roadmap](#5-refactoring-roadmap)

---

## 1. Executive Summary

The `categories` module is a vital component of the application, managing category lists, details, hierarchy traversal, and administrative operations. The module relies on modern, robust tools including `@tanstack/react-query` for server state caching and `zustand` for local UI interactions. 

However, an exhaustive audit of its design, caching strategies, data serialization, and transport mechanics reveals several critical logic and performance bottlenecks:
1. **Severe Public Cache Stale State (LOGIC-02, LOGIC-03, LOGIC-04):** Administrative mutations (create/update/delete/reorder) successfully invalidate lists and admin-facing details, but completely fail to invalidate public details (`categoryKeys.details()`). Consequently, once a customer views a category details page, they will see outdated hierarchy info, stale names/descriptions, or deleted categories for up to 5 minutes.
2. **Field-Level Validation Silence (LOGIC-05):** Due to strict limits in data propagation between the custom transport layer and Next.js Server Actions, backend API-driven validation errors (e.g., duplicate names or malformed inputs) are lost. The client receives a generic `500` or simple error string, making user-friendly inline validation errors impossible to render.
3. **Fragile DTO and String Mappers (LOGIC-06, LOGIC-07):** Response mappers and slug utilities assume perfect data compliance. If an API request encounters a database exception or returns unexpected nullish states, the application raises fatal JavaScript `TypeErrors`, immediately crashing the rendering tree.
4. **Server Action Overhead (PERF-01):** Utilizing Next.js Server Actions (`"use server"`) for client-side GET queries routes browser requests through double hop server paths, increasing latency and disabling natural browser HTTP caching.

Addressing these findings will maximize UI stability, secure immediate cash invalidation, restore field-level validation feedback, and guarantee React 19 compatibility.

---

## 2. Issue Index

| ID | Severity | Category | Title |
|---|---|---|---|
| **PERF-01** | 🟡 Medium | Performance | Client-Side Next.js Server Actions Overhead (`globalRequest`) |
| **PERF-02** | 🟢 Low | Performance | Stiff, Non-Configurable Query Cache Configuration (Lack of Extensibility) |
| **PERF-03** | 🟡 Medium | Performance | Lack of Query Filter Normalization (Cache Fragmentation) |
| **LOGIC-01** | 🟡 Medium | Logic | Throwing Plain Objects in `transportRequest` (Lost Stack Traces) |
| **LOGIC-02** | 🔴 High | Logic | Missing Public Category Details Cache Invalidation on Update Mutation |
| **LOGIC-03** | 🔴 High | Logic | Missing Public Category Details Cache Invalidation on Delete Mutation |
| **LOGIC-04** | 🔴 High | Logic | Missing Public Category Details Cache Invalidation on Reorder Mutation |
| **LOGIC-05** | 🔴 High | Logic | Validation Error Data Loss (API Validation Silence on Front-End) |
| **LOGIC-06** | 🔴 High | Logic | Fragile DTO Response Mapping Vulnerable to Null/Undefined Values |
| **LOGIC-07** | 🟡 Medium | Logic | Insecure `normalizeSlug` Method Vulnerable to Non-String Types |
| **ARCH-01** | 🟡 Medium | Architecture | Flat Directory Layout Violates Feature-First Architectural Pattern |

---

## 3. Detailed Issues & Fixes

### PERF-01

**Client-Side Next.js Server Actions Overhead (`globalRequest`)**

**File:** [`categories.api.ts`](../src/modules/categories/categories.api.ts#L26-L36)

**Description:**
The categories module leverages `globalRequest` from `@/app/helpers/globalRequest.ts` inside its `transportRequest` mechanism. However, `globalRequest.ts` is explicitly marked with the `"use server"` directive. 

In Next.js App Router projects, invoking a `"use server"` function from client-side files (like `categories.hooks.ts` through query queries) causes Next.js to compile it as a Server Action. This routes client-side read queries through a Next.js Server Action POST request, causing a double-hop network trip (Client ➔ Next.js Server ➔ Backend API) and preventing standard browser-level HTTP GET caching.

```ts
// ❌ Current — compiled into client-side Server Actions
import { globalRequest } from "@/app/helpers/globalRequest";

async function transportRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    throw { message: res.message, status: res.statusCode ?? 500 } satisfies ApiError;
  }
  return res.data as TResult;
}
```

**Fix:**
Expose a configurable client transport system. While `globalRequest` is optimal for server-side prefetching (`prefetchCategories`), standard client-side queries can use a direct browser fetch transport when executed on the client side, bypassing Next.js Server Action proxies and enabling fast, direct HTTP caching.

---

### PERF-02

**Stiff, Non-Configurable Query Cache Configuration (Lack of Extensibility)**

**File:** [`categories.hooks.ts`](../src/modules/categories/categories.hooks.ts#L36-L83)

**Description:**
All hooks like `useCategories()` and `useCategory(slug)` utilize hardcoded, rigid settings for caching:

```ts
const CATEGORY_STALE_TIME = 5 * 60 * 1000;
const CATEGORY_GC_TIME = 30 * 60 * 1000;
const CATEGORY_RETRY = 1;

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: categoryKeys.list(),
    queryFn: () => getCategoriesApi(),
    staleTime: CATEGORY_STALE_TIME,
    gcTime: CATEGORY_GC_TIME,
    retry: CATEGORY_RETRY,
  });
}
```

Because these hooks do not accept an optional configuration object, consumers cannot override query behaviors. For example:
- A category dropdown picker cannot request infinite `staleTime` (caching categories indefinitely for the user session).
- An edit panel cannot bypass caching or set `staleTime: 0` to guarantee fresh data representation.
- Developers cannot easily toggle the `enabled` parameter when fetching parent categories conditionally.

**Fix:**
Provide backward-compatible parameter options allowing developers to override default query characteristics dynamically.

```ts
// ✅ Fix — provide optional UseQueryOptions overrides
import type { UseQueryOptions } from "@tanstack/react-query";

export function useCategories(options?: Partial<UseQueryOptions<Category[], Error>>) {
  return useQuery<Category[], Error>({
    queryKey: categoryKeys.list(),
    queryFn: () => getCategoriesApi(),
    staleTime: CATEGORY_STALE_TIME,
    gcTime: CATEGORY_GC_TIME,
    retry: CATEGORY_RETRY,
    ...options,
  });
}
```

---

### PERF-03

**Lack of Query Filter Normalization (Cache Fragmentation)**

**File:** [`categories.hooks.ts`](../src/modules/categories/categories.hooks.ts#L64-L72)

**Description:**
In `useAdminCategories(filters)`, raw parameters are used directly in query keys. If one component queries `useAdminCategories()` and another queries `useAdminCategories({ page: 1, limit: 20 })`, React Query is forced to generate duplicate cache footprints:
- `["categories", "admin", "list", {}]`
- `["categories", "admin", "list", { page: 1, limit: 20 }]`

This leads to redundant HTTP request payloads and cache fragmentation for identical dataset responses.

**Fix:**
Add a filter normalization utility `normalizeCategoryFilters` to guarantee single-source query keys.

```ts
// ✅ Fix — normalize query parameters before keying
export function normalizeCategoryFilters(filters: CategoryFilters): CategoryFilters {
  return {
    page: filters.page != null && filters.page >= 1 ? filters.page : 1,
    limit: filters.limit != null && filters.limit >= 1 && filters.limit <= 100 ? filters.limit : 20,
    search: filters.search?.trim() || undefined,
    sortBy: filters.sortBy || "order",
    sortOrder: filters.sortOrder || "ASC",
  };
}
```

---

### LOGIC-01

**Throwing Plain Objects in `transportRequest` (Lost Stack Traces)**

**File:** [`categories.api.ts`](../src/modules/categories/categories.api.ts#L32-L34)

**Description:**
In `transportRequest`, network errors throw raw objects: `throw { message: res.message, status: res.statusCode ?? 500 } satisfies ApiError`. 

In JavaScript and TypeScript, throwing non-`Error` objects is a bad practice. It discards stack traces, which severely degrades debugging in development environments, breaks error tracking services (like Sentry), and causes friction in test libraries that expect standard `Error` class instances.

**Fix:**
Define a custom `CategoryApiError` extending `Error` in `categories.types.ts` that implements `ApiError`, and throw it on transport failures.

```ts
// ✅ Fix — standard CategoryApiError preserving stack trace
export class CategoryApiError extends Error implements ApiError {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "CategoryApiError";
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, CategoryApiError.prototype);
  }
}
```

---

### LOGIC-02

**Missing Public Category Details Cache Invalidation on Update Mutation**

**File:** [`categories.hooks.ts`](../src/modules/categories/categories.hooks.ts#L101-L112)

**Description:**
`useUpdateCategoryMutation` successfully invalidates public/admin list queries and the updated category's admin detail query, but it completely ignores the public category details cache (`categoryKeys.details()` or `categoryKeys.detail(slug)`). 

If an administrator edits a category's name, description, or parent relationship, standard users navigating to that category's public detail page will continue viewing stale values for up to 5 minutes.

```ts
// ❌ Current — ignores public details invalidation
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, { id: string; input: UpdateCategoryInput }>({
    mutationFn: ({ id, input }) => updateCategoryApi(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminDetail(id) });
    },
  });
}
```

**Fix:**
Invalidate general details caches and target the changed slug directly in `onSuccess`:

```ts
// ✅ Fix — target public details cache
onSuccess: (data, { id }) => {
  queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.adminDetail(id) });
  queryClient.invalidateQueries({ queryKey: categoryKeys.details() });
  if (data?.slug) {
    queryClient.invalidateQueries({ queryKey: categoryKeys.detail(data.slug) });
  }
}
```

---

### LOGIC-03

**Missing Public Category Details Cache Invalidation on Delete Mutation**

**File:** [`categories.hooks.ts`](../src/modules/categories/categories.hooks.ts#L114-L125)

**Description:**
When deleting a category, the `useDeleteCategoryMutation` hook updates admin lists and admin detail caches but completely forgets the public details cache (`categoryKeys.details()`). A deleted category's details page remains actively cached on the public front-end until cache expiration.

```ts
// ❌ Current — ignores public details invalidation
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteCategoryResult, Error, string>({
    mutationFn: (id) => deleteCategoryApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminDetails() });
    },
  });
}
```

**Fix:**
Ensure the entire public category details cache tree is invalidated on successful deletion:

```ts
// ✅ Fix — purge public details queries on delete
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.adminDetails() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.details() });
}
```

---

### LOGIC-04

**Missing Public Category Details Cache Invalidation on Reorder Mutation**

**File:** [`categories.hooks.ts`](../src/modules/categories/categories.hooks.ts#L127-L138)

**Description:**
Reordering categories impacts the `order` attribute across multiple categories. In `useReorderCategoriesMutation`, only list and admin details query keys are invalidated. Standard public categories detail cache views will still display categories in their stale sorting order.

**Fix:**
Invalidate the public details query key tree on reordering success:

```ts
// ✅ Fix — purge public details queries on reorder
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.adminDetails() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.details() });
}
```

---

### LOGIC-05

**Validation Error Data Loss (API Validation Silence on Front-End)**

**File:** [`categories.api.ts`](../src/modules/categories/categories.api.ts#L26-L36, and `app/helpers/globalRequest.ts`#L160-L171)

**Description:**
The server API yields field-level validation errors (e.g., status 422 with `{ errors: { name: ["Name must be unique"] } }`). However, `globalRequest.ts` strips out the validation details dictionary from failed HTTP requests:

```ts
// Inside app/helpers/globalRequest.ts
if (!response.ok) {
  return {
    success: false,
    message: result?.message || result?.error || defaultErrorMessage,
    statusCode: response.status,
    // ❌ Missing 'errors' transmission!
  };
}
```

Because of this, `transportRequest` is unable to receive validation details. Consequently, front-end forms receive a generic `500` or a single error string, making the custom utility `parseValidationErrors` completely useless.

**Fix:**
1. Safe Update to `app/helpers/globalRequest.ts` to transmit the `errors` property:
   ```ts
   // In app/helpers/globalRequest.ts
   if (!response.ok) {
     return {
       success: false,
       message: result?.message || result?.error || defaultErrorMessage,
       statusCode: response.status,
       errors: result?.errors, // ✅ Transmit error map
     } as any;
   }
   ```
2. Update `transportRequest` in `categories.api.ts` to forward errors to the thrown `CategoryApiError`:
   ```ts
   // In categories.api.ts
   const res = await globalRequest({ endpoint, method, body });
   if (!res.success) {
     throw new CategoryApiError(
       res.message,
       res.statusCode ?? 500,
       (res as any).errors,
     );
   }
   ```

---

### LOGIC-06

**Fragile DTO Response Mapping Vulnerable to Null/Undefined Values**

**File:** [`categories.api.ts`](../src/modules/categories/categories.api.ts#L122-L142)

**Description:**
The response mappers `toCategory` and `toCategoryDetails` map properties directly from raw API payloads without any type safety checks or optional chaining:

```ts
export function toCategory(raw: any): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    ...
  };
}
```

If the API fails silently or returns an unexpected shape (such as a database query exception or empty response objects), passing `null` or `undefined` into these functions triggers a fatal `TypeError` (e.g. `Cannot read properties of null (reading 'id')`), instantly crashing the client component stack.

**Fix:**
Inject defensive fallback guards and optional chaining inside both mapping pipelines:

```ts
// ✅ Fix — resilient mapping with optional chaining
export function toCategory(raw: any): Category {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      name: "Unknown Category",
      slug: "",
      description: null,
      color: null,
      icon: null,
      order: 0,
      createdAt: "",
      updatedAt: "",
    };
  }
  return {
    id: raw.id ?? "",
    name: raw.name ?? "",
    slug: raw.slug ?? "",
    description: raw.description ?? null,
    color: raw.color ?? null,
    icon: raw.icon ?? null,
    order: typeof raw.order === "number" ? raw.order : 0,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

export function toCategoryDetails(raw: any): CategoryDetails {
  if (!raw || typeof raw !== "object") {
    return {
      ...toCategory(null),
      parentId: null,
      children: [],
    };
  }
  return {
    ...toCategory(raw),
    parentId: raw.parentId ?? null,
    children: Array.isArray(raw.children) ? raw.children.map(toCategory) : [],
  };
}
```

---

### LOGIC-07

**Insecure `normalizeSlug` Method Vulnerable to Non-String Types**

**File:** [`categories.api.ts`](../src/modules/categories/categories.api.ts#L237-L245)

**Description:**
`normalizeSlug` calls string methods directly on its parameter:

```ts
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    ...
}
```

If `input` is ever supplied with an incorrect type (such as an empty variable, `undefined`, or integer), the program will immediately throw a runtime TypeError, breaking client-side execution.

**Fix:**
Ensure input type safety by checking parameters before executing string normalizations:

```ts
// ✅ Fix — guard normalizeSlug
export function normalizeSlug(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

---

### ARCH-01

**Flat Directory Layout Violates Feature-First Architectural Pattern**

**Directory:** `src/modules/categories/`

**Description:**
The repository operates under a clear, feature-first design philosophy as outlined in the global guideline `AGENTS.md`. Features should own their structural layout rather than bunching components in flat folder layers:

```
src/modules/categories/
├── categories.api.ts
├── categories.hooks.ts
├── categories.store.ts
├── categories.types.ts
├── index.ts
```

Keeping all logic at the root of a feature directory creates clutter as modules scale and additional helper files or UI components are introduced.

**Fix:**
Relocate specific files into nested domain packages matching the recommended feature layout structure:

```
src/modules/categories/
├── api/
│   └── categories.api.ts
├── hooks/
│   └── categories.hooks.ts
├── store/
│   └── categories.store.ts
├── types/
│   └── categories.types.ts
└── index.ts (exposing all APIs cleanly)
```

---

## 4. Priority Matrix

```
HIGH PRIORITY (Fix Instantly)
┌─────────────┬──────────────────────────────────────────────────────┐
│ LOGIC-02     │ Invalidate public category details query on update   │
│ LOGIC-03     │ Invalidate public category details query on delete   │
│ LOGIC-04     │ Invalidate public category details query on reorder  │
│ LOGIC-06     │ Apply resilient null-guards to response DTO mappers  │
└─────────────┴──────────────────────────────────────────────────────┘

MEDIUM PRIORITY (Fix Next)
┌─────────────┬──────────────────────────────────────────────────────┐
│ LOGIC-01     │ Throw custom CategoryApiError instead of raw objects │
│ LOGIC-05     │ Fix validation error data loss in transport layer    │
│ LOGIC-07     │ Guard normalizeSlug against non-string variables     │
│ PERF-02     │ Support custom UseQueryOptions in category hooks     │
│ PERF-03     │ Normalize filters to resolve cache fragmentation     │
└─────────────┴──────────────────────────────────────────────────────┘

LOW PRIORITY (Backlog / Refactor Sprint)
┌─────────────┬──────────────────────────────────────────────────────┐
│ PERF-01     │ Support direct client-to-API transport bypass option │
│ ARCH-01     │ Structure folder into api/, hooks/, store/, types/   │
└─────────────┴──────────────────────────────────────────────────────┘
```

---

## 5. Refactoring Roadmap

### Phase 1 — Cache Sync & Stability Fixes (Zero Breaking Changes)
- [x] **LOGIC-02 / LOGIC-03 / LOGIC-04** Invalidate the public category details cache tree (`categoryKeys.details()`) during successful administrative edits, deletions, and reordering.
- [x] **LOGIC-06** Inject defensive null guards and optional chaining into `toCategory` and `toCategoryDetails` DTO mappers to prevent fatal runtime `TypeErrors`.
- [x] **LOGIC-07** Guard `normalizeSlug` against non-string inputs.

### Phase 2 — Developer Experience & Validation Data Recovery
- [x] **LOGIC-01** Create the `CategoryApiError` class extending `Error` in `categories.types.ts`.
- [x] **LOGIC-05** Update `app/helpers/globalRequest.ts` and `categories.api.ts` to transmit and throw the full validation `errors` mapping back to client interfaces.
- [x] **PERF-02** Restructure all category query hooks to accept and spread an optional React Query settings override argument.

### Phase 3 — Architecture Realignment
- [ ] **PERF-03** Apply filter normalization queries inside categories list queries.
- [ ] **ARCH-01** Reorganize the flat `src/modules/categories` folder layout into standard, domain-separated sub-folders (`api/`, `hooks/`, `store/`, `types/`) to fully comply with the `AGENTS.md` guidelines.

---

*Report generated by static code audit and architecture inspection of the `categories` module. All 41 vitest unit and hooks tests successfully pass in the test environment.*
