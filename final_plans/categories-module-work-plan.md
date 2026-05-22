# Categories Module Work Plan

> **Source:** `integrations_plans/categories-integration-plan.md`
> **Target:** Portable Next.js category module
> **Frontend stack:** Next.js 16 (App Router) · React 19 · TypeScript · React Query · optional Zustand only for local client state
> **Created:** 2026-05-22
> **Status:** Draft

---

## Scope

This plan rewrites the current categories work into a **logic-only module** that can be copied into any Next.js project and consumed by that project's UI layer.

### What This Module Includes

- typed category domain models
- request/response contracts
- transport abstraction
- API functions for public and admin operations
- React Query keys, hooks, prefetch helpers, and cache invalidation
- pure helpers for slug, filter, and validation error handling
- optional local client state only if the host app needs it

### What This Module Does Not Include

- UI components
- pages or route files
- layout changes
- global provider wiring inside the host app
- app-specific context migration inside the module
- hardcoded references to this repository's `app/` tree

---

## Issues In The Current Draft And Required Fixes

| Problem in current draft | Why it is a problem | Plan fix |
|---|---|---|
| Mixes logic with UI pages/components | Makes the module hard to reuse in another project | Remove all UI/page tasks from the plan |
| Depends on `VariablesContext` and `DataContext` | Couples the module to this repo's current app architecture | Replace with module hooks and query keys only |
| Adds root layout/provider edits | A module should not force host app layout changes | Keep provider requirements external to the module |
| Assumes a shared axios singleton with token cookie knowledge | Hardcodes auth behavior and reduces portability | Introduce a transport adapter and auth injection contract |
| Treats API timestamps as `Date` | JSON over HTTP returns strings, not `Date` objects | Use ISO string timestamps in API types and normalize only when needed |
| Uses Zustand as the main store for server data | Server state is better handled by React Query in Next.js | Use React Query for fetch/mutation state; keep Zustand optional and local-only |
| References `app/`-specific file paths | Prevents the module from being moved into another project | Use a path-agnostic module tree such as `src/modules/categories/` |
| Hides cache policy inside mount-time initialization | Causes duplicate fetches and lifecycle coupling | Use query keys, prefetch helpers, and explicit cache invalidation |

---

## Recommended Module Shape

Recommended portable location:

```txt
src/modules/categories/
├── categories.api.ts   # transport + config + endpoints + query keys + constants + services + utils
├── categories.hooks.ts # useCategories, useCategory, useAdminCategories, useCategoryMutations, usePrefetchCategories
├── categories.store.ts # optional local UI state
├── categories.types.ts # all types (domain + DTO + query + error)
└── index.ts            # public exports
```

**1 folder. 5 files. One job.**

---

## Phase 0 — Module Contract And Boundaries

**Goal:** define the module as a drop-in logic package with no UI coupling.

### Tasks

| # | Task | Details |
|---|---|---|
| 0.1 | Define the module entry surface | Export everything needed from `index.ts` so the host app can import from one place |
| 0.2 | Define host-app responsibilities | The host app provides React Query's `QueryClientProvider` and its own UI; the module does not modify layout files |
| 0.3 | Define transport injection | Use a transport interface so the module can work with axios, fetch, or any compatible client |
| 0.4 | Define auth injection | Do not hardcode cookie names, token names, or env keys inside the module; accept an auth header provider or preconfigured transport |
| 0.5 | Define server-state strategy | Use React Query for all category read and mutation state; do not use a global fetch-on-mount store for category data |
| 0.6 | Define module invariants | No `window`, `document`, or repo-specific `app/*` imports inside the core module |

### Deliverables

- module boundary document
- transport contract
- export surface contract

---

## Phase 1 — Types And Normalization

**Goal:** define strict types for API payloads, domain models, and validation errors.

### Tasks

| # | Task | Details |
|---|---|---|
| 1.1 | Create category read model types | Define `Category` and `CategoryDetails` with timestamps as ISO strings, not `Date` |
| 1.2 | Create category write DTO types | Define `CreateCategoryInput`, `UpdateCategoryInput`, and `ReorderCategoriesInput` |
| 1.3 | Create query types | Define `CategoryFilters`, `CategorySortField`, `SortOrder`, and pagination input types |
| 1.4 | Create response wrapper types | Define `PaginatedCategories`, `DeleteCategoryResult`, and other API response envelopes |
| 1.5 | Create error types | Define `ApiError`, validation field error maps, and backend error payload shapes |
| 1.6 | Create normalization types | Define internal normalized shapes only if the API response needs transformation |
| 1.7 | Keep response and input types separate | Do not mix backend read models with mutation input DTOs |

### Required Type Rules

- use `string` for API timestamps
- use narrow unions for `sortBy` and `sortOrder`
- keep `slug` required on read models and optional only on create input if the backend auto-generates it
- keep `id` as a stable string identifier
- keep pagination metadata explicit

### Deliverables

- `src/modules/categories/categories.types.ts` (all type definitions in one file)

---

## Phase 2 — Transport And Error Handling

**Goal:** isolate HTTP concerns so the module is portable across projects and auth strategies.

### Tasks

| # | Task | Details |
|---|---|---|
| 2.1 | Define a transport interface | Create a small interface that exposes `get`, `post`, `patch`, and `delete` with typed generics |
| 2.2 | Add an axios adapter only as an adapter | If the host app uses axios, provide an adapter around its own axios instance instead of importing project-specific helpers |
| 2.3 | Support auth without hardcoding cookies | Accept a token/header provider from the host app when authenticated requests are needed |
| 2.4 | Normalize transport errors | Convert backend failures into a consistent `ApiError` shape before exposing them to hooks |
| 2.5 | Parse validation errors | Convert backend validation arrays into a `field -> message` map for forms and mutation consumers |
| 2.6 | Keep public requests auth-optional | Public category reads must still work when no auth token is present |

### Best-Practice Rules

- keep transport code isolated from React hooks
- do not read browser cookies directly from shared module code
- do not assume a single base URL env name inside the module
- do not depend on repo-local `app/helpers/axios.ts`

### Deliverables

- `src/modules/categories/categories.api.ts` (transport + error parsing + utils combined)

---

## Phase 3 — API Functions And Query Keys

**Goal:** define the raw category operations and stable cache keys before building hooks.

### Tasks

| # | Task | Details |
|---|---|---|
| 3.1 | Define endpoint constants | Store all public and admin endpoint paths in one place |
| 3.2 | Define query key factory | Provide stable keys for list, detail, admin list, admin detail, and mutation scopes |
| 3.3 | Implement public list request | Fetch the category collection used by the host UI |
| 3.4 | Implement public detail request | Fetch a category by slug for detail use cases |
| 3.5 | Implement admin list request | Fetch paginated, searchable, sortable admin data |
| 3.6 | Implement admin detail request | Fetch a single category by id for editing and inspection |
| 3.7 | Implement create request | Send category creation payloads with typed inputs |
| 3.8 | Implement update request | Send partial update payloads with typed inputs |
| 3.9 | Implement delete request | Delete a category and return a typed result |
| 3.10 | Implement reorder request | Send the full ordered list required by the backend |
| 3.11 | Add response mappers | Normalize raw API objects into the module's domain types when needed |

### Cache Rules

- use one query key factory for all category operations
- separate public keys from admin keys
- treat slug and id as distinct cache dimensions
- keep mutation invalidation explicit and local to the relevant keys

### Deliverables

- `src/modules/categories/categories.api.ts` (endpoints + keys + requests + mutations combined)

---

## Phase 4 — React Query Hooks

**Goal:** expose reusable hooks for consuming the module in any Next.js UI.

### Tasks

| # | Task | Details |
|---|---|---|
| 4.1 | Build public list hook | `useCategories` should wrap the list query with stable defaults |
| 4.2 | Build public detail hook | `useCategory` should fetch by slug and stay disabled when slug is empty |
| 4.3 | Build admin list hook | `useAdminCategories` should accept filter input and keep pagination typed |
| 4.4 | Build admin detail hook | `useAdminCategory` should fetch by id and stay disabled when id is missing |
| 4.5 | Build create mutation hook | `useCreateCategoryMutation` should invalidate the relevant category queries on success |
| 4.6 | Build update mutation hook | `useUpdateCategoryMutation` should invalidate list and detail keys on success |
| 4.7 | Build delete mutation hook | `useDeleteCategoryMutation` should invalidate list and related detail keys on success |
| 4.8 | Build reorder mutation hook | `useReorderCategoriesMutation` should invalidate the ordered category lists on success |
| 4.9 | Build prefetch helpers | Provide server/client prefetch helpers for Next.js App Router usage without forcing module-owned providers |
| 4.10 | Add sane cache defaults | Use `staleTime`, `gcTime`, and `retry` values that fit category data stability |

### Hook Rules

- hooks are client-only
- pure request functions stay outside React
- mutations must invalidate query keys explicitly
- no hook should depend on host UI structure
- no hook should require a global categories store

### Deliverables

- `src/modules/categories/categories.hooks.ts` (all hooks in one file)

---

## Phase 5 — Pure Helpers And Optional Local State

**Goal:** keep all reusable logic pure and avoid putting server data into a global client store.

### Tasks

| # | Task | Details |
|---|---|---|
| 5.1 | Add slug helpers | Normalize and validate category slugs consistently across create and update paths |
| 5.2 | Add query serialization helpers | Build URL query strings for page, limit, search, sortBy, and sortOrder |
| 5.3 | Add domain normalization helpers | Convert API objects into stable domain objects when the backend response is inconsistent |
| 5.4 | Add optional local selection state only if needed | If the host UI needs local selection state, keep it separate from server cache and keep it lightweight |
| 5.5 | Add reusable invalidation helpers | Provide functions that centralize which category keys should be invalidated after each mutation |

### Rules

- pure helpers must not import React
- optional local state must not replace React Query for server data
- keep helpers framework-neutral where possible

### Deliverables

- `src/modules/categories/categories.api.ts` (slug helpers + query builders + normalizers + services)

---

## Phase 6 — Verification And Migration Notes

**Goal:** make the module safe to copy into another project and easy to verify.

### Tasks

| # | Task | Details |
|---|---|---|
| 6.1 | Add unit tests for pure helpers | Cover slugging, query serialization, normalization, and validation error parsing |
| 6.2 | Add query hook tests | Verify query keys, enabled conditions, and invalidation behavior with a mocked transport |
| 6.3 | Add contract tests for DTOs | Ensure create, update, reorder, and filter inputs stay aligned with backend expectations |
| 6.4 | Verify no host-app coupling remains | Confirm there are no imports from this repo's `app/context`, `app/layout`, or other app-specific files |
| 6.5 | Verify portability | Confirm the module can move to another Next.js project with only host-level provider wiring and import path updates |
| 6.6 | Document integration prerequisites | The host app must provide React Query and its own auth transport configuration if admin endpoints are used |

### Non-Goals

- no migration of `VariablesContext`
- no migration of `DataContext`
- no navbar, page, or component work
- no module-owned root layout edits
- no direct UI implementation details

### Deliverables

- test coverage for pure helpers and hooks
- integration checklist for host apps
- final portable module tree

---

## Reference Data Rules

| Field | Rule | Notes |
|---|---|---|
| `name` | required, max 100 | validate in DTOs and in mutation payloads |
| `slug` | lowercase, hyphenated, max 120 | may be auto-generated by the backend |
| `description` | optional | keep nullable in read models if backend returns null |
| `color` | optional hex | store as normalized `#RRGGBB` when provided |
| `icon` | optional, max 50 | keep as plain string and do not couple it to UI rendering |
| `order` | integer, minimum 0 | required for sorting and reorder operations |
| `page` | minimum 1 | used by admin list pagination |
| `limit` | minimum 1, maximum 100 | keep the query helper defensive |
| `sortBy` | `name`, `order`, `createdAt` | keep as a narrow union |
| `sortOrder` | `ASC`, `DESC` | keep as a narrow union |

---

## Dependency Graph

```txt
Phase 0 (Contract)
  └── Phase 1 (Types)
        └── Phase 2 (Transport + Errors)
              └── Phase 3 (API + Query Keys)
                    └── Phase 4 (React Query Hooks)
                          └── Phase 5 (Pure Helpers / Optional Local State)
                                └── Phase 6 (Verification / Migration Notes)
```

### Critical Path

```txt
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4
```

The highest-value deliverable is the hook and request surface in Phases 2-4. That gives the host app everything it needs to read, mutate, and cache categories without binding the module to any specific UI structure.

---

## Appendix — Portable File Tree

```txt
src/modules/categories/
├── categories.api.ts   # transport + config + endpoints + query keys + constants + services + utils
├── categories.hooks.ts # useCategories, useCategory, useAdminCategories, useCategoryMutations, usePrefetchCategories
├── categories.store.ts # optional local UI state
├── categories.types.ts # all types (domain + DTO + query + error)
└── index.ts            # public exports
```

