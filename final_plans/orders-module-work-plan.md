# Orders Module - Logic-Only Work Plan

> **Source:** `integrations_plans/orders-integration-plan.md`
>
> **Target:** reusable Next.js module that can be copied into another project and wired to that project's consumer layer without rewriting the core business logic
>
> **Backend:** NestJS v11, TypeORM, PostgreSQL, Stripe Checkout
>
> **Frontend runtime:** Next.js 16 App Router, React 19, TypeScript, TanStack Query, Axios or fetch adapter
>
> **Created:** 2026-05-22
>
> **Status:** Revised draft

---

## What This Rewrite Fixes

The original draft mixed module logic with presentation pages, route files, and presentation concerns. This version corrects that by:

- making the orders work a self-contained module
- removing page/component requirements from the core plan
- separating raw API payloads from normalized domain models
- avoiding global app-level mutations such as interceptor changes unless they are wrapped in a module adapter
- making checkout success/failure handling a consumer concern instead of a hardcoded route concern
- keeping the module portable across Next.js projects

---

## Scope

### In scope

- order domain types and status constants
- API client wrappers and endpoint functions
- transport-agnostic error normalization
- query keys and React Query hooks
- polling and cache invalidation rules
- checkout session orchestration
- validation helpers
- module-level tests
- public exports and integration contract

### Out of scope

- presentation files
- page or route files
- styling
- metadata generation
- visual empty/loading states
- route redirects
- consumer-specific integration wiring

---

## Architecture Rules

### Hard requirements

- Keep the module self-contained.
- Do not depend on presentation files.
- Do not store presentation-specific mappings in domain types.
- Do not use `Date` in API transport types; keep transport payloads serializable.
- Do not mutate shared global clients without a local adapter layer.
- Do not couple the module to a specific cart implementation or route path.
- Do not couple success/cancel behavior to a fixed URL.

### Recommended shape

- one module root folder
- one public barrel export
- one internal transport adapter boundary
- one normalized domain model
- one query key factory
- one hook layer
- one service layer for orchestration
- one test suite for core logic

---

## Recommended Folder Structure

```txt
app/modules/orders/
├── index.ts
├── contracts/
│   ├── order-status.ts
│   ├── order.types.ts
│   ├── checkout.types.ts
│   ├── order-error.types.ts
│   └── index.ts
├── api/
│   ├── orders.endpoints.ts
│   ├── orders.api.ts
│   ├── checkout.api.ts
│   ├── orders.transport.ts
│   └── index.ts
├── query/
│   ├── orders.keys.ts
│   ├── orders.queries.ts
│   ├── checkout.mutations.ts
│   └── index.ts
├── services/
│   ├── orders.service.ts
│   ├── checkout.service.ts
│   ├── polling.service.ts
│   ├── cart-sync.service.ts
│   └── index.ts
├── adapters/
│   ├── axios.adapter.ts
│   ├── fetch.adapter.ts
│   ├── react-query.adapter.ts
│   └── index.ts
├── utils/
│   ├── normalize-order.ts
│   ├── normalize-error.ts
│   ├── money.ts
│   ├── status-guards.ts
│   └── index.ts
├── test/
│   ├── normalize-order.test.ts
│   ├── normalize-error.test.ts
│   ├── polling.service.test.ts
│   ├── orders.keys.test.ts
│   └── checkout.service.test.ts
└── README.md
```

This folder can be moved to `src/modules/orders/` or another feature root in a different project with minimal path changes if the barrel export is preserved.

---

## Phase 0 - Boundary Audit and Integration Contract

**Goal:** lock the module contract before implementation so the logic does not drift into app-specific assumptions.

### Tasks

| #   | Task                                                                    | Output                                                                                                                              |
| --- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | Confirm backend endpoints and response shapes from the integration plan | Stable API contract for orders and checkout                                                                                         |
| 0.2 | Confirm auth model and backend base URL                                 | Cookie-based auth with `withCredentials` support, `NEXT_PUBLIC_BACKEND_URL` available in the host app, no JWT storage in the module |
| 0.3 | Confirm transport choice                                                | Either a module-local Axios adapter or a module-local fetch adapter; do not depend on a global app helper directly                  |
| 0.4 | Confirm React Query availability in the host app                        | `QueryClientProvider` is a host-app requirement, not a module responsibility                                                        |
| 0.5 | Confirm cart ownership boundary                                         | The module must not assume a specific cart implementation; cart cleanup is optional and adapter-driven                              |
| 0.6 | Confirm redirect ownership                                              | Success/cancel URLs are consumer inputs, not hardcoded module routes                                                                |
| 0.7 | Confirm portability target                                              | The module must work as a copied folder with only adapter wiring adjusted                                                           |

### Deliverables

- documented module contract
- documented host-app prerequisites
- explicit note that the redirect checkout flow does not require the frontend Stripe publishable key inside this module
- no route or presentation assumptions in the core plan

---

## Phase 1 - Domain Contracts and Serialization

**Goal:** define stable types that represent the backend contract and the module's normalized domain model.

### Tasks

| #   | Task                                   | Details                                                                                                                     |
| --- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Create `contracts/order-status.ts`     | Define status constants as `as const` values, not a TypeScript enum, to keep runtime overhead low and tree-shaking friendly |
| 1.2 | Define `OrderStatus` union             | Derive the type from the status constants                                                                                   |
| 1.3 | Define raw API response types          | Keep date/time fields as ISO strings in transport types                                                                     |
| 1.4 | Define normalized domain types         | Convert transport payloads into a predictable internal shape, including parsed timestamps where needed                      |
| 1.5 | Define checkout input/output contracts | Include `successUrl` and `cancelUrl` as caller-provided inputs, plus response fields from the backend                       |
| 1.6 | Define paginated order contracts       | Support page, limit, total, and totalPages consistently                                                                     |
| 1.7 | Define error contracts                 | Represent NestJS-style validation and API errors without assuming one message format                                        |
| 1.8 | Define money helpers                   | Keep amounts as integer cents internally; provide conversion helpers only, not presentation formatting                      |
| 1.9 | Define status guards                   | Add logic helpers such as terminal-state checks and pending-state checks                                                    |

### Design decisions

- Use literal constants plus unions instead of enums.
- Keep API payloads serializable.
- Normalize the backend contract in one place.
- Do not add presentation label/color maps to core types.
- Do not expose `Date` fields directly in transport payloads.

### Deliverables

- `contracts/` contains the canonical order contract
- `utils/normalize-order.ts` handles transport-to-domain conversion
- `utils/status-guards.ts` handles status logic

---

## Phase 2 - Transport and API Functions

**Goal:** create a clean API layer with a small surface area and no coupling to presentation or route code.

### Tasks

| #   | Task                                | Details                                                                                                                  |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 2.1 | Define endpoint constants           | Keep all paths in one file so the module can be remapped if the backend changes                                          |
| 2.2 | Build a transport adapter interface | Support either Axios or fetch without tying the module to one client implementation                                      |
| 2.3 | Implement `getOrderHistory`         | Fetch paginated order history                                                                                            |
| 2.4 | Implement `getOrderById`            | Fetch one order by ID and normalize the result                                                                           |
| 2.5 | Implement `createCheckoutSession`   | Create a checkout session using caller-provided redirect URLs                                                            |
| 2.6 | Normalize API errors locally        | Convert transport errors into a module-owned error shape                                                                 |
| 2.7 | Preserve backend error metadata     | Keep status code, path, timestamp, and validation details when available                                                 |
| 2.8 | Avoid global interceptor mutation   | If the host app already has an Axios instance, wrap it in a module adapter rather than changing shared behavior globally |

### API contract rules

- `GET /orders`
- `GET /orders/:id`
- `POST /payments/checkout-session`

### Deliverables

- `api/orders.api.ts`
- `api/checkout.api.ts`
- `api/orders.transport.ts`
- `utils/normalize-error.ts`

---

## Phase 3 - Query Keys, Hooks, and Polling

**Goal:** expose a reusable React Query layer that can be consumed by any presentation layer.

### Tasks

| #   | Task                                 | Details                                                                                                 |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| 3.1 | Create the query key factory         | Use stable, namespaced keys such as `orders.all`, `orders.list`, `orders.detail`, and `orders.checkout` |
| 3.2 | Implement `useOrderHistory`          | Provide paginated order history with predictable cache behavior                                         |
| 3.3 | Implement `useOrderDetail`           | Fetch a single order and support active refresh while the order is still pending                        |
| 3.4 | Implement `useCreateCheckoutSession` | Expose a mutation for checkout creation with normalized error output                                    |
| 3.5 | Implement polling rules              | Poll only while the order is in a non-terminal payment state; stop when the order settles               |
| 3.6 | Implement derived state helpers      | Expose `isPendingPayment`, `isTerminal`, and `shouldPoll` helpers for consumers                         |
| 3.7 | Standardize cache invalidation       | Define which queries are invalidated after checkout creation and after order status changes             |

### Hook design rules

- Keep hooks thin.
- Put decision logic in services or pure helpers.
- Keep polling conditions deterministic.
- Avoid returning presentation strings from the hook layer.
- Avoid coupling cache invalidation to a specific page or navigation event.

### Deliverables

- `query/orders.keys.ts`
- `query/orders.queries.ts`
- `query/checkout.mutations.ts`
- `services/polling.service.ts`

---

## Phase 4 - Checkout Orchestration and Side Effects

**Goal:** keep checkout flow logic explicit and portable.

### Tasks

| #   | Task                                  | Details                                                                                        |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 4.1 | Create checkout orchestration service | Coordinate order creation, session creation, and post-action state rules                       |
| 4.2 | Define post-checkout cleanup contract | Support optional callbacks for clearing external cart state or related caches                  |
| 4.3 | Keep redirect URLs caller-owned       | The consumer passes `successUrl` and `cancelUrl`; the module does not assume routing structure |
| 4.4 | Keep cart ownership external          | Do not bind the module to a local storage cart, Redux store, or Zustand store                  |
| 4.5 | Document idempotency expectations     | A repeated success callback should not break the module or duplicate side effects              |

### Recommended interface

- `createCheckoutSession(input, transport)`
- `onCheckoutSuccess(result, adapters)`
- `clearDependentCaches(adapters)`
- `shouldRetryCheckout(error)`

### Deliverables

- `services/checkout.service.ts`
- `services/cart-sync.service.ts`

---

## Phase 5 - Error Handling and Validation

**Goal:** make errors predictable, inspectable, and safe to consume in any host app.

### Tasks

| #   | Task                                         | Details                                                                          |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| 5.1 | Normalize validation errors                  | Convert backend validation arrays into a field-to-message structure              |
| 5.2 | Normalize transport errors                   | Map Axios/fetch/network failures into one module-owned shape                     |
| 5.3 | Classify retryable errors                    | Distinguish between transient and terminal failures                              |
| 5.4 | Preserve authorization errors                | Treat 401 as an auth problem, not a generic failure                              |
| 5.5 | Preserve not-found behavior                  | Treat 404 as a missing or inaccessible order, without exposing backend internals |
| 5.6 | Preserve rate-limit behavior                 | Keep retry-after metadata if the backend provides it                             |
| 5.7 | Keep user-facing copy out of the core module | Consumer projects can map module errors to their own presentation language       |

### Error model requirements

- status code
- backend message or messages
- validation field details
- request path
- timestamp
- retryable flag
- source flag such as `network`, `validation`, `auth`, or `server`

### Deliverables

- `utils/normalize-error.ts`
- `contracts/order-error.types.ts`

---

## Phase 6 - Tests and Verification

**Goal:** verify the module logic independently of any presentation layer.

### Tasks

| #   | Task                        | Details                                                                |
| --- | --------------------------- | ---------------------------------------------------------------------- |
| 6.1 | Test order normalization    | Verify transport-to-domain mapping for dates, amounts, and nullability |
| 6.2 | Test error normalization    | Verify validation, auth, not-found, rate-limit, and network cases      |
| 6.3 | Test query keys             | Ensure key factories are stable and collision-free                     |
| 6.4 | Test polling logic          | Ensure polling starts and stops at the correct status transitions      |
| 6.5 | Test checkout orchestration | Verify redirect URL handling and post-success side-effect rules        |
| 6.6 | Test currency helpers       | Verify integer-cent conversions and rounding behavior                  |
| 6.7 | Test public exports         | Confirm the barrel export gives a complete, minimal public API         |

### Verification rules

- Prefer unit tests for pure logic.
- Keep adapter tests isolated.
- Do not require a browser presentation test to validate core module behavior.

### Deliverables

- logic tests for all core utilities
- stable public API verified by tests

---

## Phase 7 - Packaging and Consumer Integration Contract

**Goal:** make the module easy to drop into another Next.js project.

### Tasks

| #   | Task                              | Details                                                                             |
| --- | --------------------------------- | ----------------------------------------------------------------------------------- |
| 7.1 | Create a public barrel export     | Export only the stable, supported API surface from `index.ts`                       |
| 7.2 | Document host-app prerequisites   | Note React Query provider, backend base URL, and auth cookie support                |
| 7.3 | Document transport wiring         | Explain how to bind the module to Axios or fetch in a host project                  |
| 7.4 | Document success/cancel ownership | Explain that the host app provides redirect URLs and handles navigation             |
| 7.5 | Document cart bridge ownership    | Explain that any cart cleanup or local cache reset is optional and project-specific |
| 7.6 | Document migration rules          | Explain how to relocate the folder to a different project with minimal changes      |

### Public API recommendation

Expose only:

- types
- constants
- API functions
- query keys
- query hooks
- service helpers
- normalization helpers

Do not export:

- app-specific route helpers
- presentation assumptions
- hardcoded URLs
- implementation-only transport details

### Deliverables

- `README.md` for module consumers
- `index.ts` barrel
- stable module contract

---

## Expected Issues And How This Plan Avoids Them

### Issue: presentation logic leaks into the module

Fix: remove presentation work from the core plan and keep only logic, transport, and hooks.

### Issue: transport types are not serializable

Fix: keep API payloads as strings and normalize them separately.

### Issue: module depends on a single app helper

Fix: use a transport adapter boundary so the module can bind to Axios or fetch in any project.

### Issue: global axios interceptor changes affect unrelated code

Fix: avoid global mutations and isolate error normalization inside the module adapter.

### Issue: dates and money are handled inconsistently

Fix: keep integer cents internally, parse timestamps in one place, and expose deterministic helpers.

### Issue: status labels and colors become presentation debt

Fix: keep core logic focused on state transitions and terminal-state checks only.

### Issue: checkout flow assumes a fixed route structure

Fix: let the consumer own `successUrl` and `cancelUrl`.

### Issue: cart logic is coupled to one storage strategy

Fix: define cart cleanup as an optional adapter, not a hard dependency.

---

## Recommended Implementation Order

1. Phase 0 - lock the contract and host prerequisites.
2. Phase 1 - define contracts and normalization rules.
3. Phase 2 - implement transport and API functions.
4. Phase 3 - add query keys, hooks, and polling.
5. Phase 4 - add checkout orchestration and side-effect adapters.
6. Phase 5 - harden error handling and validation.
7. Phase 6 - write tests.
8. Phase 7 - document the public module contract.

---

## Acceptance Criteria

The plan is complete when all of the following are true:

- the orders logic lives inside one reusable module folder
- the module exports a small, stable public API
- there are no presentation files in the module core
- API transport is swappable
- error handling is normalized and deterministic
- polling rules are isolated and testable
- checkout redirect URLs are caller-owned
- the module can be copied into another Next.js project with only adapter wiring adjusted
