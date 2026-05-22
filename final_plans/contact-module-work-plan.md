# Contact Module - Logic-Only Work Plan

> **Source:** `integrations_plans/contact-integration-plan.md`
> **Target stack:** Next.js 16 (App Router) · React 19 · TypeScript · TanStack Query · Axios
> **Scope:** reusable contact module, logic only. UI, routing, and styling stay in the consuming project.
> **Created:** 2026-05-22
> **Status:** Refined Draft

---

## 1) What Was Wrong In The Current Draft

The previous plan mixed module logic with app-specific UI work and made a few unsafe assumptions. Those issues need to be fixed before implementation.

### 1.1 UI and routing were inside the module plan

The plan included page files, component trees, and presentation details. That breaks portability and ties the feature to one Next.js app structure.

**Fix:** keep the module logic-only. The module should export types, API functions, hooks, services, and constants. The consuming project owns all render-layer code.

### 1.2 The plan was coupled to `app/` paths

The draft used `app/types`, `app/hooks`, and `app/lib/api`. That is fine for one repo, but it is not a portable module layout.

**Fix:** move the feature to `src/modules/contact/` and make the public surface importable from one barrel file. If the host app prefers a different source root, the folder can be copied without changing internal imports.

### 1.3 Some types were copied from unrelated modules

The old `ContactQueryParams` included fields such as `title`, `amount`, `viewsCount`, and `publishedAt`. Those belong to other domains and create bad contracts.

**Fix:** define only contact-specific query fields. Do not inherit shapes from blog, product, order, or cart modules.

### 1.4 The draft assumed too much about backend data shape

The plan hardcoded response fields and validation messages without clearly separating confirmed backend contract from inferred values.

**Fix:** add a contract-verification phase first. Treat every DTO, enum, status flag, and error shape as explicit module input, not guesswork.

### 1.5 Query keys were not guaranteed to be stable

Using raw filter objects directly in query keys can create cache misses when object order changes.

**Fix:** normalize filters before building keys. Use a deterministic key factory that serializes only stable, sorted values.

### 1.6 The module was tied to one auth implementation

The draft assumed a specific cookie setup and an app-local axios singleton.

**Fix:** make the module client configurable. Default to `withCredentials: true` for cookie-based auth, but keep the base URL and request transport configurable through module config.

### 1.7 The plan mixed logic with UI state

Loading and empty-state presentation details were included in a module plan. Those are consumer concerns.

**Fix:** expose pending, error, and data states through hooks. Let the consuming project decide how to render them.

---

## 2) Final Target

The finished contact feature should be a self-contained module that can be copied into another Next.js project and wired into any UI layer.

### 2.1 Module folder

```txt
src/modules/contact/
├── contact.api.ts     # client + endpoints + config + constants + keys + services + utils
├── contact.hooks.ts   # useSubmitContact, useContactList, useContactDetail, useMarkContactAsRead, etc.
├── contact.store.ts   # optional local UI state
├── contact.types.ts   # all types (domain + DTO + error)
└── index.ts           # public exports
```

**1 folder. 5 files. One job.**

### 2.2 Public module surface

The module should export only the logic that consumers need:

- `contactConfig`, `contactKeys`, `contactApi`
- `validateContactDraft`, `sanitizeContactDraft`
- `normalizeContactError`, `buildContactQueryParams`
- `useSubmitContact`, `useContactList`, `useContactDetail`
- `useMarkContactAsRead`, `useMarkContactAsReplied`, `useDeleteContact`
- `useContactAdmin`
- all core contact types

All of these live in just 5 files: `contact.api.ts`, `contact.hooks.ts`, `contact.store.ts`, `contact.types.ts`, and `index.ts`.

### 2.3 Consumer integration contract

The consuming Next.js app must provide:

- a mounted TanStack Query provider
- a backend base URL
- an auth transport compatible with the backend contract
- its own UI layer for forms, lists, details, and admin screens

The module must not import from the host app. It should be portable on its own.

---

## 3) Non-Goals

These are intentionally out of scope for the module:

- no page components
- no layout or styling work
- no route definitions
- no app-specific UI state management
- no hard dependency on files inside `app/`
- no backend changes
- no secret handling or credential storage logic
- no package installation steps unless the host project is missing a required dependency

---

## 4) Implementation Phases

## Phase 0 - Contract Discovery and Module Boundaries

**Goal:** lock the backend contract and the host-app integration requirements before writing module logic.

| # | Task | Details | Output |
|---|------|---------|--------|
| 0.1 | Confirm the backend routes | Verify the exact contact endpoints for create, list, detail, mark read, mark replied, and delete. Keep the module contract aligned with the backend docs. | Approved endpoint list |
| 0.2 | Confirm response shapes | Verify the exact response envelopes, pagination fields, status flags, and date formats. Do not guess field names. | Approved DTO map |
| 0.3 | Confirm auth transport | Determine whether the backend expects cookie-based auth, bearer tokens, or both. Default the module to cookie-friendly transport, but keep the client configurable. | Auth transport decision |
| 0.4 | Confirm error contract | Verify the backend validation and error shape so the module can normalize 400/401/403/404/409/429/500 responses consistently. | Error normalization spec |
| 0.5 | Confirm host prerequisites | The consuming project must already provide a TanStack Query provider and a backend base URL. The module should not create global providers itself. | Integration checklist |
| 0.6 | Define module boundaries | Explicitly document what belongs inside the module and what remains in the consumer app. | Boundary spec |

### Phase 0 deliverables

- verified backend contract
- host integration checklist
- module boundary document

---

## Phase 1 - Domain Types, Validation, and Constants

**Goal:** define all contact-specific data shapes and pure validation logic.

| # | Task | Details | Files |
|---|------|---------|-------|
| 1.1 | Create `contact.types.ts` | Define all request and response types for the contact domain. | `src/modules/contact/contact.types.ts` |
| 1.2 | Define `CreateContactMessageDto` | Include `fullName`, `email`, `subject`, and `message`. Keep it aligned with backend validation rules. | `contact.types.ts` |
| 1.3 | Define `ContactMessage` | Include `id`, `fullName`, `email`, `subject`, `message`, `isRead`, `repliedAt`, `ipAddress`, `createdAt`, and `updatedAt`. Use ISO strings, not `Date`, unless the module explicitly parses them. | `contact.types.ts` |
| 1.4 | Define `ContactListResponse` | `data` plus pagination meta (`page`, `limit`, `total`, `totalPages`). | `contact.types.ts` |
| 1.5 | Define `ContactActionResponse` | Generic response for read/replied/delete actions, with `message` and the mutated contact id or status fields where applicable. | `contact.types.ts` |
| 1.6 | Define `ContactQueryParams` | Keep only contact-relevant filters such as `page`, `limit`, `isRead`, `sortBy`, and `order`. Do not import unrelated fields from other modules. | `contact.types.ts` |
| 1.7 | Define `ContactSortField` and `ContactOrder` | Use a narrow union for known sort fields and directions. Expand only if the backend officially supports more. | `contact.types.ts` |
| 1.8 | Define `ContactApiError` | Shape the normalized error object once and reuse it everywhere in the module. | `contact.types.ts` |
| 1.9 | Create constants | Store validation bounds and reusable limits, such as min/max lengths and pagination defaults. | `src/modules/contact/contact.api.ts` |
| 1.10 | Create validation helpers | Implement pure validators for drafts and query params. Return field-error maps instead of throwing for normal validation failures. | `src/modules/contact/contact.api.ts` |

### Validation rules to lock

- `fullName` required, trimmed, max 100
- `email` required, trimmed, valid email, max 255
- `subject` required, trimmed, max 200
- `message` required, trimmed, min 10, max 5000
- `page` min 1
- `limit` min 1, max 100 unless the backend says otherwise
- `sortBy` and `order` must be normalized before the request is sent

### Phase 1 deliverables

- complete contact type definitions
- pure validation helpers
- shared constants for limits and defaults

---

## Phase 2 - API Client and Raw Endpoint Layer

**Goal:** create a portable API layer that can talk to the backend without depending on host-app files.

| # | Task | Details | Files |
|---|------|---------|-------|
| 2.1 | Create config + client + endpoints + API functions | Centralize base URL, timeout, auth behavior, axios client, endpoint paths, and raw request functions all in `contact.api.ts`. | `src/modules/contact/contact.api.ts` |
| 2.5 | Implement all API functions | `submitContactMessage()`, `getContactMessages()`, `getContactMessageById()`, `markContactAsRead()`, `markContactAsReplied()`, `deleteContactMessage()`. | `contact.api.ts` |
| 2.6 | Create error normalization | Convert backend and Axios errors into a consistent `ContactApiError` shape. | `contact.api.ts` |

### API design rules

- keep endpoint functions thin and deterministic
- do not transform data in the API layer unless needed for transport normalization
- keep all endpoint strings in one file
- preserve HTTP status codes in normalized errors
- prefer `withCredentials` for cookie auth over reading auth tokens from browser storage

### Phase 2 deliverables

- portable Axios client
- raw contact API functions
- normalized error object
- single source of truth for endpoint strings

---

## Phase 3 - Query Keys, Cache Policy, and Hooks

**Goal:** provide a clean TanStack Query surface for submission, listing, detail reads, and admin actions.

| # | Task | Details | Files |
|---|------|---------|-------|
| 3.1 | Create query keys factory | Build a deterministic query key factory for list and detail caches. Use normalized filters, not raw objects. | `src/modules/contact/contact.api.ts` |
| 3.2 | Create hooks | All hooks in one file: `useSubmitContact`, `useContactList`, `useContactDetail`, `useMarkContactAsRead`, `useMarkContactAsReplied`, `useDeleteContact`, `useContactAdmin`. | `src/modules/contact/contact.hooks.ts` |
| 3.3 | Define cache policy | Use short but useful freshness windows for list and detail data. | `contact.api.ts` |
| 3.4 | Define invalidation rules | Public submit should not invalidate admin caches. Read/replied should update detail cache and invalidate lists. Delete should remove detail cache and invalidate all list variants. | `contact.hooks.ts` |

### Cache rules

- list queries should use deterministic keys based on normalized filter values
- detail queries should use one id-based key
- mutation success should patch only the caches that can be updated safely
- delete should prefer invalidation over partial optimistic deletion if pagination is involved
- avoid optimistic updates unless the module can guarantee rollback safety

### Phase 3 deliverables

- query key factory
- list and detail hooks
- mutation hooks
- cache invalidation strategy

---

## Phase 4 - Services and Orchestration

**Goal:** keep business rules out of hooks and out of the API layer.

| # | Task | Details | Files |
|---|------|---------|-------|
| 4.1 | Create services | Cross-cutting contact logic: submit normalization, status transitions, derived flags, draft validation, cache orchestration. | `src/modules/contact/contact.api.ts` |
| 4.2 | Create normalization/mapping utils | Normalize backend payloads, map response fields, build query params. | `src/modules/contact/contact.api.ts` |

### Service rules

- never let hooks contain business rules that can be unit tested separately
- never let the API layer know about cache details
- never let validation logic depend on React state
- never let one module-specific helper leak into unrelated features

### Phase 4 deliverables

- reusable service layer
- pure validation and normalization helpers
- isolated cache orchestration

---

## Phase 5 - Packaging and Consumer Contract

**Goal:** make the module easy to drop into another Next.js project.

| # | Task | Details | Files |
|---|------|---------|-------|
| 5.1 | Create `index.ts` | Re-export only the public types, helpers, API functions, and hooks from the 5 module files. Keep internals private. | `src/modules/contact/index.ts` |
| 5.2 | Document import usage | Consumers should import from the module barrel, not from deep internal paths. | `index.ts` |
| 5.3 | Document host integration points | The host app must wire the query provider, auth transport, and env config. The module should not attempt to own those concerns. | Module README or plan appendix |
| 5.4 | Keep module paths portable | Avoid any import that points back to `app/`, `pages/`, or other host-specific folders. | Whole module |

### Public API shape

The module should be consumable like this:

```ts
import {
  useSubmitContact,
  useContactList,
  useContactDetail,
  useMarkContactAsRead,
  useMarkContactAsReplied,
  useDeleteContact,
  validateContactDraft,
  contactKeys,
  type CreateContactMessageDto,
  type ContactQueryParams,
} from "@/modules/contact";
```

### Phase 5 deliverables

- one-barrel public export surface
- clear consumer integration contract
- zero host-app coupling

---

## Phase 6 - Verification and Edge Cases

**Goal:** prove the module behaves correctly across the full contact workflow.

| # | Task | Details | Files |
|---|------|---------|-------|
| 6.1 | Validate local input rules | Verify the min/max lengths, email shape, trimming behavior, and query param normalization. | Validation service |
| 6.2 | Validate error normalization | Cover 400, 401, 403, 404, 409, 429, and 500 responses with stable normalized errors. | Error service |
| 6.3 | Validate cache updates | Confirm that read/replied patch only the affected cache entries and that delete clears the right caches. | Cache service + hooks |
| 6.4 | Validate query keys | Confirm that the same filters always produce the same cache key. | `contact.keys.ts` |
| 6.5 | Validate public submission flow | Confirm that pending state, success state, and validation failure states are exposed cleanly through the hook API. | `useSubmitContact.hook.ts` |
| 6.6 | Validate admin read flow | Confirm that list and detail hooks remain coherent after read/replied/delete actions. | Admin hooks |
| 6.7 | Validate portability | Confirm the module can be imported without any dependency on the current repo's `app/` structure. | Whole module |

### Edge cases to cover

- trimmed values should not become empty after sanitization
- `message` should preserve internal line breaks while removing accidental outer whitespace
- `repliedAt` can be null until the backend sets it
- `ipAddress` can be null and should remain nullable in the types
- pagination must not produce negative or zero page numbers
- list queries must not accept unrelated sort fields
- delete should not leave stale detail cache entries behind
- auth failures should be surfaced through the hook error state, not silently swallowed

### Phase 6 deliverables

- verified validation behavior
- verified cache behavior
- verified error behavior
- portability check passed

---

## 5) Final Acceptance Criteria

The plan is complete only when all of the following are true:

- the module is logic-only
- the module lives in a portable folder, not in `app/`
- there are no UI, page, or styling tasks in the module plan
- the types match only the contact domain
- the API layer is isolated and portable
- query keys are deterministic
- cache invalidation is explicit and minimal
- the public export surface is a single barrel
- the consuming Next.js app can wire its own UI on top without changing module internals

---

## 6) Dependency Graph

```txt
Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5
                               \-> Phase 6
```

### Critical path

```txt
Contract -> Types -> API -> Hooks -> Services -> Packaging -> Verification
```

### Parallel work

- validation helpers and constants can be drafted alongside the type definitions
- endpoint constants and API client setup can be prepared in parallel once the contract is locked
- cache orchestration can be implemented together with the hook layer
- packaging and verification can proceed after the public surface is defined

