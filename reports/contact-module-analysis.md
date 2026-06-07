# Contact Module — Analysis Report

> **Scope:** `src/modules/contact/`
> **Files analyzed:** `contact.api.ts`, `contact.hooks.ts`, `contact.store.ts`, `contact.types.ts`, `index.ts`, `INTEGRATION.md`
> **Supporting context:** `app/helpers/globalRequest.ts`, `app/_components/_website/contact/ContactSection.tsx`, `app/(pathes)/contact/page.tsx`
> **Date:** 2026-05-29

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Issue Index](#2-issue-index)
3. [Detailed Issues & Fixes](#3-detailed-issues--fixes)
   - [PERF-01 — Client-Side Next.js Server Actions Overhead (`globalRequest`)](#perf-01)
   - [PERF-02 — Lack of Query Param and Cache Key Normalization (Cache Fragmentation)](#perf-02)
   - [PERF-03 — Stiff, Non-Configurable Query Cache Configuration (Lack of Extensibility)](#perf-03)
   - [LOGIC-01 — Runtime Crash Risk in `sanitizeContactDraft` and `validateContactDraft`](#logic-01)
   - [LOGIC-02 — Validation Error Data Loss (API Validation Silence on Front-End)](#logic-02)
   - [LOGIC-03 — Throwing Plain Objects in `transportRequest` (Lost Stack Traces)](#logic-03)
   - [LOGIC-04 — Lack of Email Normalization (Case-Sensitivity Issue)](#logic-04)
   - [LOGIC-05 — Weak Client-Side Email Validation Regex Pattern](#logic-05)
   - [INTEG-01 — Entirely Mocked `ContactSection` Component Bypassing Module Logic](#integ-01)
   - [ARCH-01 — Incomplete `useContactAdmin` Orchestrator Hook (API Discrepancy)](#arch-01)
   - [ARCH-02 — Flat Directory Layout Violates Feature-First Architectural Pattern](#arch-02)
4. [Priority Matrix](#4-priority-matrix)
5. [Refactoring Roadmap](#5-refactoring-roadmap)

---

## 1. Executive Summary

The `contact` module represents a clean separation of concerns designed to orchestrate contact inquiry submission and management. It utilizes `@tanstack/react-query` to power asynchronous client operations and `zustand` to manage administrative selection state. However, an in-depth audit of its architecture, validation models, transport interfaces, and UI integration reveals multiple high-severity issues.

The primary concerns fall into three key categories:
1. **Critical Integration Gap (INTEG-01):** The user-facing contact form in `ContactSection.tsx` is completely disconnected from the contact module. It relies on a local mock transition (`setTimeout`) instead of deploying real inquires via `useSubmitContact` or running standard module validators.
2. **Defensive Validation & Crash Vulnerabilities (LOGIC-01, LOGIC-02):** Pure helper methods like `sanitizeContactDraft` assume inputs are fully populated strings. Passing a partial or incomplete form payload results in immediate runtime crashes. Additionally, because the custom Axios/fetch transport drops validation error lists, server-side dynamic validation messages (e.g., 400 Bad Request) are completely stripped before reaching UI handlers.
3. **Caching and Action Latencies (PERF-01, PERF-02):** Invoking `globalRequest` (explicitly marked with `"use server"`) on the browser proxies every client-side contact action through the Next.js Server Action routing layer. This disables standard HTTP caching, increases request overhead, and fragments the TanStack query cache due to duplicate parameter normalization blocks.

Resolving these issues will secure optimal client-side reliability, guarantee immediate sync between the user input forms and the core services, restore inline form validation feedback, and align the module with feature-first patterns.

---

## 2. Issue Index

| ID | Severity | Category | Title |
|---|---|---|---|
| **PERF-01** | 🟡 Medium | Performance | Client-Side Next.js Server Actions Overhead (`globalRequest`) |
| **PERF-02** | 🟡 Medium | Performance | Lack of Query Param and Cache Key Normalization (Cache Fragmentation) |
| **PERF-03** | 🟢 Low | Performance | Stiff, Non-Configurable Query Cache Configuration (Lack of Extensibility) |
| **LOGIC-01** | 🔴 High | Logic | Runtime Crash Risk in `sanitizeContactDraft` and `validateContactDraft` |
| **LOGIC-02** | 🔴 High | Logic | Validation Error Data Loss (API Validation Silence on Front-End) |
| **LOGIC-03** | 🟡 Medium | Logic | Throwing Plain Objects in `transportRequest` (Lost Stack Traces) |
| **LOGIC-04** | 🟢 Low | Logic | Lack of Email Normalization (Case-Sensitivity Issue) |
| **LOGIC-05** | 🟢 Low | Logic | Weak Client-Side Email Validation Regex Pattern |
| **INTEG-01** | 🔴 High | Integration | Entirely Mocked `ContactSection` Component Bypassing Module Logic |
| **ARCH-01** | 🔴 High | Architecture | Incomplete `useContactAdmin` Orchestrator Hook (API Discrepancy) |
| **ARCH-02** | 🟡 Medium | Architecture | Flat Directory Layout Violates Feature-First Architectural Pattern |

---

## 3. Detailed Issues & Fixes

### PERF-01

**Client-Side Next.js Server Actions Overhead (`globalRequest`)**

**File:** [`contact.api.ts`](../src/modules/contact/contact.api.ts#L170-L180)

**Description:**
The contact module leverages `globalRequest` from `@/app/helpers/globalRequest.ts` inside its client-side queries and mutations. However, `globalRequest.ts` is explicitly marked with the `"use server"` directive at the top. 

In Next.js App Router, importing a `"use server"` function inside a client component context compiles it as a **Next.js Server Action**. Consequently, every browser mutation (such as submitting an inquiry) or query (such as fetching contact details) is routed via an HTTP POST request to the Next.js server first, which then acts as a reverse proxy to send the actual request to the backend. This adds significant server-side overhead and prevents standard browser HTTP GET caching.

```ts
// ❌ Current — imports a server-only action function for client-side transport
import { globalRequest } from "@/app/helpers/globalRequest";

async function transportRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  ...
}
```

**Fix:**
Provide a standard browser-based fetch transport inside the contact client context to bypass Server Actions when queries execute on the client-side, while preserving `globalRequest` for server-side prefetching.

```ts
// ✅ Fix — support direct client requests using standard fetch
async function browserTransportRequest<TResult = any>(
  endpoint: string,
  method: string = "GET",
  body?: unknown
): Promise<TResult> {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const res = await fetch(`${baseURL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw { message: data.message || "An error occurred", status: res.status } satisfies ContactApiError;
  }
  return data as TResult;
}
```

---

### PERF-02

**Lack of Query Param and Cache Key Normalization (Cache Fragmentation)**

**File:** [`contact.api.ts`](../src/modules/contact/contact.api.ts#L205-L225)

**Description:**
Cache keys are populated directly from raw query input options using standard filters. However, default query parameters are not normalized inside custom hooks. For example, if Component A requests `useContactList()` and Component B requests `useContactList({ page: 1 })`, React Query tracks them under two different query key entries:
- `["contact", "list", undefined]`
- `["contact", "list", { page: "1", ... }]`

This generates duplicate network requests and fragments the memory cache. Additionally, `contact.api.ts` does duplicate normalization: both `normalizeQueryParams` and `buildContactQueryParams` repeat identical boundary restrictions and pagination fallback limits.

```ts
// ❌ Current — two separate duplicate normalization blocks in API layer
function normalizeQueryParams(params: ContactQueryParams): Record<string, string> {
  return {
    page: String(Math.max(params.page ?? CONTACT_LIMITS.DEFAULT_PAGE, CONTACT_LIMITS.PAGE_MIN)),
    limit: String(Math.min(Math.max(params.limit ?? CONTACT_LIMITS.DEFAULT_LIMIT, CONTACT_LIMITS.LIMIT_MIN), CONTACT_LIMITS.LIMIT_MAX)),
    sortBy: normalizeSortField(params.sortBy),
    order: normalizeOrder(params.order),
    ...
  };
}

export function buildContactQueryParams(params: ContactQueryParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(Math.max(params.page ?? CONTACT_LIMITS.DEFAULT_PAGE, CONTACT_LIMITS.PAGE_MIN)));
  searchParams.set("limit", String(Math.min(Math.max(params.limit ?? CONTACT_LIMITS.DEFAULT_LIMIT, CONTACT_LIMITS.LIMIT_MIN), CONTACT_LIMITS.LIMIT_MAX)));
  ...
}
```

**Fix:**
Deduplicate the query parameters builder, and normalize params directly inside the query key builder to resolve fragmentation.

```ts
// ✅ Fix — deduplicated single source of truth for parameter normalization
export function normalizeContactParams(params: ContactQueryParams = {}): Required<ContactQueryParams> {
  return {
    page: Math.max(params.page ?? CONTACT_LIMITS.DEFAULT_PAGE, CONTACT_LIMITS.PAGE_MIN),
    limit: Math.min(Math.max(params.limit ?? CONTACT_LIMITS.DEFAULT_LIMIT, CONTACT_LIMITS.LIMIT_MIN), CONTACT_LIMITS.LIMIT_MAX),
    sortBy: normalizeSortField(params.sortBy),
    order: normalizeOrder(params.order),
    isRead: params.isRead ?? false,
  };
}

// Relocate normalization directly into hook execution context to sync cache entries
```

---

### PERF-03

**Stiff, Non-Configurable Query Cache Configuration (Lack of Extensibility)**

**File:** [`contact.hooks.ts`](../src/modules/contact/contact.hooks.ts#L28-L30)

**Description:**
The hook layer hardcodes static caching options (`staleTime: 5 minutes`, `gcTime: 30 minutes`, `retry: 1`):

```ts
// ❌ Current — non-configurable values hardcoded in module core
const CONTACT_STALE_TIME = 5 * 60 * 1000;
const CONTACT_GC_TIME = 30 * 60 * 1000;
const CONTACT_RETRY = 1;

export function useContactList(params: ContactQueryParams = {}) {
  return useQuery<ContactListResponse>({
    queryKey: contactKeys.list(params),
    queryFn: () => getContactMessagesApi(params),
    staleTime: CONTACT_STALE_TIME,
    gcTime: CONTACT_GC_TIME,
    retry: CONTACT_RETRY,
  });
}
```

Hardcoding a heavy 30-minute garbage collection time (`gcTime`) for all query instances results in memory bloat in persistent dashboards or SPAs where admins scan through hundreds of detailed logs. Additionally, consumer applications have no way to override cache settings under custom network constraints.

**Fix:**
Allow passing custom Query Options to hook signatures to provide full control to consuming components:

```ts
// ✅ Fix — allow hook settings overrides
export function useContactList(
  params: ContactQueryParams = {},
  options?: Partial<Parameters<typeof useQuery>[0]>
) {
  return useQuery<ContactListResponse>({
    queryKey: contactKeys.list(params),
    queryFn: () => getContactMessagesApi(params),
    staleTime: CONTACT_STALE_TIME,
    gcTime: CONTACT_GC_TIME,
    retry: CONTACT_RETRY,
    ...options,
  });
}
```

---

### LOGIC-01

**Runtime Crash Risk in `sanitizeContactDraft` and `validateContactDraft`**

**File:** [`contact.api.ts`](../src/modules/contact/contact.api.ts#L59-L101)

**Description:**
The input sanitization helper assumes every field of `CreateContactMessageDto` is a defined, non-null string. It executes standard `.trim()` directly on raw fields:

```ts
// ❌ Current — crashes immediately if any field is nullish or undefined
export function sanitizeContactDraft(dto: CreateContactMessageDto): CreateContactMessageDto {
  return {
    fullName: dto.fullName.trim(),
    email: dto.email.trim(),
    subject: dto.subject.trim(),
    message: dto.message.trim(),
  };
}
```

If an admin dashboard or customer page executes client-side form validation before all states are initialized or during active typing (where fields can be empty/undefined), calling `validateContactDraft` crashes the React thread with `TypeError: Cannot read properties of undefined (reading 'trim')`.

**Fix:**
Implement robust fallback guards and allow validating partial inputs to prevent execution crashes:

```ts
// ✅ Fix — safe string sanitization
export function sanitizeContactDraft(dto: Partial<CreateContactMessageDto>): CreateContactMessageDto {
  return {
    fullName: (typeof dto?.fullName === "string" ? dto.fullName : "").trim(),
    email: (typeof dto?.email === "string" ? dto.email : "").trim(),
    subject: (typeof dto?.subject === "string" ? dto.subject : "").trim(),
    message: (typeof dto?.message === "string" ? dto.message : "").trim(),
  };
}
```

---

### LOGIC-02

**Validation Error Data Loss (API Validation Silence on Front-End)**

**File:** [`contact.api.ts`](../src/modules/contact/contact.api.ts#L170-L180)

**Description:**
When backend requests fail due to validation errors (e.g., status 400 or 422 with `{ errors: { email: ["Invalid domain"] } }`), `globalRequest` successfully captures and returns this mapping. However, `transportRequest` strips out the validation metadata before raising the exception:

```ts
// ❌ Current — completely drops the 'errors' map returning only a flat status
async function transportRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    throw { message: res.message, status: res.statusCode ?? 500 } satisfies ContactApiError;
  }
  return res.data as TResult;
}
```

Because `errors` is dropped, `normalizeContactError` always returns an empty dictionary. This prevents the browser from showing inline validation feedback to users (e.g., warning them that an email is already blacklisted or a domain is invalid).

**Fix:**
Ensure the `errors` property is preserved and propagated back to front-end mutations:

```ts
// ✅ Fix — propagate complete validation payload
if (!res.success) {
  throw { 
    message: res.message, 
    status: res.statusCode ?? 500, 
    errors: res.errors 
  } satisfies ContactApiError;
}
```

---

### LOGIC-03

**Throwing Plain Objects in `transportRequest` (Lost Stack Traces)**

**File:** [`contact.api.ts`](../src/modules/contact/contact.api.ts#L175-L177)

**Description:**
`transportRequest` throws a plain JavaScript object: `throw { message: res.message, ... } satisfies ContactApiError`. Thrown objects that do not inherit from the standard `Error` class lose their runtime execution stack trace. This causes failures in automated testing suites (like Vitest) and makes debugging difficult in production as browser dev tools cannot inspect tracebacks.

**Fix:**
Establish a custom `ContactApiError` class extending `Error` to enforce complete stack trace safety:

```ts
// ✅ Fix — native Error class for proper trace representation
export class ContactApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ContactApiError";
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, ContactApiError.prototype);
  }
}
```

---

### LOGIC-04

**Lack of Email Normalization (Case-Sensitivity Issue)**

**File:** [`contact.api.ts`](../src/modules/contact/contact.api.ts#L94-L101)

**Description:**
When a contact form is submitted, the email is trimmed but its original case is preserved (e.g., `John.Doe@Example.com`). Under strict databases or search indexing, querying for `john.doe@example.com` will not yield matching results if stored case-sensitively. Email values must always be normalized to lowercase during client-side sanitization.

**Fix:**
Ensure email is lowercased during sanitization:

```ts
// ✅ Fix — safe lowercased email sanitization
email: (typeof dto?.email === "string" ? dto.email : "").trim().toLowerCase(),
```

---

### LOGIC-05

**Weak Client-Side Email Validation Regex Pattern**

**File:** [`contact.api.ts`](../src/modules/contact/contact.api.ts#L73-L75)

**Description:**
The email validation regex pattern matches values loosely:

```ts
// ❌ Current — loosely matches emails like a@b.c, vulnerable to edge errors
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
  errors.email = "Invalid email format";
}
```

This pattern accepts invalid strings (such as trailing special characters) while blocking valid complex subdomains or internationalized addresses.

**Fix:**
Update the pattern to a standard, industry-accepted lightweight regex:

```ts
// ✅ Fix — standard robust email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!EMAIL_REGEX.test(trimmed.email)) {
  errors.email = "Invalid email format";
}
```

---

### INTEG-01

**Entirely Mocked `ContactSection` Component Bypassing Module Logic**

**File:** [`ContactSection.tsx`](../app/_components/_website/contact/ContactSection.tsx#L61-L77)

**Description:**
The core integration error: the actual user-facing contact form completely ignores the `src/modules/contact` domain logic. In `ContactSection.tsx`, it manages its own local state, performs no pure module-level sanitization/validation, and simulates network delays using `setTimeout`:

```ts
// ❌ Current — complete mock logic bypassing server communication
const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);

  // Simulate form submission
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Reset form
  setFormData({ name: "", email: "", subject: "", message: "" });
  setIsSubmitting(false);
};
```

This renders the contact feature completely non-operational. User submissions are never submitted to the backend API endpoint (`/api/contact`), and the client-side module remains unused.

**Fix:**
Integrate the `useSubmitContact` mutation and client-side validator functions within `ContactSection.tsx` to handle real API submissions:

```tsx
// ✅ Fix — fully operational hook integration
import { useSubmitContact, validateContactDraft, sanitizeContactDraft } from "@/modules/contact";

export default function ContactSection() {
  const { mutateAsync, isPending } = useSubmitContact();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});

    const draft = {
      fullName: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    const errors = validateContactDraft(draft);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const sanitized = sanitizeContactDraft(draft);
      await mutateAsync(sanitized);
      // Show success toast and clear state
    } catch (err: any) {
      // Map API errors using parseValidationErrors
    }
  };
}
```

---

### ARCH-01

**Incomplete `useContactAdmin` Orchestrator Hook (API Discrepancy)**

**File:** [`contact.hooks.ts`](../src/modules/contact/contact.hooks.ts#L125-L139)

**Description:**
The administrative orchestrator hook `useContactAdmin` is highly limited. It only returns list queries:

```ts
// ❌ Current — only handles the basic list query
export function useContactAdmin(params: ContactQueryParams = {}) {
  const list = useContactList(params);
  return {
    messages: list.data?.data ?? [],
    meta: list.data?.meta,
    isLoading: list.isPending,
    isError: list.isError,
    error: list.error,
    refetch: list.refetch,
  };
}
```

However, the official integration guide in `INTEGRATION.md` tells developers that `useContactAdmin` supports full selection, detail extraction, and mutation bindings:

```ts
// INTEGRATION.md expectation:
const { list, detail, markAsRead, markAsReplied, deleteMessage } = useContactAdmin();
```

Any developer trying to implement administrative views following the guide will encounter compiler and runtime failures due to missing properties.

**Fix:**
Upgrade the orchestrator hook to include all mutations and selection states, satisfying the integration spec:

```ts
// ✅ Fix — fully complete orchestrator hook
export function useContactAdmin(params: ContactQueryParams = {}) {
  const list = useContactList(params);
  const selectedContactId = useContactSelectionStore((state) => state.selectedContactId);
  const setSelectedContactId = useContactSelectionStore((state) => state.setSelectedContactId);
  
  const detail = useContactDetail(selectedContactId ?? undefined);
  const markAsRead = useMarkContactAsRead();
  const markAsReplied = useMarkContactAsReplied();
  const deleteMessage = useDeleteContact();

  return {
    messages: list.data?.data ?? [],
    meta: list.data?.meta,
    isLoading: list.isPending,
    isError: list.isError,
    error: list.error,
    refetch: list.refetch,
    
    // Injected mutations and detail managers
    selectedContactId,
    setSelectedContactId,
    detail: detail.data,
    isDetailLoading: detail.isLoading,
    markAsRead: markAsRead.mutate,
    markAsReplied: markAsReplied.mutate,
    deleteMessage: deleteMessage.mutate,
  };
}
```

---

### ARCH-02

**Flat Directory Layout Violates Feature-First Architectural Pattern**

**Directory:** `src/modules/contact/`

**Description:**
In accordance with the repository's feature-first architectural guide (`AGENTS.md`), code logic should be modularly nested rather than flattened directly at the feature root directory:

```
src/modules/contact/
├── contact.api.ts
├── contact.hooks.ts
├── contact.store.ts
├── contact.types.ts
├── index.ts
└── INTEGRATION.md
```

This flat layout creates clutter as features scale and prevents clean isolation between API transport, react hooks, client stores, and types.

**Fix:**
Restructure the flat directory into standard, domain-separated folders:

```
src/modules/contact/
├── api/
│   └── contact.api.ts
├── hooks/
│   └── contact.hooks.ts
├── store/
│   └── contact.store.ts
├── types/
│   └── contact.types.ts
└── index.ts (exposing all public APIs cleanly)
```

---

## 4. Priority Matrix

```
HIGH PRIORITY (Fix Instantly)
┌─────────────┬──────────────────────────────────────────────────────┐
│ INTEG-01    │ Connect ContactSection.tsx UI to useSubmitContact    │
│ LOGIC-01    │ Add string null-guards to sanitize/validate helpers  │
│ LOGIC-02    │ Propagate res.errors mapping in transportRequest     │
│ ARCH-01     │ Complete useContactAdmin to return admin mutations   │
└─────────────┴──────────────────────────────────────────────────────┘

MEDIUM PRIORITY (Fix Next)
┌─────────────┬──────────────────────────────────────────────────────┐
│ LOGIC-03    │ Throw custom ContactApiError class (stack traces)    │
│ PERF-02     │ Normalize query params to prevent cache fragmentation│
│ PERF-03     │ Accept option settings overrides in contact hooks    │
└─────────────┴──────────────────────────────────────────────────────┘

LOW PRIORITY (Backlog / Refactor Sprint)
┌─────────────┬──────────────────────────────────────────────────────┐
│ PERF-01     │ Support direct client-to-API transport bypass option │
│ LOGIC-04    │ Normalize email addresses to lowercase               │
│ LOGIC-05    │ Enhance client-side email validator regex pattern    │
│ ARCH-02     │ Reorganize flat folder structure into modular groups │
└─────────────┴──────────────────────────────────────────────────────┘
```

---

## 5. Refactoring Roadmap

### Phase 1 — Form Integration & System Stability (No Breaking Changes)
- [ ] **INTEG-01** Update `ContactSection.tsx` to bind input fields and handlers to the `useSubmitContact` mutation hook and render validation alerts.
- [ ] **LOGIC-01** Apply robust type guards and optional checks inside `sanitizeContactDraft` and `validateContactDraft` to eliminate crash risks.
- [ ] **LOGIC-02** Propagate server errors (`res.errors`) through the transport error throw inside `contact.api.ts`.
- [ ] **LOGIC-04** Convert email inputs to lowercase during sanitization to avoid database casing mismatch.

### Phase 2 — API Alignment & Orchestrator Upgrades
- [ ] **ARCH-01** Expand `useContactAdmin` to return mutations (`markAsRead`, `markAsReplied`, `deleteMessage`) and selected detail state, fully matching the requirements of the `INTEGRATION.md` guide.
- [ ] **LOGIC-03** Establish a standard `ContactApiError` class extending `Error` to protect stack trace integrity.
- [ ] **LOGIC-05** Update the client-side email validation regex pattern to industry standard.

### Phase 3 — Caching & Structural Realignment
- [ ] **PERF-02** Centralize default parameters and filter normalizations inside query hooks to prevent cache entry fragmentation.
- [ ] **PERF-03** Restructure query and mutation hooks to support custom settings overrides.
- [ ] **ARCH-02** Reorganize the flat `src/modules/contact/` folder structure into standard feature folders (`api/`, `hooks/`, `store/`, `types/`) conforming with `AGENTS.md`.

---

*Report generated by static code audit and architectural inspection of the `contact` module. All existing vitest units and hooks tests successfully pass in the test environment.*
