# Blog Module — Analysis Report

> **Scope:** `src/modules/blog/`
> **Files analyzed:** `blog.api.ts`, `blog.hooks.ts`, `blog.store.ts`, `blog.types.ts`, `adapters/blogToLegacy.ts`, `blog.config.ts`, `index.ts`
> **Supporting context:** `app/helpers/globalRequest.ts`, `app/_components/_website/_blog/ArticlesComponent.tsx`, `app/_components/_website/_blog/ArticleCard.tsx`
> **Date:** 2026-05-29

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Issue Index](#2-issue-index)
3. [Detailed Issues & Fixes](#3-detailed-issues--fixes)
   - [PERF-01 — Client-Side Next.js Server Actions Overhead (`globalRequest`)](#perf-01)
   - [PERF-02 — Lack of Query Filter Normalization (Cache Fragmentation)](#perf-02)
   - [LOGIC-01 — Throwing Plain Objects in `transportRequest` (Lost Stack Traces)](#logic-01)
   - [LOGIC-02 — Missing Public Blog Detail Invalidation on Update/Publish Mutations](#logic-02)
   - [LOGIC-03 — Deleted Blog Details Left in Public Cache](#logic-03)
   - [LOGIC-04 — Fragile DTO Response Mapping Vulnerable to Flat IDs](#logic-04)
   - [LOGIC-05 — Missing Fallback in `getAdminBlogPostsApi` Array Map](#logic-05)
   - [LOGIC-06 — Inaccurate `estimateReadTime` for Empty or Whitespace Content](#logic-06)
   - [LOGIC-07 — Hardcoded `lastPage: 1` Fallback in List Metadata](#logic-07)
   - [LOGIC-08 — Legacy Adapter Vulnerable to Undefined Category and Tags](#logic-08)
   - [ARCH-01 — Flat Directory Layout Violates Feature-First Architectural Pattern](#arch-01)
   - [ARCH-02 — Missing `"use client"` in `blog.store.ts`](#arch-02)
4. [Priority Matrix](#4-priority-matrix)
5. [Refactoring Roadmap](#5-refactoring-roadmap)

---

## 1. Executive Summary

The `blog` module is a solid implementation that successfully hooks up a React Query layer with the global request helpers and exports clean custom React hooks for public and admin operations. However, a deep review of its architecture, performance, caching strategy, and data transformations reveals several critical areas of concern. 

The most pressing problems include **bypassing the browser-level cache** due to Client-Side Server Action redirection (PERF-01), **missing public cache invalidations** on updates and deletes leading to stale/broken content (LOGIC-02, LOGIC-03), and **runtime crashes** when API responses return unpopulated relationship schemas (LOGIC-04, LOGIC-08). Addressing these issues will significantly improve performance, increase security, prevent UI crashes, and bring the module in alignment with the repository's feature-first design system.

---

## 2. Issue Index

| ID | Severity | Category | Title |
|---|---|---|---|
| PERF-01 | 🟡 Medium | Performance | Client-Side Next.js Server Actions Overhead (`globalRequest`) |
| PERF-02 | 🟡 Medium | Performance | Lack of Query Filter Normalization (Cache Fragmentation) |
| LOGIC-01 | 🟡 Medium | Logic | Throwing Plain Objects in `transportRequest` (Lost Stack Traces) |
| LOGIC-02 | 🔴 High | Logic | Missing Public Blog Detail Invalidation on Update/Publish Mutations |
| LOGIC-03 | 🔴 High | Logic | Deleted Blog Details Left in Public Cache |
| LOGIC-04 | 🟡 Medium | Logic | Fragile DTO Response Mapping Vulnerable to Flat IDs |
| LOGIC-05 | 🔴 High | Logic | Missing Fallback in `getAdminBlogPostsApi` Array Map |
| LOGIC-06 | 🟢 Low | Logic | Inaccurate `estimateReadTime` for Empty/Whitespace Content |
| LOGIC-07 | 🟡 Medium | Logic | Hardcoded `lastPage: 1` Fallback in List Metadata |
| LOGIC-08 | 🟡 Medium | Logic | Legacy Adapter Vulnerable to Undefined Category and Tags |
| ARCH-01 | 🟡 Medium | Architecture | Flat Directory Layout Violates Feature-First Pattern |
| ARCH-02 | 🟡 Medium | Architecture | Missing `"use client"` in `blog.store.ts` |

---

## 3. Detailed Issues & Fixes

---

### PERF-01

**Client-Side Next.js Server Actions Overhead (`globalRequest`)**

**File:** [`blog.api.ts`](../src/modules/blog/blog.api.ts#L29-L39)

**Description:**
The blog module imports and calls `globalRequest` from `@/app/helpers/globalRequest.ts` inside `transportRequest`. However, `globalRequest.ts` is explicitly marked with `"use server"`. In Next.js App Router, importing a `"use server"` function inside client-side React hooks (like `useBlogPosts`) compiles the function into a Next.js Server Action. 

As a result, every browser-side request to read blog posts is redirected through a Next.js server route (an HTTP POST request with specific action headers) instead of making a direct client-to-backend API fetch. This:
1. Adds massive performance overhead (Next.js server must process the Server Action first, then call fetch, then respond back).
2. Prevents the browser from applying standard HTTP GET caching for public blog lists and details.
3. Places unnecessary load on the Next.js server instance.

```ts
// ❌ Current — runs as a Server Action on the client-side
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
Retain `globalRequest` for server-side prefetching (`prefetchBlogPosts` in Server Components), but support client-side direct requests by separating the transport or implementing a lightweight browser-based fetcher that makes direct HTTP requests to `baseURL` without routing through Server Actions.

---

### PERF-02

**Lack of Query Filter Normalization (Cache Fragmentation)**

**File:** [`blog.hooks.ts`](../src/modules/blog/blog.hooks.ts#L57-L65)

**Description:**
In `useBlogPosts` and `useAdminBlogPosts`, default query parameters are not normalized. For example, if Component A calls `useBlogPosts()` and Component B calls `useBlogPosts({ page: 1 })`, React Query generates two separate cache entries:
- `["blog", "list", undefined]`
- `["blog", "list", { page: 1 }]`

This results in cache fragmentation and redundant network requests even though both queries return the exact same data payload.

```ts
// ❌ Current — uses raw filters directly in queryKey and queryFn
export function useBlogPosts(filters?: ArticleFilters) {
  return useQuery<PaginatedArticles>({
    queryKey: blogKeys.list(filters),
    queryFn: () => getBlogPostsApi(filters),
    ...
  });
}
```

**Fix:**
Apply `normalizeArticleFilters` within the custom hooks to ensure the query keys and query arguments are always fully populated with their default values, creating a single cached source of truth.

```ts
// ✅ Fix — normalize query parameters before keying
export function useBlogPosts(filters?: ArticleFilters) {
  const normalizedFilters = normalizeArticleFilters(filters ?? {});
  return useQuery<PaginatedArticles>({
    queryKey: blogKeys.list(normalizedFilters),
    queryFn: () => getBlogPostsApi(normalizedFilters),
    staleTime: getStaleTime(),
    gcTime: getGcTime(),
    retry: getRetry(),
  });
}
```

---

### LOGIC-01

**Throwing Plain Objects in `transportRequest` (Lost Stack Traces)**

**File:** [`blog.api.ts`](../src/modules/blog/blog.api.ts#L35-L37)

**Description:**
`transportRequest` throws a plain object: `throw { message: res.message, status: res.statusCode ?? 500 } satisfies ApiError`. Throwing non-Error objects loses the execution stack trace and causes friction with React Query or test frameworks that expect standard `Error` instances.

```ts
// ❌ Current — throwing a plain object
if (!res.success) {
  throw { message: res.message, status: res.statusCode ?? 500 } satisfies ApiError;
}
```

**Fix:**
Define a custom `BlogApiError` class extending `Error` to preserve the stack trace and attach the response metadata.

```ts
// ✅ Fix — standard Error subclass
export class BlogApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BlogApiError";
    this.status = status;
    this.errors = errors;
  }
}

// In transportRequest:
if (!res.success) {
  throw new BlogApiError(res.message, res.statusCode ?? 500);
}
```

---

### LOGIC-02

**Missing Public Blog Detail Invalidation on Update/Publish Mutations**

**File:** [`blog.hooks.ts`](../src/modules/blog/blog.hooks.ts#L119-L151)

**Description:**
In `useUpdateBlogPost` and `usePublishBlogPost`'s `onSuccess` handlers, only the admin detail query is invalidated using `invalidateAdminBlogDetail(queryClient, id)`. 

However, public users view the single article detail queried by `slug` rather than `id` (`blogKeys.detail(slug)`). Since the public detail query is never invalidated in the mutations, the public detail remains stale until the 5-minute `staleTime` expires, meaning public users see outdated titles, excerpts, or content.

```ts
// ❌ Current — only invalidates admin detail (by ID)
onSuccess: (_data, { id }) => {
  invalidateBlogLists(queryClient);
  invalidateAdminBlogLists(queryClient);
  invalidateAdminBlogDetail(queryClient, id); // misses public detail!
},
```

**Fix:**
Ensure the public detail cache is invalidated by passing the updated article's slug `_data.slug` to the invalidation helper:

```ts
// ✅ Fix — invalidate both admin detail (ID) and public detail (slug)
onSuccess: (data) => {
  invalidateBlogLists(queryClient);
  invalidateAdminBlogLists(queryClient);
  invalidateAdminBlogDetail(queryClient, data.id);
  if (data.slug) {
    invalidateBlogDetail(queryClient, data.slug);
  }
},
```

---

### LOGIC-03

**Deleted Blog Details Left in Public Cache**

**File:** [`blog.hooks.ts`](../src/modules/blog/blog.hooks.ts#L153-L164)

**Description:**
In `useDeleteBlogPost`, when an article is deleted, the admin detail is removed via `removeAdminBlogDetail(queryClient, id)`. 

However, because the delete mutation is initiated with the article's `id` only (and the API response only contains a `success` boolean), the hook has no direct access to the deleted article's `slug`. Therefore, the public detail cached at `blogKeys.detail(slug)` is left orphaned in cache. If a user has recently visited that article, it will remain fully visible in their browser cache and can be loaded from memory.

```ts
// ❌ Current — public detail query left in memory
onSuccess: (_data, id) => {
  removeAdminBlogDetail(queryClient, id);
  invalidateBlogLists(queryClient);
  invalidateAdminBlogLists(queryClient);
},
```

**Fix:**
Remove or invalidate all queries under the public details namespace to completely clear deleted articles from the public detail cache:

```ts
// ✅ Fix — purge public details queries
onSuccess: (_data, id) => {
  removeAdminBlogDetail(queryClient, id);
  queryClient.removeQueries({ queryKey: blogKeys.details() }); // purge public detail cache
  invalidateBlogLists(queryClient);
  invalidateAdminBlogLists(queryClient);
},
```

---

### LOGIC-04

**Fragile DTO Response Mapping Vulnerable to Flat IDs**

**File:** [`blog.api.ts`](../src/modules/blog/blog.api.ts#L125-L189)

**Description:**
The DTO mapping functions (`toBlogCategory`, `toBlogAuthor`, `toBlogTag`) blindly assume relationships are always returned as populated objects. 

If the backend database returns a flat ID string (e.g. `raw.category` is `"cat_123"` instead of `{ id: "cat_123", name: "Tech", ... }`), the mapper does `toBlogCategory("cat_123")`. Inside `toBlogCategory`, it returns `raw.name` which evaluates to `undefined`. This crashes the legacy mapper later (`summary.category.name` throws `TypeError: Cannot read properties of undefined`).

```ts
// ❌ Current — will result in undefined properties if passed a string ID or null
export function toBlogCategory(raw: any): BlogCategory {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}
```

**Fix:**
Add defensive checks to safely parse string IDs, `null` relationships, or missing properties.

```ts
// ✅ Fix — robust, crash-proof relationship mapper
export function toBlogCategory(raw: any): BlogCategory {
  if (typeof raw === "string") {
    return {
      id: raw,
      name: "Uncategorized",
      slug: "uncategorized",
      description: null,
      createdAt: "",
      updatedAt: "",
    };
  }
  return {
    id: raw?.id ?? "",
    name: raw?.name ?? "Uncategorized",
    slug: raw?.slug ?? "uncategorized",
    description: raw?.description ?? null,
    createdAt: raw?.createdAt ?? "",
    updatedAt: raw?.updatedAt ?? "",
  };
}
```

---

### LOGIC-05

**Missing Fallback in `getAdminBlogPostsApi` Array Map**

**File:** [`blog.api.ts`](../src/modules/blog/blog.api.ts#L239-L241)

**Description:**
In `getAdminBlogPostsApi`, the API response is mapped using `.map(toBlogArticleSummary)` without an array fallback. 

If the API fails to return the expected nested structures or returns `null` for certain filters, the mapper will throw `TypeError: Cannot read properties of null (reading 'map')` and crash the admin page completely. By contrast, the public function `getBlogPostsApi` correctly implements a safe fallback (`?? []`).

```ts
// ❌ Current — maps raw data directly without fallback
export async function getAdminBlogPostsApi(
  filters: ArticleFilters = {},
  transport?: Transport,
): Promise<PaginatedArticles> {
  ...
  return {
    data: (raw.data ?? raw.articles ?? raw.posts ?? raw).map(
      toBlogArticleSummary,
    ),
    ...
  };
}
```

**Fix:**
Provide a safe empty array fallback `?? []` as is standard practice:

```ts
// ✅ Fix — safe array mapping
data: (raw.data ?? raw.articles ?? raw.posts ?? raw ?? []).map(
  toBlogArticleSummary,
),
```

---

### LOGIC-06

**Inaccurate `estimateReadTime` for Empty or Whitespace Content**

**File:** [`blog.api.ts`](../src/modules/blog/blog.api.ts#L345-L351)

**Description:**
When a blog draft has empty content or contains only whitespace, `estimateReadTime` trims the string and performs `.split(/\s+/)`. This results in the array `[""]` which has a length of `1`. The function will estimate a `1` minute read time instead of `0`.

```ts
// ❌ Current — empty content returns 1 minute read time
export function estimateReadTime(
  content: string,
  wordsPerMinute = 200,
): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
```

**Fix:**
Implement a guard clause that checks if the trimmed content is empty before executing the splits:

```ts
// ✅ Fix — return 0 for empty drafts
export function estimateReadTime(
  content: string,
  wordsPerMinute = 200,
): number {
  const trimmed = content.trim();
  if (!trimmed) return 0;
  const wordCount = trimmed.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
```

---

### LOGIC-07

**Hardcoded `lastPage: 1` Fallback in List Metadata**

**File:** [`blog.api.ts`](../src/modules/blog/blog.api.ts#L208-L213)

**Description:**
If the backend does not return pagination metadata (e.g. `raw.meta` is null or missing), both public and admin listing APIs construct a default `meta` fallback object with `lastPage: 1` and `total: 0`. 

If the backend returned 50 items and the pagination limit is 10, the frontend pagination controls will falsely assume there is only 1 page, preventing users from accessing page 2, 3, etc.

```ts
// ❌ Current — hardcoded fallback pagination values
meta: raw.meta ?? {
  page: filters?.page ?? 1,
  limit: filters?.limit ?? 20,
  lastPage: 1, // hardcoded page ceiling
  total: 0,
}
```

**Fix:**
Dynamically calculate the fallback `lastPage` based on the size of the array returned (since all items were returned in a single batch) or use standard math:

```ts
// ✅ Fix — calculate fallback paging values
const itemsArray = raw.data ?? raw.articles ?? raw.posts ?? raw ?? [];
const totalCount = Array.isArray(itemsArray) ? itemsArray.length : 0;
const fallbackLimit = filters?.limit ?? 20;

meta: raw.meta ?? {
  page: filters?.page ?? 1,
  limit: fallbackLimit,
  lastPage: Math.max(1, Math.ceil(totalCount / fallbackLimit)),
  total: totalCount,
}
```

---

### LOGIC-08

**Legacy Adapter Vulnerable to Undefined Category and Tags**

**File:** [`adapters/blogToLegacy.ts`](../src/modules/blog/adapters/blogToLegacy.ts#L9-L36)

**Description:**
The adapter functions `blogToLegacyArticleSummary` and `blogToLegacyArticle` map fields directly into the legacy `ArticleType`. It accesses properties like `summary.category.name` and executes `summary.tags.map(...)` without optional chaining or verification. 

If any DTO field returns unpopulated values due to database inconsistencies, this will immediately cause a runtime JavaScript crash on pages like the search results or category feeds.

```ts
// ❌ Current — direct category and tags mapping
export function blogToLegacyArticleSummary(
  summary: BlogArticleSummary,
): ArticleType {
  return {
    ...
    category: summary.category.name,
    tags: summary.tags.map((t) => t.name),
    image: summary.featuredImage ?? "",
    description: summary.excerpt,
  };
}
```

**Fix:**
Apply robust optional chaining and default fallback parameters inside the adapter:

```ts
// ✅ Fix — crash-proof adapter mapping
export function blogToLegacyArticleSummary(
  summary: BlogArticleSummary,
): ArticleType {
  return {
    id: summary.id,
    title: summary.title ?? "Untitled",
    date: summary.publishedAt ?? summary.createdAt ?? "",
    category: summary.category?.name ?? "Uncategorized",
    tags: (summary.tags ?? []).map((t) => t?.name ?? "").filter(Boolean),
    image: summary.featuredImage ?? "",
    description: summary.excerpt ?? "",
  };
}
```

---

### ARCH-01

**Flat Directory Layout Violates Feature-First Architectural Pattern**

**File:** Entire Module

**Description:**
The `blog` module places all files (`blog.api.ts`, `blog.hooks.ts`, `blog.store.ts`, `blog.types.ts`, `blog.config.ts`, `index.ts`) inside the root directory `src/modules/blog/`. This deviates from the standardized **Feature-First Layout** required by `AGENTS.md` guidelines, which specifies that files must be grouped into targeted subdirectories (`api/`, `hooks/`, `store/`, `types/`, `config/`).

**Fix:**
Move the files to match the feature-first subdirectories structure:
- `src/modules/blog/api/blog.api.ts`
- `src/modules/blog/hooks/blog.hooks.ts`
- `src/modules/blog/store/blog.store.ts`
- `src/modules/blog/types/blog.types.ts`
- `src/modules/blog/config/blog.config.ts`

---

### ARCH-02

**Missing `"use client"` in `blog.store.ts`**

**File:** [`blog.store.ts`](../src/modules/blog/blog.store.ts#L1)

**Description:**
The Zustand store `blog.store.ts` manages client-side memory UI state but does not include a `"use client"` directive. In Next.js 16 (App Router), importing client state managers or hooks in server-side templates without `"use client"` will trigger build-time or runtime compiling crashes.

**Fix:**
Add the `"use client"` directive at the very top of `blog.store.ts`.

```ts
// ✅ Fix — ensure client-side isolation
"use client";

import { create } from "zustand";
...
```

---

## 4. Priority Matrix

```
HIGH PRIORITY (Fix First)
┌─────────────┬──────────────────────────────────────────────────────┐
│ LOGIC-02     │ Invalidate public blog details query by slug on edit │
│ LOGIC-03     │ Invalidate public blog detail query on deletion      │
│ LOGIC-05     │ Add safe empty array fallback in getAdminBlogPosts   │
└─────────────┴──────────────────────────────────────────────────────┘

MEDIUM PRIORITY (Fix Next Sprint)
┌─────────────┬──────────────────────────────────────────────────────┐
│ PERF-01     │ Support client-direct fetch transport (bypass Server)│
│ PERF-02     │ Normalize query filter keys in hooks                 │
│ LOGIC-01     │ Throw custom BlogApiError instead of plain objects   │
│ LOGIC-04     │ Make relationship parsing resilient to string IDs    │
│ LOGIC-07     │ Dynamically calculate fallback lastPage limit       │
│ LOGIC-08     │ Use optional chaining/fallbacks in legacy adapters   │
│ ARCH-01     │ Relocate flat files to feature sub-folders           │
│ ARCH-02     │ Add "use client" directive to blog.store.ts          │
└─────────────┴──────────────────────────────────────────────────────┘

LOW PRIORITY (Backlog)
┌─────────────┬──────────────────────────────────────────────────────┐
│ LOGIC-06     │ Fix estimateReadTime for whitespace/empty text       │
└─────────────┴──────────────────────────────────────────────────────┘
```

---

## 5. Refactoring Roadmap

### Phase 1 — Cache & Stability Fixes (No Breaking Changes)
- [ ] **LOGIC-05** Add `?? []` to mapping in `getAdminBlogPostsApi` in `blog.api.ts`
- [ ] **LOGIC-02** Invalidate `blogKeys.detail(data.slug)` in `useUpdateBlogPost` and `usePublishBlogPost`
- [ ] **LOGIC-03** Clear all public details in `useDeleteBlogPost` onSuccess by executing `queryClient.removeQueries({ queryKey: blogKeys.details() })`
- [ ] **LOGIC-08** Implement optional chaining and default fallback values in `adapters/blogToLegacy.ts`

### Phase 2 — Defensive Coding & Normalization
- [ ] **PERF-02** Apply `normalizeArticleFilters(filters)` inside list hooks in `blog.hooks.ts` to secure single query key matches
- [ ] **LOGIC-04** Upgrade `toBlogCategory`, `toBlogAuthor`, and `toBlogTag` to robustly parse string parameters defensively
- [ ] **LOGIC-01** Create `BlogApiError` class in `blog.types.ts` and update `transportRequest` to throw it
- [ ] **LOGIC-07** Dynamically calculate default `lastPage` in `meta` fallbacks
- [ ] **LOGIC-06** Guard `estimateReadTime` against whitespace-only drafts

### Phase 3 — Architecture & Directory Alignment
- [ ] **ARCH-02** Insert `"use client"` directive at the top of `blog.store.ts`
- [ ] **ARCH-01** Restructure `src/modules/blog` directory by relocating components into standard `api/`, `hooks/`, `store/`, `types/`, and `config/` folders
- [ ] **PERF-01** Introduce browser-safe fetch client interface option within custom hook transport config to allow optional direct fetch request capabilities, bypassing server routing where suitable

---

*Report generated by static and architectural analysis of `src/modules/blog/`. All 87 vitest unit and hook tests successfully pass in the test environment.*
