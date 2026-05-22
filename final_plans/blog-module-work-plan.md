# Blog Module Work Plan

> **Role:** Senior Frontend Architect  
> **Source:** `integrations_plans/blog-integration-plan.md`  
> **Target Stack:** Next.js 16 (App Router) · React 19 · TypeScript · TanStack React Query · Axios  
> **Scope:** Logic only, reusable module, no UI implementation  
> **Created:** 2026-05-22  
> **Revised:** 2026-05-22  
> **Status:** Refined for portable module delivery

---

## 1. Objective

Turn the blog feature into a reusable, headless module that can be copied into another Next.js project and used with that project’s own UI layer.

The module must:

- own all blog data access, caching, query state, and business rules
- stay independent from route files, styling, and visual components
- expose a stable public API through a single module entry point
- support both public and admin blog workflows
- remain compatible with Next.js App Router and React Server Components

The module must not:

- contain UI implementation
- depend on a specific app route structure
- read auth tokens from browser storage
- assume a fixed project alias or a specific root folder beyond its own module boundary

---

## 2. Problems This Plan Must Eliminate

### 2.1 UI Leakage Into the Module

The previous plan mixed business logic with visual components, page compositions, and layout concerns.

Fix:

- remove all UI-specific requirements from the module plan
- keep rendering decisions in the consuming project
- expose logic primitives only: hooks, query options, services, DTOs, and helpers

### 2.2 App Router Coupling

The previous plan assumed route shells and page files lived beside the module.

Fix:

- keep the module route-agnostic
- let the host app own `app/` files, metadata, and route composition
- provide optional SSR prefetch helpers that the host can call from its own route files

### 2.3 Hardcoded Environment and Transport Assumptions

The previous plan depended on a single `NEXT_PUBLIC_API_URL` style assumption and a fixed Axios setup.

Fix:

- use a configurable client factory
- accept runtime configuration from the host project
- keep defaults safe but overridable

### 2.4 Unsafe Auth Handling

The previous plan discussed token access patterns that are not suitable for HttpOnly-cookie auth.

Fix:

- use `withCredentials: true` for cookie-based requests when the backend requires it
- do not read access tokens from `localStorage` or client-readable cookies
- allow optional CSRF/header injection only through host-provided config

### 2.5 Zustand or Extra Client State for Server Data

Blog content is mostly server-driven data. Duplicating that state in a separate store would add unnecessary complexity.

Fix:

- use TanStack React Query for server state
- keep local UI state outside the module and inside the host UI when needed
- avoid introducing Zustand for blog data

### 2.6 Weak Runtime Boundaries

The previous plan used `any` in mutation payloads and left response shape assumptions too loose.

Fix:

- define explicit DTOs for all public and admin operations
- normalize backend responses in one place
- validate or assert payload shape at the module boundary

---

## 3. Module Contract

The blog module is a headless feature package. It should be copied into a project as a folder and consumed through its public exports.

### 3.1 What the Module Owns

- API transport
- endpoint functions
- typed DTOs and response contracts
- query keys and query options
- React Query hooks
- data normalization and mapping
- pagination/filter helpers
- error normalization
- SSR prefetch helpers
- cache invalidation rules

### 3.2 What the Host App Owns

- all UI components
- route files in `app/`
- page metadata
- form layout and styling
- navigation and router wiring
- visual loading and error presentation
- integration with the host app’s query provider setup

### 3.3 Public Export Rule

The module should expose a small stable surface from `index.ts`.

Recommended exports:

- types and DTOs
- query keys
- hooks
- service/SSR/filter helpers (from `blog.api.ts`)

Do not expose implementation internals unless they are required by the host app.

---

## 4. Recommended Folder Architecture

The module should live under a single folder and remain internally self-contained.

```txt
blog/
├── blog.api.ts      # API + config + services + filters + SSR + utils
├── blog.hooks.ts    # All React Query hooks
├── blog.store.ts    # Optional local UI state
├── blog.types.ts    # All types, DTOs, contracts
└── index.ts         # Public exports
```

**1 folder. 5 files. One job.**

### 4.1 `blog.types.ts` — All Types & Contracts

Purpose:

- entity types (Article, Category, Tag)
- DTOs for create/update/list/detail/publish/delete flows
- pagination contracts, error contracts
- request and response shapes
- filter query types

Rules:

- keep the shapes precise
- avoid `any`
- separate backend DTOs from UI-ready domain shapes when needed
- use `string` for UUIDs and ISO timestamps

### 4.2 `blog.api.ts` — API + Config + Services + Filters + Utils + SSR

Single file containing everything non-React:

**Config:**
- module configuration (base URL, auth options, query timing defaults)
- avoid hardcoded env variable dependency

**Axios client factory:**
- transport only
- supports `withCredentials` for cookie-based auth
- allows host to provide base URL and headers

**Endpoint functions:**
- public article list
- public article detail
- admin article list/detail
- create/update/publish/unpublish/delete article

**Services / normalization:**
- response normalization
- slug and tag helpers
- excerpt generation / read-time calculation
- date normalization / article state transformations

**Filters:**
- serialize and parse blog filters
- normalize search, page, sort, category, tag, and publication flags
- pure functions only, no `next/navigation`

**SSR helpers:**
- optional server-side prefetch helpers
- dehydration support for Next.js App Router
- no route files, no host app folder assumptions

### 4.3 `blog.hooks.ts` — All Hooks

Purpose:

- TanStack React Query hooks for public and admin operations
- optional headless helpers for filter state synchronization

Contained hooks:

- `useBlogPosts` — public list
- `useBlogPost` — public detail
- `useAdminBlogPosts` — admin list
- `useCreateBlogPost` — create mutation
- `useUpdateBlogPost` — update mutation
- `usePublishBlogPost` — publish/unpublish mutation
- `useDeleteBlogPost` — delete mutation
- Optional filter-state sync hook

Rules:

- hooks are for data and orchestration only
- any router interaction should be optional and host-controlled
- if a hook depends on `useSearchParams`/`useRouter`, mark it clearly as client-only

### 4.4 `blog.store.ts` — Optional Local UI State

Purpose:

- lightweight Zustand store for transient UI state (active filter, selected post, etc.)
- keep it optional — blog content is primarily server-driven via React Query

Rules:

- do not use as a second source of server truth
- keep minimal and focused on UI coordination only

### 4.5 `index.ts` — Public API Barrel

Exports hooks, types, query keys, and service helpers.

---

## 5. Data and Domain Design

### 5.1 Core Domain Objects

The module should define stable domain entities for:

- article
- category
- tag
- pagination metadata
- list and detail responses
- admin mutation responses
- normalized error objects

### 5.2 Public and Admin DTO Separation

Do not reuse the same loose type for all requests.

Separate DTO groups for:

- public listing queries
- article detail lookups
- admin listing queries
- create article payloads
- update article payloads
- publish/unpublish payloads
- delete operations

### 5.3 Response Normalization

Normalize all backend responses into a predictable module contract before they reach consuming UI.

The normalization layer should:

- coerce pagination metadata into a consistent shape
- convert nullable backend fields into stable domain values
- preserve backend identifiers and timestamps
- keep UI-facing data free of transport-specific details

### 5.4 Validation Boundary

Every mutation payload should be validated or asserted before it is sent.

The plan should include:

- field length checks
- required title/content checks
- publication-related constraints
- slug and tag normalization
- file metadata checks if the host app passes upload-related references through the module

---

## 6. API and Transport Strategy

### 6.1 Axios Client

The blog module should provide a configurable Axios client factory.

Requirements:

- support `withCredentials` for cookie-based auth
- allow the host app to provide base URL and headers
- allow request interceptors to be attached externally if needed
- keep the client reusable across public and admin requests

### 6.2 Endpoint Layer

Raw API functions should map one endpoint to one function.

Required groups:

- public article list
- public article detail
- admin article list
- create article
- update article
- publish/unpublish article
- delete article

Rules:

- no direct UI concerns
- no query caching logic here
- no router logic here

### 6.3 Error Normalization

All API failures should be normalized into a predictable error contract.

The error layer should distinguish:

- validation errors
- unauthorized errors
- forbidden errors
- not found errors
- network or timeout errors
- unknown backend errors

This keeps host UI error handling simple and consistent.

---

## 7. Query State and Caching Strategy

### 7.1 TanStack React Query Only

Use React Query for:

- server state
- request caching
- refetching
- optimistic mutation flows where appropriate
- invalidation after mutations

Do not introduce a second store for the same server data.

### 7.2 Query Key Factory

Define a single query key factory with clear scopes:

- all blog data
- public article lists
- public article details
- admin article lists
- admin article details
- category or tag-specific lookups if needed later

Rules:

- query keys must be stable and deterministic
- filter objects should be normalized before being used as keys

### 7.3 Hooks

Provide hooks for:

- public article list
- public article detail
- admin article list
- create article
- update article
- publish/unpublish article
- delete article

Optional:

- hook for filter parsing and serialization
- hook for query options if the host app wants to compose its own React Query usage

### 7.4 Cache Invalidation Matrix

Mutation invalidation should be explicit and minimal.

| Mutation | Invalidate |
|---|---|
| Create article | public list keys, admin list keys |
| Update article | public list keys, admin list keys, affected detail keys |
| Publish/unpublish | public list keys, admin list keys, affected detail keys |
| Delete article | public list keys, admin list keys, affected detail keys |

### 7.5 Freshness Rules

Use different staleness values by data sensitivity:

- public lists: shorter stale window
- public detail: medium stale window
- admin data: short stale window or always refetch after mutation

Keep these values configurable from the module config rather than hardcoded inside hooks.

---

## 8. Filter and Routing Boundary

### 8.1 Keep Router Logic Outside the Module

The module should not assume a specific route structure.

Instead, it should provide pure helpers for:

- parse filters from a query string
- serialize filters into a query string
- reset page when search or category filters change
- normalize sort order and page size

### 8.2 Optional Client Hook

If the host app wants a convenience hook for `useSearchParams` and `useRouter`, it should be clearly isolated and marked as client-only.

Rules:

- client-only helpers must not leak into server-only code paths
- if the module can avoid router dependency entirely, prefer pure functions instead

---

## 9. Next.js Compatibility Rules

### 9.1 Server and Client Boundaries

Keep the module compatible with App Router by respecting the server/client split.

Rules:

- pure services, contracts, and API functions stay server-safe
- React hooks live in client components only
- SSR helpers must not import browser-only APIs

### 9.2 Route Shell Responsibility

The host app’s route files should only:

- read params or search params
- call SSR prefetch helpers if needed
- provide metadata
- render the host UI using module hooks or prefetched data

The module itself should not contain route files.

### 9.3 Hydration Support

Provide helpers that make hydration predictable when the host wants server-prefetched blog data.

Rules:

- keep dehydration helper functions generic
- do not depend on a specific route segment name
- keep query client usage consistent with TanStack React Query

---

## 10. Security and Auth Rules

### 10.1 Cookie-Based Auth

If the backend uses HttpOnly cookies, the module should rely on them through `withCredentials`.

Rules:

- do not read authentication tokens from JavaScript storage
- do not require client-side token injection
- do not bake auth secrets into the module

### 10.2 CSRF Considerations

If the backend requires CSRF protection for mutations, the module should support an external header provider or request interceptor supplied by the host app.

Rules:

- keep CSRF strategy configurable
- do not hardcode one protection mechanism unless the backend contract requires it

### 10.3 Input Safety

Mutation payloads and filter values should be normalized before use.

Rules:

- trim user-input text where appropriate
- sanitize or encode only at the boundary where necessary
- never trust raw query values without normalization

---

## 11. Implementation Phases

### Phase 1: Contracts and Configuration

Deliverables:

- domain types
- DTOs
- pagination contract
- error contract
- module config contract
- query key design

Acceptance criteria:

- no `any` in public contracts
- public and admin shapes are separated
- module exports are stable

### Phase 2: Transport and API Layer

Deliverables:

- configurable Axios client
- raw endpoint functions
- transport error normalization

Acceptance criteria:

- requests work with cookie auth
- no hardcoded route dependency
- no storage-based token access

### Phase 3: Services and Normalization

Deliverables:

- response normalization
- filter serializer/parser
- pagination helpers
- article metadata helpers
- read-time and excerpt helpers

Acceptance criteria:

- host UI receives consistent domain data
- backend quirks are hidden behind the service layer

### Phase 4: Query Hooks and Cache Control

Deliverables:

- React Query hooks
- query keys
- invalidation strategy
- optional filter-state helper

Acceptance criteria:

- create/update/publish/delete flows invalidate the right data
- list/detail freshness is predictable
- hooks are usable from host UI without extra wrappers

### Phase 5: SSR Integration Helpers

Deliverables:

- prefetch helpers
- dehydration helpers
- host-friendly server integration API

Acceptance criteria:

- host route files can prefetch blog data without the module owning any route logic
- hydration works cleanly in App Router

### Phase 6: Test Coverage and Hardening

Deliverables:

- unit tests for services and helpers
- API tests with mocked Axios
- React Query behavior tests
- SSR helper tests where applicable

Acceptance criteria:

- filter parsing is deterministic
- cache invalidation is correct
- error normalization is stable
- no UI-specific assumptions are required for the tests

---

## 12. Verification Checklist

- Confirm the module does not contain UI, styling, or route files.
- Confirm all public exports come from a single module entry point.
- Confirm the Axios client supports cookie-based auth through `withCredentials`.
- Confirm no token is read from client storage.
- Confirm DTOs are explicit and `any` is removed from public operations.
- Confirm React Query owns all blog server state.
- Confirm query keys are deterministic and normalized.
- Confirm mutation invalidation covers list and detail views.
- Confirm filter parsing and serialization are pure and router-agnostic.
- Confirm SSR helpers are optional and do not depend on a specific route segment.
- Confirm the module can be copied into another Next.js project and wired to that project’s UI without rewriting business logic.

---

## 13. Final Delivery Standard

The final result should be a portable blog logic module that:

- can be dropped into another project as a folder
- exposes a small and stable public API
- keeps all visual concerns in the consuming app
- follows Next.js App Router boundaries
- uses React Query for server state and caching
- supports secure cookie-based auth
- remains easy to extend without becoming a framework

