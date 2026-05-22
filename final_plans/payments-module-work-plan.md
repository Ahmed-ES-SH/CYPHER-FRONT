# Payments Module - Logic-Only Work Plan

> **Stack:** Next.js 16 · React 19 · TypeScript · Zustand · TanStack React Query · Axios · Stripe backend integration
>
> **Goal:** extract a portable payments module that can be copied into another Next.js App Router project and integrated without changing the module internals.
>
> **Non-goals:** no presentation-layer code, no route pages, no layout changes, no styling, no hardcoded redirects, no page-level checkout flow.

---

## 1. What This Plan Must Fix

| Issue in the current plan                                  | Why it is a problem                                      | Required fix                                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Presentation and route work are mixed into the module plan | The module stops being portable and becomes app-specific | Keep the plan logic-only and host-agnostic                                            |
| Hardcoded frontend URLs and environment typos              | Breaks local/dev/staging portability                     | Use validated config and the correct `NEXT_PUBLIC_BACKEND_URL` key                    |
| Project-specific plan/pricing assumptions                  | Prevents reuse in another project                        | Use host-supplied plan identifiers, not hardcoded prices                              |
| Direct redirects and `window` usage inside logic           | Couples business logic to browser navigation             | Return redirect targets to the host app instead                                       |
| Imports from repo-local helpers/stores                     | Makes the module non-portable                            | Keep the module self-contained with its own client, types, and helpers                |
| Shared cache keys are not user-scoped                      | Can leak cached payment data across auth changes         | Scope React Query keys by user/account when available                                 |
| Real-time transport is treated as mandatory                | Adds an unnecessary hard dependency                      | Make realtime optional behind an adapter                                              |
| Runtime validation is missing                              | Bad payloads fail late and inconsistently                | Validate config and API response shapes early                                         |
| Store state duplicates React Query state                   | Adds unnecessary complexity                              | Keep Zustand only for cross-hook coordination, not as a second source of server state |

---

## 2. Scope and Boundaries

### 2.1 In Scope

- Payment types, DTOs, response shapes, and domain error codes
- Environment/config parsing and validation
- Module-local HTTP client and raw API functions
- React Query hooks for create intent, checkout session, history, and optional realtime coordination
- Optional lightweight Zustand store for module coordination only
- Error normalization and runtime guards
- Public barrel exports for direct consumption by a host app
- Test and verification checklist

### 2.2 Out of Scope

- presentation-layer components
- route pages
- route handlers
- layout changes
- navigation/redirect implementation
- styling, animations, or layout composition
- cart interaction behavior
- auth interaction behavior
- localStorage persistence inside the payments module

### 2.3 Host Responsibilities

The host application owns:

- presentation and interaction
- route composition
- navigation after a checkout session is created
- cart state and cart clearing
- auth state and user identifier lookup
- notifications and copy

The module only returns data, status, and normalized errors.

---

## 3. Target Module Shape

The module should live in one portable folder and not depend on repo-specific helpers.

```txt
app/_lib/payments/
├── api/
│   ├── payments.client.ts
│   └── payments.api.ts
├── config/
│   └── payments.config.ts
├── constants/
│   ├── payments.constants.ts
│   ├── payments.errors.ts
│   └── payments.keys.ts
├── hooks/
│   ├── useCreatePaymentIntent.ts
│   ├── useCheckoutSession.ts
│   ├── usePaymentHistory.ts
│   └── usePaymentRealtime.ts
├── services/
│   └── payments.service.ts
├── store/
│   └── payments.store.ts
├── types/
│   └── payments.types.ts
├── utils/
│   ├── normalizePaymentError.ts
│   └── paymentGuards.ts
└── index.ts
```

### Design rules for this structure

- `api/` contains raw HTTP only.
- `hooks/` contains React Query and lifecycle orchestration only.
- `services/` contains framework-agnostic business orchestration.
- `store/` is optional and must stay minimal.
- `types/` is the single source of truth for public contracts.
- `utils/` contains runtime guards and error normalization.
- `index.ts` is the only public entry point.

---

## 4. Public Contract

### 4.1 Types

`types/payments.types.ts` should define:

- payment intent request DTO
- checkout session request DTO
- payment history response shape
- payment status enum
- normalized error codes
- realtime event payloads
- callback contracts for host integration
- response unions for existing vs new payment intent flows

### 4.2 Config

`config/payments.config.ts` should:

- read environment variables
- validate required values
- fail fast on missing backend config
- support endpoint overrides
- avoid silent localhost fallbacks
- keep module configuration separate from host application concerns

Required config values should include:

- `NEXT_PUBLIC_BACKEND_URL`

Optional config values may include:

- endpoint overrides for projects that do not expose the same backend paths
- realtime keys only if the adapter is enabled

Important:

- remove any reference to the typo `NEXT_PUBLIC_BACKE_END_URL`
- do not commit secrets
- document required variables in repo docs or `.env.example`, not in version-controlled local env files

### 4.3 Constants

`constants/payments.constants.ts` should keep only generic module defaults:

- request timeout
- query stale times
- pagination defaults
- retry thresholds
- status labels used internally by the module

Do not hardcode project pricing or plan labels in this module.
Those are host or backend concerns.

### 4.4 Error Mapping

`constants/payments.errors.ts` and `utils/normalizePaymentError.ts` should map raw backend and transport errors into stable domain errors such as:

- `INVALID_INPUT`
- `AUTH_REQUIRED`
- `RATE_LIMITED`
- `ALREADY_IN_PROGRESS`
- `NOT_FOUND`
- `CONFIG_MISSING`
- `NETWORK_ERROR`
- `STRIPE_ERROR`
- `UNKNOWN_ERROR`

The module should not expose raw backend strings to consumers.
The host app can map normalized codes to copy.

### 4.5 Query Keys

`constants/payments.keys.ts` should:

- use a single root key namespace
- scope cached data by user/account when available
- keep keys deterministic and serializable

Recommended shape:

- `all`
- `history`
- `historyPage`
- `intent`
- `checkoutSession`
- `realtime`
- `details` if the backend exposes a payment detail endpoint

If the host app has an authenticated user id, include it in the key scope to prevent cache bleed across sessions.

The config layer should also expose an endpoint map so the module can be reused with different backend path conventions without changing hook code.

---

## 5. API Layer

### 5.1 Module-Local HTTP Client

`api/payments.client.ts` should create the axios client inside the module instead of importing a repo-local helper.

Required behavior:

- use `baseURL` from module config
- send credentials for cookie-based auth
- use a consistent timeout
- never trigger browser or presentation side effects
- never depend on browser globals at import time

### 5.2 Raw API Functions

`api/payments.api.ts` should provide raw functions only:

- create payment intent
- create checkout session
- fetch payment history
- fetch payment status or details if the backend provides that endpoint

Implementation rules:

- unwrap `response.data` and return typed values
- accept optional abort signals
- support idempotency metadata
- never redirect
- never touch the router
- never emit host notifications
- never mutate host cart state
- never import host auth state

### 5.3 Response Normalization

The API layer should normalize:

- `400` as validation or domain error
- `401` as auth-required
- `403` as permission-denied or account mismatch
- `404` as missing resource
- `409` as already-in-progress or duplicate request
- `429` as rate-limited
- `5xx` as upstream failure

Transport errors should normalize to a stable network error shape.

---

## 6. Hooks, Services, and Store

### 6.1 `useCreatePaymentIntent`

Responsibilities:

- call the API mutation
- expose mutation state to the host app
- return the client secret or existing intent metadata
- support idempotency keys
- support request cancellation
- normalize errors

Rules:

- do not confirm Stripe payments inside the module
- do not redirect
- do not assume a specific form implementation
- do not access host state directly
- do not assume a fixed plan catalog

The host application decides how to use the returned intent data.

### 6.2 `useCheckoutSession`

Responsibilities:

- create the backend checkout session
- return `checkoutUrl`, `sessionId`, `orderId`, and expiry metadata
- expose loading and error state
- normalize rate-limit and cart-validation failures

Rules:

- do not call `window.location.href`
- do not perform redirects
- do not invalidate host cart state directly
- do not assume a specific route structure

The host application decides when and how to navigate.

### 6.3 `usePaymentHistory`

Responsibilities:

- fetch paginated payment history
- expose pagination metadata
- support page changes via query keys
- keep stale time conservative but not aggressive

Rules:

- include user/account scope in the key when available
- do not store page state globally unless the host explicitly wants that behavior
- do not couple history data to presentation formatting

### 6.4 Optional Realtime Hook

`usePaymentRealtime` should be optional and adapter-based.

Requirements:

- accept a user/account identifier from the host
- subscribe through an injected realtime adapter
- emit normalized status events
- clean up subscriptions on unmount
- fall back gracefully if realtime is unavailable

Rules:

- do not make Pusher mandatory in the core module
- do not assume realtime transport exists in every project
- do not require the host to mount a global listener unless it wants realtime

If the project wants realtime, the adapter can live in the module or beside it.
If not, the module still works via polling and manual refetch.

### 6.5 Service Layer

`services/payments.service.ts` should contain orchestration helpers that are independent from React:

- request intent creation
- request checkout session creation
- normalize history refresh logic
- prepare retry-safe request metadata

Rules:

- no React hooks inside services
- no browser navigation
- no host copy
- no direct host-store imports

### 6.6 Zustand Store

`store/payments.store.ts` should stay minimal.

Use it only for cross-hook coordination that React Query does not already cover, such as:

- active payment intent id
- active checkout session id
- realtime subscription state
- last normalized error

Do not duplicate React Query loading state in Zustand.
Do not use the store as a second source of server truth.

---

## 7. Host Integration Contract

The module should expose a clean contract for any host application:

- pass a plan or product identifier, not a raw amount
- pass the authenticated user id only when realtime or scoping requires it
- use the returned checkout URL or payment intent data in the host application
- handle navigation in the host app
- handle cart state in the host app
- handle notifications in the host app
- handle payment-form confirmation in the host app

This keeps the module reusable across projects with different layouts and flows.

---

## 8. Implementation Phases

### Phase 1 - Contracts and Configuration

Create:

- `types/payments.types.ts`
- `config/payments.config.ts`
- `constants/payments.constants.ts`
- `constants/payments.errors.ts`
- `constants/payments.keys.ts`
- `utils/paymentGuards.ts`

Acceptance criteria:

- config fails fast when required env values are missing
- runtime types cover all payment flows
- no project-specific pricing is hardcoded
- query keys support user/account scoping

### Phase 2 - HTTP Client and API Functions

Create:

- `api/payments.client.ts`
- `api/payments.api.ts`
- `utils/normalizePaymentError.ts`

Acceptance criteria:

- axios client is module-local
- all API functions are pure and typed
- transport and backend errors normalize consistently
- no redirect or presentation side effects exist in the API layer

### Phase 3 - Hooks, Service Layer, and Minimal Store

Create:

- `hooks/useCreatePaymentIntent.ts`
- `hooks/useCheckoutSession.ts`
- `hooks/usePaymentHistory.ts`
- `services/payments.service.ts`
- `store/payments.store.ts` if coordination is actually required

Acceptance criteria:

- hooks expose data, status, and normalized errors
- hooks do not navigate or mutate host application state
- mutation flows are retry-safe
- cached data is scoped correctly
- store state is minimal and not redundant

### Phase 4 - Optional Realtime Adapter

Create:

- `hooks/usePaymentRealtime.ts`

Acceptance criteria:

- realtime is optional, not mandatory
- missing realtime config does not break the module
- cleanup is deterministic
- fallback behavior is defined

### Phase 5 - Verification and Portability

Acceptance criteria:

- module can be copied into another Next.js project without editing internal logic
- module imports do not depend on repo-specific helper paths
- host app can wire its own integration without changing module source
- build and type-check pass
- payment data flow is still correct without realtime

---

## 9. Expected Edge Cases and Required Handling

| Edge case                        | Required handling                                                 |
| -------------------------------- | ----------------------------------------------------------------- |
| Missing backend URL              | Fail fast with `CONFIG_MISSING`                                   |
| Auth cookie not present          | Return `AUTH_REQUIRED` and let the host app decide how to respond |
| Duplicate payment request        | Return `ALREADY_IN_PROGRESS` rather than starting a second flow   |
| Network timeout                  | Return a retryable network error                                  |
| Backend validation failure       | Preserve normalized domain code, not raw text                     |
| User switches accounts           | Clear or scope cached payment data by user/account                |
| Realtime transport unavailable   | Continue to work with polling/refetch only                        |
| Checkout session expires         | Return expiry metadata so the host can decide how to display it   |
| Stripe-specific upstream failure | Normalize into `STRIPE_ERROR` or an equivalent domain code        |
| Repeated rapid retries           | Support idempotency metadata and rate-limit handling              |

---

## 10. Best Practices This Plan Enforces

### Do

- validate config at startup
- keep the module self-contained
- use stable domain error codes
- keep amounts server-authoritative
- scope query keys by user/account
- use pure API functions
- keep hooks thin and predictable
- keep Zustand minimal
- make realtime optional
- keep host application responsibilities outside the module

### Do Not

- hardcode URLs
- hardcode pricing or plan labels
- call `window.location` inside the module
- import host cart or auth stores inside the module
- duplicate server state in Zustand
- rely on project-specific helpers
- make realtime mandatory
- mix presentation and logic in the same layer

---

## 11. Final File Tree

```txt
app/_lib/payments/
├── api/
│   ├── payments.client.ts
│   └── payments.api.ts
├── config/
│   └── payments.config.ts
├── constants/
│   ├── payments.constants.ts
│   ├── payments.errors.ts
│   └── payments.keys.ts
├── hooks/
│   ├── useCreatePaymentIntent.ts
│   ├── useCheckoutSession.ts
│   ├── usePaymentHistory.ts
│   └── usePaymentRealtime.ts
├── services/
│   └── payments.service.ts
├── store/
│   └── payments.store.ts
├── types/
│   └── payments.types.ts
├── utils/
│   ├── normalizePaymentError.ts
│   └── paymentGuards.ts
└── index.ts
```

### External dependencies allowed by the module

- `axios`
- `@tanstack/react-query`
- `zustand` if the minimal store is retained

### External dependencies that should stay outside the core module

- presentation libraries
- routing/navigation logic
- cart state logic
- auth presentation logic
- payment-form implementation code
- realtime vendor-specific wiring unless the project opts into it
