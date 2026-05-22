# Cart Module - Logic-Only Portable Work Plan

> **Source:** `integrations_plans/cart-integration-plan.md`
> **Target:** a self-contained cart module that can be copied into another Next.js project and wired to that project's UI
> **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Zustand · TanStack Query · Axios
> **Created:** 2026-05-22
> **Status:** Draft

---

## Scope Rules

This plan is intentionally logic-only.

- No UI implementation work
- No styling work
- No page redesign
- No component markup redesign
- No project-specific cart visuals
- No hard dependency on this repository's current product cards, navbar, or cart page

The output should be a portable module folder that exposes business logic, transport, state, and integration contracts. Any host app can connect its own UI to the module without rewriting the cart logic.

---

## What This Plan Fixes

The current draft plan has several issues that would make the cart hard to reuse.

| Problem in the old plan | Fix in this plan |
|---|---|
| Cart logic is mixed with UI tasks | Keep the module logic-only and leave UI to the host app |
| Logic is tied to `ProductType` from DummyJSON | Replace with backend-native cart DTOs and module-specific domain types |
| Store contains side effects like toast calls | Move side effects into hooks/services and keep the store pure |
| Auth is assumed to come from project-specific global store | Use an injected auth adapter or token provider |
| Cookie decryption is assumed in the browser | Do not rely on client-side cookie decryption unless the host app explicitly chooses that auth model |
| React Query is referenced without a clear provider contract | Define host integration requirements instead of embedding layout changes in the module plan |
| Checkout is routed through app-specific page/API code | Make checkout orchestration a reusable service and keep redirect decisions in the host app |
| The plan is not copyable into another project | Define a self-contained module tree with public exports |

---

## Design Principles

1. Keep the cart module domain-driven, not UI-driven.
2. Keep server state and local guest state separate.
3. Keep transport, state, and orchestration in different files.
4. Keep side effects outside the store.
5. Keep all money values in minor units, not display units.
6. Keep auth, storage, and notifications behind adapters so the module can be reused in another project.
7. Keep the public API small and explicit.
8. Keep host-app integration optional and documented, not baked into the module internals.

---

## Module Contract

The module should be organized so a host app can import only public entrypoints.

### Public responsibilities

- Read cart data
- Add items to cart
- Update item quantities
- Remove items
- Clear cart
- Sync guest cart to authenticated cart
- Start checkout orchestration
- Expose derived selectors such as item count and subtotal
- Normalize backend errors

### Non-responsibilities

- UI rendering
- Button state design
- Toast styling
- Route design
- Page composition
- Checkout page layout

### Required host integrations

- TanStack Query provider at the app shell level
- Auth adapter or token resolver
- Optional storage adapter for guest persistence
- Optional notification adapter if the host wants to show success/error messages
- Optional redirect adapter for checkout flow

---

## Recommended Module Tree

The plan should produce a portable folder like this:

```txt
src/modules/cart/
├── cart.api.ts      # API + services + adapters + utils + keys + endpoints + transport
├── cart.hooks.ts    # All hooks (useCart, useCartCount, useCartActions, useSyncGuestCart)
├── cart.store.ts    # Pure Zustand store (guest persistence, UI coordination)
├── cart.types.ts    # All types (domain + DTO + error)
└── index.ts         # Public exports
```

**1 folder. 5 files. One job.**

---

## Phase 0 - Audit And Boundary Design

**Goal:** define what belongs inside the module and what must stay in the host app.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 0.1 | Audit existing cart touchpoints | Identify current cart store, checkout helper, API calls, and any consumers that read or mutate cart data. | Migration inventory |
| 0.2 | Identify host-app dependencies | List anything the cart currently imports from app-specific code, including auth state, product types, toasts, and page helpers. | Dependency gap list |
| 0.3 | Decide module boundaries | Confirm that the module owns logic, transport, state, and derived selectors, while the host owns UI and routing. | Boundary decision record |
| 0.4 | Define adapter contracts | Decide the minimal adapter interfaces for auth, storage, notifications, and redirect behavior. | Adapter contract notes |
| 0.5 | Define public API shape | Decide which hooks, services, and types should be exported from the module root. | Public API list |

### Expected issues to solve here

- The module must not import the project's current auth store directly.
- The module must not depend on product-card DTOs or DummyJSON naming.
- The module must not assume a browser-only storage API at import time.
- The module must not own page-level routing or redirect behavior.

### Deliverables

- Migration inventory
- Module boundary notes
- Adapter contracts
- Public export map

---

## Phase 1 - Domain Types And Invariants

**Goal:** define stable cart domain types that are independent from UI or host app data models.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 1.1 | Define raw DTO types | Model the backend cart response, cart item response, add-item DTO, update-item DTO, clear-cart response, checkout request, and checkout response. | `cart.dto.ts` |
| 1.2 | Define normalized domain types | Create module-native types for cart item, cart summary, cart totals, checkout result, and error shape. | `cart.domain.ts` |
| 1.3 | Standardize money units | Keep all monetary values in minor units such as cents. Do not store display-formatted currency in the domain layer. | `money.ts` |
| 1.4 | Define identifiers consistently | Use string IDs everywhere in the module. Do not keep `number` product IDs from the old implementation. | `cart.domain.ts` |
| 1.5 | Define stock and quantity rules | Express minimum, maximum, and availability constraints in the types and validators. | `cart.domain.ts`, `validation.ts` |
| 1.6 | Define error contracts | Normalize API errors into a single module error shape with status, message, path, timestamp, and field errors. | `cart.error.ts` |

### Domain rules

- Cart item identity must use backend product UUIDs or equivalent string IDs.
- Derived totals must be computed in one place, not scattered through components.
- Display formatting must stay outside the domain layer.
- Backend data should be normalized before reaching consumers.

### Deliverables

- `app/modules/cart/types/cart.dto.ts`
- `app/modules/cart/types/cart.domain.ts`
- `app/modules/cart/types/cart.error.ts`
- `app/modules/cart/utils/money.ts`
- `app/modules/cart/utils/validation.ts`

---

## Phase 2 - Transport And Error Normalization

**Goal:** create a transport layer that is testable, predictable, and reusable.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 2.1 | Define a dedicated cart transport client | Build a cart-specific transport wrapper on top of Axios or the project's chosen HTTP client. Keep it isolated from UI and store logic. | `cart.transport.ts` |
| 2.2 | Add request auth handling | Support auth via injected token provider or host-provided auth adapter. Do not hardcode project-specific cookie parsing or token decryption into the module. | `cart.transport.ts`, `auth.adapter.ts` |
| 2.3 | Normalize backend errors | Map backend validation errors, auth errors, not-found errors, rate-limit errors, and server errors into a stable module error shape. | `cart.transport.ts`, `cart.error.ts` |
| 2.4 | Keep transport side-effect free | The transport layer should not redirect, toast, or mutate state. It should only return data or throw normalized errors. | `cart.transport.ts` |
| 2.5 | Add abort/timeout support | Ensure long requests can be cancelled and time out cleanly in client environments. | `cart.transport.ts` |

### Expected issues to solve here

- The current codebase's axios instance only has a response interceptor; the module needs a complete transport contract, not a partial one.
- Client-side cookie decryption should not be assumed inside the module.
- Error normalization must be stable enough to power hooks, logging, and tests.
- The transport must be portable across projects, so host-specific behavior should stay in adapters.

### Deliverables

- `app/modules/cart/api/cart.transport.ts`
- `app/modules/cart/api/cart.endpoints.ts`
- `app/modules/cart/types/cart.error.ts`

---

## Phase 3 - API Functions And Query Keys

**Goal:** implement cart API functions and query key factories without mixing in UI logic.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 3.1 | Create cart endpoints map | Centralize all backend paths in one file so the module does not scatter route strings. | `cart.endpoints.ts` |
| 3.2 | Create query key factory | Build a stable key factory for cart detail, item count, and derived queries. | `cart.keys.ts` |
| 3.3 | Implement `getCart` | Fetch the current cart snapshot from the backend. | `cart.api.ts` |
| 3.4 | Implement `addItem` | Send add-item DTOs to the backend and return the raw transport response. | `cart.api.ts` |
| 3.5 | Implement `updateItem` | Update quantity by product ID. | `cart.api.ts` |
| 3.6 | Implement `removeItem` | Remove a cart item by product ID. | `cart.api.ts` |
| 3.7 | Implement `clearCart` | Clear the entire cart. | `cart.api.ts` |
| 3.8 | Implement `checkoutSession` or `checkoutIntent` | If the backend exposes a checkout endpoint, wrap it here. Keep the response contract generic and redirect-free. | `cart.api.ts` |
| 3.9 | Avoid presentation mapping in API calls | API functions should not format money, compute display strings, or emit notifications. | `cart.api.ts` |

### Design decisions

- Keep one place for backend endpoint strings.
- Keep query keys deterministic and namespaced.
- Keep API return values raw until the service layer normalizes them.
- Keep checkout response handling separate from browser navigation.

### Deliverables

- `app/modules/cart/api/cart.api.ts`
- `app/modules/cart/api/cart.endpoints.ts`
- `app/modules/cart/api/cart.keys.ts`

---

## Phase 4 - Services, Mapping, And Derived State

**Goal:** move business logic out of the transport layer and into pure services and selectors.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 4.1 | Create cart mappers | Convert backend DTOs into normalized domain entities. | `cart-mappers.ts` |
| 4.2 | Create cart service | Encapsulate cart operations, derived totals, quantity constraints, and normalization. | `cart.service.ts` |
| 4.3 | Create cart selectors | Provide pure selectors such as total items, subtotal, item count, stock warnings, and empty-state checks. | `cart-selectors.ts` |
| 4.4 | Keep store pure | The store should hold state and setters only. It should not call API functions, show toasts, or navigate. | `cart.store.ts` |
| 4.5 | Keep money math in one place | Compute subtotal, total, and per-item values in the service or selector layer, not in host consumers. | `money.ts`, `cart-selectors.ts` |

### Expected issues to solve here

- The current store mixes domain state, persistence, and UI feedback. That is brittle and hard to test.
- Quantity and subtotal logic must not be duplicated in the host UI.
- The module should expose reusable selectors instead of forcing every consumer to reimplement cart math.

### Deliverables

- `app/modules/cart/services/cart.service.ts`
- `app/modules/cart/services/cart-selectors.ts`
- `app/modules/cart/utils/cart-mappers.ts`
- `app/modules/cart/store/cart.store.ts`

---

## Phase 5 - State Strategy And Guest Persistence

**Goal:** support both authenticated and guest cart behavior without coupling the module to the host app's auth store.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 5.1 | Define guest persistence model | Decide how guest cart state is stored locally and how it is hydrated safely on the client. | `storage.adapter.ts` |
| 5.2 | Keep auth state external | Do not import a specific auth store into the cart module. Use an adapter or injected resolver instead. | `auth.adapter.ts` |
| 5.3 | Create sync service | Build a service that merges guest items into the authenticated backend cart after login. | `cart-sync.service.ts` |
| 5.4 | Define sync conflict policy | Decide how to handle duplicates, stock caps, unavailable items, and backend validation failures during merge. | Sync policy notes |
| 5.5 | Support cross-tab consistency | If guest mode is enabled, optionally listen for storage events so cart state stays consistent across browser tabs. | `storage.adapter.ts` |
| 5.6 | Keep failure recovery safe | If sync fails, preserve guest items and return a recoverable error instead of destroying local state. | `cart-sync.service.ts` |

### Sync policy

- Merge duplicate product IDs by summing quantities, then clamp to backend limits.
- Prefer a bulk or batch sync endpoint if the backend offers one.
- If only single-item endpoints exist, keep the merge logic deterministic and test it.
- Never clear the guest cart until the authenticated sync succeeds.

### Expected issues to solve here

- The current hybrid plan assumes auth can be detected inside the store. That couples the module to a specific app implementation.
- The current guest cart state and authenticated cart state should not fight each other.
- Browser storage access must be lazy and client-safe for Next.js App Router.

### Deliverables

- `app/modules/cart/adapters/storage.adapter.ts`
- `app/modules/cart/adapters/auth.adapter.ts`
- `app/modules/cart/services/cart-sync.service.ts`
- `app/modules/cart/hooks/use-sync-guest-cart.ts`

---

## Phase 6 - React Query Hooks

**Goal:** expose a small set of hooks that host UI can consume without learning the internal state model.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 6.1 | Create cart query hook | Fetch the cart snapshot with predictable loading, error, and refetch behavior. | `use-cart.ts` |
| 6.2 | Create mutation hooks | Add, update, remove, and clear mutations should be exposed as separate hooks. | `use-cart.ts` |
| 6.3 | Create count hook | Expose a safe count selector that returns zero during loading or error states. | `use-cart-count.ts` |
| 6.4 | Create action hook | Optionally expose a convenience hook for host apps that want a smaller API surface. | `use-cart-actions.ts` |
| 6.5 | Define invalidation rules | Successful mutations should invalidate only the necessary cart keys. | `cart.keys.ts`, `use-cart.ts` |
| 6.6 | Keep hooks host-agnostic | Hooks should not assume a specific UI, page, or navigation behavior. | `use-cart.ts` |

### Best-practice rules

- Use React Query for server state.
- Use Zustand only where local guest persistence or ephemeral state is needed.
- Do not duplicate the same cart snapshot in multiple sources of truth unless there is a clear reason.
- Keep invalidation explicit and scoped.
- Avoid optimistic updates unless the backend contract is stable enough to reconstruct the resulting cart state accurately.

### Deliverables

- `app/modules/cart/hooks/use-cart.ts`
- `app/modules/cart/hooks/use-cart-count.ts`
- `app/modules/cart/hooks/use-cart-actions.ts`

---

## Phase 7 - Checkout Orchestration

**Goal:** make checkout a reusable service instead of page-specific logic.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 7.1 | Define checkout request contract | Decide what the checkout service accepts: cart snapshot, shipping option, return URLs, and any required metadata. | `checkout.service.ts` |
| 7.2 | Keep redirect logic external | The checkout service should return a checkout result, not directly navigate. The host app can redirect after success. | `redirect.adapter.ts` |
| 7.3 | Validate checkout prerequisites | Ensure cart emptiness, stock constraints, and required fields are checked before checkout is attempted. | `checkout.service.ts` |
| 7.4 | Support backend validation errors | Surface insufficient stock, unavailable items, and invalid cart states as normalized errors. | `cart.error.ts`, `checkout.service.ts` |
| 7.5 | Reconcile post-checkout state | After a successful checkout, the module should define how and when the cart is refetched or cleared based on backend behavior. | `checkout.service.ts` |

### Expected issues to solve here

- Do not hardcode a Next.js API route as the only checkout path.
- Do not hardcode Stripe redirect URLs into the module logic.
- Do not clear the cart optimistically unless the backend contract guarantees the purchase flow succeeded.
- Keep checkout orchestration reusable for multiple host UIs.

### Deliverables

- `app/modules/cart/services/checkout.service.ts`
- `app/modules/cart/adapters/redirect.adapter.ts`

---

## Phase 8 - Public Exports And Host Integration

**Goal:** make the module easy to import and easy to wire into another project.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 8.1 | Create root exports | Export the module's public hooks, services, types, query keys, and adapters from `index.ts`. | `index.ts` |
| 8.2 | Write module README | Document setup, required providers, adapter wiring, and import examples. | `README.md` |
| 8.3 | Define host integration checklist | List the minimum steps a host app must take to use the module. | README section |
| 8.4 | Define compatibility notes | Note Next.js App Router requirements, client-only storage rules, and React Query provider requirements. | README section |

### Host integration checklist

- Add a TanStack Query provider at the app shell level.
- Provide auth access to the module through an adapter or resolver.
- Provide storage access only if guest mode is enabled.
- Wire notifications only if the host wants them.
- Connect UI to public hooks and services, not internal files.

### Deliverables

- `app/modules/cart/index.ts`
- `app/modules/cart/README.md`

---

## Phase 9 - Legacy Migration And Cleanup

**Goal:** remove the old cart implementation once the module is in place.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 9.1 | Replace legacy store usage | Move consumers from the old cart store to the module's public hooks and selectors. | Migration complete |
| 9.2 | Remove DummyJSON cart assumptions | Eliminate `ProductType`-based cart logic from the cart domain. | Cleaned cart domain |
| 9.3 | Remove duplicated checkout logic | Retire helper logic that only exists to support the old cart flow. | Removed duplication |
| 9.4 | Remove store side effects | Move toast and notification logic out of the store. | Pure store |
| 9.5 | Remove hardcoded host assumptions | Remove module dependencies on specific page routes, layout components, and project-specific auth state. | Portable module |

### Cleanup rules

- Keep the module folder self-contained.
- Keep imports public and explicit.
- Keep deprecated logic out of the final entrypoints.

### Deliverables

- Legacy cart logic removed or deprecated
- Module-only cart path established

---

## Phase 10 - Tests And Verification

**Goal:** make sure the module is stable, portable, and safe to reuse.

### Tasks

| # | Task | Details | Output |
|---|---|---|---|
| 10.1 | Test DTO mapping | Verify backend cart DTOs map correctly into module domain objects. | Mapper tests |
| 10.2 | Test error normalization | Verify 401, 404, 409, 422, 429, and 500 responses normalize consistently. | Error tests |
| 10.3 | Test sync behavior | Verify guest-to-auth merge, duplicate handling, and rollback behavior on failure. | Sync tests |
| 10.4 | Test selector math | Verify item count, subtotal, totals, and quantity constraints. | Selector tests |
| 10.5 | Test transport isolation | Verify the transport layer does not depend on UI or host store code. | Transport tests |
| 10.6 | Test Next.js safety | Verify no browser-only APIs are accessed at module import time. | Safety checks |
| 10.7 | Test portability | Verify the module can be imported into a blank Next.js app with only the documented adapters. | Portability check |

### Verification checklist

- No UI-specific logic inside the module
- No project-specific store imports inside the module
- No direct `ProductType` dependencies
- No client cookie decryption assumption unless supplied by host
- No redirect logic inside the transport layer
- No toast logic inside the store
- No duplicated subtotal or item-count math in host consumers

### Deliverables

- Unit tests for mappers, selectors, error normalization, and sync logic
- Portability verification notes

---

## Appendix - Suggested File Tree

```txt
src/modules/cart/
├── cart.api.ts      # transport + endpoints + keys + services + adapters + utils + checkout
├── cart.hooks.ts    # useCart, useCartCount, useCartActions, useSyncGuestCart
├── cart.store.ts    # guest cart persistence, UI coordination
├── cart.types.ts    # domain + DTO + error types
└── index.ts         # public exports
```

---

## Dependency Graph

```txt
Phase 0 - Audit and boundary design
  -> Phase 1 - Domain types and invariants
  -> Phase 2 - Transport and error normalization
  -> Phase 3 - API functions and query keys
  -> Phase 4 - Services, mapping, and derived state
  -> Phase 5 - State strategy and guest persistence
  -> Phase 6 - React Query hooks
  -> Phase 7 - Checkout orchestration
  -> Phase 8 - Public exports and host integration
  -> Phase 9 - Legacy migration and cleanup
  -> Phase 10 - Tests and verification
```

### Critical path

```txt
Types -> Transport -> API -> Services -> State -> Hooks -> Checkout -> Exports -> Tests
```

### Parallel work

- Phase 1 and Phase 2 can start in parallel after the boundary decisions are fixed.
- Phase 4 and Phase 5 can proceed together once the DTOs and transport layer are stable.
- Phase 6 can be developed alongside Phase 7 after the service contracts are finalized.
- Phase 10 should run after the public API stabilizes.

---

## Final Acceptance Criteria

The cart work is complete only if all of the following are true:

- The cart logic lives in a reusable module folder.
- The module can be copied into another Next.js project with only host adapter wiring.
- The module does not contain UI implementation work.
- The module does not depend on DummyJSON `ProductType`.
- The module does not hardcode host-specific auth, toast, or route logic.
- The module exposes a clean public API through `index.ts`.
- The module has tests for mapping, state, error handling, sync, and portability.
- The module keeps money math, stock validation, and cart totals consistent across all consumers.
