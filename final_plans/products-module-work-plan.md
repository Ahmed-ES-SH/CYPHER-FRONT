# Products Module — Logic-Only Work Plan

> **Source:** `integrations_plans/products-integration-plan.md`
> **Target:** Reusable product module that can be copied into any Next.js project and consumed by that project’s UI
> **Scope:** Logic only. No pages, no components, no styling, no layout work
> **Created:** 2026-05-22
> **Status:** Draft

---

## Purpose

This plan turns the current products work into a self-contained module focused on:

- domain types
- API transport
- pure transformation logic
- React Query hooks
- cache keys and invalidation rules
- validation and error normalization
- optional server-side helpers for Next.js
- migration off DummyJSON and other legacy product data flows

The module must be reusable as a folder in another project without depending on this app’s UI structure.

---

## Non-Goals

- No page routes
- No UI components
- No layout or breadcrumb work
- No Tailwind or visual design work
- No component-level shopping flow logic
- No hard dependency on this app’s global contexts
- No direct DummyJSON access from the module

Any visual rendering is left to the host application.

---

## Table of Contents

- [Phase 0 — Audit and Module Boundaries](#phase-0--audit-and-module-boundaries)
- [Phase 1 — Canonical Folder Structure](#phase-1--canonical-folder-structure)
- [Phase 2 — Domain Types and DTO Contracts](#phase-2--domain-types-and-dto-contracts)
- [Phase 3 — Transport Layer and API Client Factory](#phase-3--transport-layer-and-api-client-factory)
- [Phase 4 — Pure Transformers and Normalizers](#phase-4--pure-transformers-and-normalizers)
- [Phase 5 — API Functions](#phase-5--api-functions)
- [Phase 6 — React Query Keys and Hooks](#phase-6--react-query-keys-and-hooks)
- [Phase 7 — Error Handling, Validation, and Auth Rules](#phase-7--error-handling-validation-and-auth-rules)
- [Phase 8 — Next.js Compatibility and SSR Helpers](#phase-8--nextjs-compatibility-and-ssr-helpers)
- [Phase 9 — Migration and Host-App Cleanup](#phase-9--migration-and-host-app-cleanup)
- [Phase 10 — Tests, Exports, and Documentation](#phase-10--tests-exports-and-documentation)
- [Appendix — Expected Issues and Mitigations](#appendix--expected-issues-and-mitigations)
- [Appendix — Proposed Module Tree](#appendix--proposed-module-tree)

---

## Phase 0 — Audit and Module Boundaries

**Goal:** Define the contract for the module before moving logic.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 0.1 | Inventory current product dependencies | Identify every place where product data is read, transformed, cached, or mutated. Include legacy product types, fetch helpers, contexts, stores, and search/product-detail flows. | Migration inventory |
| 0.2 | Separate module concerns from host app concerns | Document what belongs inside the module and what must stay in the host UI layer. The module owns logic, not rendering. | Boundary rules |
| 0.3 | Decide the canonical module root | Use a portable folder such as `modules/products/` or `src/modules/products/`. Keep the module self-contained so it can be copied into another app with minimal changes. | Folder decision |
| 0.4 | Define host integration points | Specify what the host app must provide: `baseURL`, auth token getter if needed, and optional callbacks for unauthorized handling. Avoid hardcoding app env access inside the module. | Integration contract |
| 0.5 | Confirm backend contract sources | Lock the expected backend entity, pagination, filter params, and mutation responses so later hooks and transformers stay aligned with the API. | Contract checklist |

### Deliverables

- Migration inventory
- Module boundary notes
- Integration contract summary

---

## Phase 1 — Canonical Folder Structure

**Goal:** Set a feature-first structure that is portable and easy to import.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 1.1 | Define the module root | Use a single feature root for all product logic. Prefer a structure that works in Next.js but does not require UI files to live next to it. | Root path |
| 1.2 | Group logic by responsibility | Separate `api`, `hooks`, `services`, `transformers`, `types`, `constants`, `config`, `validators`, and `server` helpers. | Folder map |
| 1.3 | Add a single public entry point | Export stable module APIs from `index.ts` so host projects do not import deep internal paths. | Public entry |
| 1.4 | Keep the module framework-agnostic where possible | Only React Query hooks should depend on React. Pure functions and API helpers must be usable in non-UI scripts and server utilities. | Boundary rules |

### Recommended Structure

```txt
modules/products/
├── api/
├── config/
├── constants/
├── hooks/
├── services/
├── transformers/
├── types/
├── validators/
├── server/
└── index.ts
```

### Deliverables

- Agreed folder structure
- Public export surface plan

---

## Phase 2 — Domain Types and DTO Contracts

**Goal:** Define the product domain once and keep it consistent across reads and writes.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 2.1 | Define canonical product types | Create the domain model for product, category, dimensions, review, and product media. Use UUID strings for identifiers. | `types/product.types.ts` |
| 2.2 | Separate read and write shapes | Define read models, create DTOs, update DTOs, query DTOs, and mutation result types instead of relying on `Partial<T>` everywhere. | `types/product-dto.types.ts` |
| 2.3 | Keep computed fields explicit | Mark computed values such as discounted price and availability status as derived fields, not form inputs. | Type contracts |
| 2.4 | Make pagination explicit | Define page, limit, total, totalPages, and collection wrappers as reusable shared types. | Pagination types |
| 2.5 | Standardize query filters | Define a single filter model for search, category, price range, stock, publication state, sorting, and pagination. | Query types |

### Required Type Coverage

- `Product`
- `Category`
- `ProductDimensions`
- `ProductReview`
- `ProductMedia` or equivalent image model
- `CreateProductDto`
- `UpdateProductDto`
- `ProductQuery`
- `AdminProductQuery`
- `PaginatedResult<T>`
- `ApiError`
- `ValidationErrorItem`
- `MutationResult`
- `PublishToggleResult`

### Design Rules

- Use `string` for UUIDs, not numbers
- Keep nullable relations explicit
- Keep dates as ISO strings in transport types
- Keep backend-only fields separate from form input types
- Prefer narrow unions for status fields and sort fields

### Deliverables

- Complete type definitions
- A single source of truth for product domain shape

---

## Phase 3 — Transport Layer and API Client Factory

**Goal:** Build a reusable API layer that does not depend on the current app shell.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 3.1 | Create a module-scoped HTTP client factory | Build a factory that accepts `baseURL`, optional auth token provider, and optional error callback. Do not hardcode `NEXT_PUBLIC_BACKEND_URL` inside the module. | HTTP factory |
| 3.2 | Split browser and server transport concerns | Keep browser-only token access out of generic API code. If token access is needed, inject it from the host app or create a browser-specific client wrapper. | Client/server split |
| 3.3 | Normalize request configuration | Standardize timeout, credentials, headers, and JSON handling in one place. | Client defaults |
| 3.4 | Keep transport side effects isolated | Avoid global axios mutation so the module can be imported safely alongside other modules. | Isolation rules |

### Design Rules

- Prefer a factory over shared singleton mutation
- Keep authorization logic injectable
- Keep cookies and storage access outside pure helpers
- Do not assume every request needs auth

### Deliverables

- Reusable HTTP client factory
- Browser-safe and server-safe transport strategy

---

## Phase 4 — Pure Transformers and Normalizers

**Goal:** Convert backend payloads and user inputs into stable module data.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 4.1 | Build response normalizers | Convert backend responses into a predictable module shape. Handle renamed fields, nullable relations, and unexpected payloads defensively. | Response mappers |
| 4.2 | Build query normalization helpers | Serialize and sanitize filters so URL params, React Query keys, and API params stay aligned. | Query normalizers |
| 4.3 | Build product math helpers | Centralize discount calculations, rounded pricing, stock status, and availability derivation. | Pure utilities |
| 4.4 | Build slug helpers | Normalize slugs from titles and preserve explicit slugs when provided. | Slug utilities |
| 4.5 | Build tag and media normalizers | Trim, dedupe, and lowercase tags if required; validate and normalize URL arrays for product media. | Input normalization |

### Pure Functions to Include

- `calculateDiscountedPrice`
- `normalizeProductPayload`
- `normalizeProductQuery`
- `normalizeTags`
- `normalizeMediaUrls`
- `buildProductSlug`
- `deriveAvailabilityStatus`
- `coercePagination`

### Deliverables

- Pure helper layer with no React dependency
- Normalized read/write data shapes

---

## Phase 5 — API Functions

**Goal:** Expose all product operations through a clean, typed service surface.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 5.1 | Implement public read functions | Support list, detail-by-slug, and category-scoped reads for published products. | Read APIs |
| 5.2 | Implement admin read functions | Support admin list and detail reads, including unpublished and soft-deleted records if the backend allows them. | Admin read APIs |
| 5.3 | Implement mutation functions | Support create, update, publish toggle, soft delete, and any backend restore or status mutation if available. | Mutation APIs |
| 5.4 | Keep endpoints configurable | Put endpoint paths behind constants or config so the module is portable across environments. | Endpoint config |
| 5.5 | Preserve typed request/response boundaries | Every API function should accept typed input and return normalized typed output. | Typed service surface |

### Required API Surface

- `listPublishedProducts(query)`
- `getPublishedProductBySlug(slug)`
- `listPublishedProductsByCategory(categorySlug, query)`
- `adminListProducts(query)`
- `adminGetProduct(id)`
- `createProduct(dto)`
- `updateProduct(id, dto)`
- `toggleProductPublish(id)`
- `deleteProduct(id)`

### Design Rules

- Prefer one function per backend operation
- Keep API functions thin and defer transformation to helpers
- Return normalized errors rather than raw axios errors
- Avoid mixing query serialization with UI concerns

### Deliverables

- Full product API surface
- Endpoint constants and request typing

---

## Phase 6 — React Query Keys and Hooks

**Goal:** Offer React-friendly hooks for server state without making the module UI-owned.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 6.1 | Define stable query keys | Create predictable key factories for public lists, category lists, product details, and admin views. | Query keys |
| 6.2 | Create query hooks for reads | Provide hooks for published lists, category lists, single product reads, and admin reads. | Read hooks |
| 6.3 | Create mutation hooks for writes | Provide hooks for create, update, publish toggle, and delete actions. | Mutation hooks |
| 6.4 | Encode invalidation rules | After a mutation, invalidate only the keys that can actually change. Avoid blanket invalidation. | Cache rules |
| 6.5 | Add optional `prefetch` helpers | Expose helper functions for SSR or route preloading without tying them to a component. | Prefetch helpers |

### Hook Rules

- Hooks should be thin wrappers over the API layer
- Hooks should not own UI state
- Hooks should expose `enabled`, `select`, and `placeholderData` patterns where useful
- Hooks should use stable query keys and normalized query objects

### Deliverables

- Public query hooks
- Admin query and mutation hooks
- Key factory and invalidation map

---

## Phase 7 — Error Handling, Validation, and Auth Rules

**Goal:** Make failure modes predictable and safe to consume from any UI.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 7.1 | Standardize the API error model | Normalize transport errors into one `ApiError` shape with status, message, validation errors, path, and timestamp. | Error model |
| 7.2 | Parse validation errors consistently | Convert backend validation arrays into field-level maps for the UI layer. Keep parsing logic in the module. | Validation parser |
| 7.3 | Define auth failure handling | Expose a clean way for the host app to react to 401 and 403 responses without hard redirecting from the module. | Auth callbacks |
| 7.4 | Make auth optional where possible | Public reads must work without auth. Admin calls should require auth only at the transport boundary. | Auth rules |
| 7.5 | Validate write payloads before sending | Add lightweight client-side validation or schema checks for required fields, number ranges, URLs, UUIDs, and field lengths. | Input guards |

### Validation Coverage

- `title` required, max 300
- `description` required
- `price` required, non-negative, rounded to 2 decimals
- `sku` required, max 50
- `discountPercentage` between 0 and 100
- `stock` integer, non-negative
- `minimumOrderQuantity` integer, at least 1
- `categoryId` UUID if present
- media URLs must be valid URLs
- `isPublished` boolean

### Deliverables

- Unified error handling
- Validation parser and guard helpers
- Auth failure contract for the host app

---

## Phase 8 — Next.js Compatibility and SSR Helpers

**Goal:** Keep the module safe to consume in Next.js without coupling it to the app router.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 8.1 | Keep client-only code isolated | Any React hooks or browser-only helpers must live behind explicit client boundaries. | Client boundary rules |
| 8.2 | Add server-friendly helpers where useful | Provide server-side read helpers or prefetch helpers that can run in route handlers, server components, or server actions if needed. | Server helpers |
| 8.3 | Keep env access out of shared logic | Pass `baseURL` and other runtime config from the host app instead of reading environment variables in generic helpers. | Config strategy |
| 8.4 | Support route prefetching and revalidation patterns | Expose helper functions that the host app can use for prefetching, cache invalidation, or stale-time control. | Next.js-friendly helpers |

### Design Rules

- Do not read `window` in shared module code
- Do not access cookies from pure utilities
- Keep `use client` only where React state is required
- Keep module exports usable in SSR and client contexts

### Deliverables

- Next.js-safe module helpers
- Clear server/client separation

---

## Phase 9 — Migration and Host-App Cleanup

**Goal:** Remove legacy product data flows from the host app and replace them with module imports.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 9.1 | Replace DummyJSON reads | Migrate every product read path to the new module API or hooks. | Migration complete |
| 9.2 | Replace legacy product types | Remove reliance on the old DummyJSON product type and use the new domain types everywhere. | Type migration |
| 9.3 | Remove direct HTTP calls from feature code | Feature code should call module services or hooks, not raw axios fetches to product endpoints. | Logic cleanup |
| 9.4 | Update cross-feature consumers | Any cart, wishlist, search, or recommendation logic that depends on product IDs or shapes must use the new contracts. | Cross-feature alignment |
| 9.5 | Remove obsolete helpers after migration | Delete only the old product-only helpers that are no longer used. Keep shared helpers if they still serve other features. | Cleanup list |

### Migration Rules

- Keep the module backward-compatible during transition if the host app needs it
- Prefer adapter functions over one-off migrations scattered across the app
- Remove DummyJSON assumptions in one controlled pass

### Deliverables

- Clean migration from legacy product logic
- No remaining DummyJSON product dependency in the module boundary

---

## Phase 10 — Tests, Exports, and Documentation

**Goal:** Make the module stable enough to reuse and maintain.

### Tasks

| # | Task | Details | Output |
|---|------|---------|--------|
| 10.1 | Test pure helpers | Cover slug building, query normalization, price rounding, and payload normalization with unit tests. | Utility tests |
| 10.2 | Test API adapters | Mock transport responses and verify the normalized outputs and error handling. | API tests |
| 10.3 | Test query key factories | Ensure keys are stable and deterministic for identical inputs. | Query-key tests |
| 10.4 | Test mutation invalidation rules | Verify cache invalidation targets the correct read queries after create/update/delete actions. | Hook tests |
| 10.5 | Export a stable public API | Limit public exports to the types, hooks, services, and helpers that a host app should consume. | `index.ts` |
| 10.6 | Document host integration | Add a short module README or usage note describing required config, endpoint expectations, and the integration contract. | Usage docs |

### Deliverables

- Targeted test coverage
- Clean public exports
- Minimal usage documentation

---

## Appendix — Expected Issues and Mitigations

| Issue | Why it matters | Mitigation |
|------|----------------|------------|
| Backend response shape drifts from the plan | Breaks typing and transforms | Normalize payloads at the module boundary and keep a mapper layer |
| IDs switch between number and UUID | Breaks hooks, routes, and cache keys | Enforce UUID strings in the module contract and update adapters only once |
| Token access is browser-specific | Causes SSR and portability issues | Inject token access through the API factory instead of reading cookies globally |
| Query params serialize inconsistently | Produces cache misses and wrong API calls | Centralize query normalization and stringification |
| Decimal price values lose precision | Causes checkout and display mismatches | Round at the module boundary and keep prices numeric in transport |
| Soft-deleted or unpublished items leak into reads | Causes inconsistent list behavior | Apply publication and deletion rules in read transformers and query parameters |
| Validation errors are inconsistent | Makes form and mutation handling brittle | Normalize all validation payloads into one error shape |
| Slug regeneration changes URLs unexpectedly | Breaks detail lookups and references | Make slug generation explicit and preserve manual slugs when present |
| Host app uses different env naming | Breaks portability | Keep config injectable and avoid hardcoded env reads in the module |
| Legacy DummyJSON assumptions remain in consumers | Causes mixed data models | Migrate all consumers through the module contract before cleanup |

---

## Appendix — Proposed Module Tree

```txt
modules/products/
├── api/
│   ├── products.api.ts
│   ├── products.client.ts
│   ├── products.server.ts
│   └── products.endpoints.ts
├── config/
│   └── products.config.ts
├── constants/
│   ├── products.keys.ts
│   ├── products.errors.ts
│   └── products.defaults.ts
├── hooks/
│   ├── useProducts.ts
│   ├── useProduct.ts
│   ├── useAdminProducts.ts
│   ├── useCreateProduct.ts
│   ├── useUpdateProduct.ts
│   ├── useToggleProductPublish.ts
│   └── useDeleteProduct.ts
├── server/
│   ├── prefetchProducts.ts
│   └── prefetchProduct.ts
├── services/
│   ├── products.service.ts
│   └── products.admin.service.ts
├── transformers/
│   ├── product.mapper.ts
│   ├── product-query.mapper.ts
│   ├── product-slug.ts
│   └── product-pricing.ts
├── types/
│   ├── product.types.ts
│   ├── product-dto.types.ts
│   └── product-error.types.ts
├── validators/
│   ├── product.validators.ts
│   └── product-query.validators.ts
└── index.ts
```

---

## Dependency Graph

```txt
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10
```

### Critical Path

```txt
Boundary rules → types → transport → transformers → API functions → hooks → errors/validation → Next.js helpers → migration → tests/exports
```

### Parallelization Opportunities

- Phase 2 and Phase 3 can progress in parallel once the backend contract is locked
- Phase 4 and Phase 5 can proceed in parallel after the domain types are stable
- Phase 9 cleanup can begin as soon as a consumer has been migrated to the new module contract

