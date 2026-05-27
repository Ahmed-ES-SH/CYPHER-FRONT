# Contact Module — Integration Guide

## Purpose

This document covers the **backend contract assumptions** (Phase 0) and the **consumer integration contract** (Phase 5) for the contact module.

---

## Phase 0 — Contract Discovery

### 0.1 Backend Routes

| Operation | Method | Endpoint | Module Constant |
|-----------|--------|----------|-----------------|
| Submit contact message | POST | `/api/contact` | `CONTACT_ENDPOINTS.SUBMIT` |
| List contact messages (admin) | GET | `/api/admin/contact` | `CONTACT_ENDPOINTS.LIST` |
| Get contact message by ID (admin) | GET | `/api/admin/contact/:id` | `CONTACT_ENDPOINTS.DETAIL(id)` |
| Mark message as read (admin) | PATCH | `/api/admin/contact/:id/read` | `CONTACT_ENDPOINTS.MARK_READ(id)` |
| Mark message as replied (admin) | PATCH | `/api/admin/contact/:id/replied` | `CONTACT_ENDPOINTS.MARK_REPLIED(id)` |
| Delete message (admin) | DELETE | `/api/admin/contact/:id` | `CONTACT_ENDPOINTS.DELETE(id)` |

### 0.2 Response Shapes

**Submit / Action responses** (`ContactActionResponse`):

```json
{ "message": "Message sent successfully", "id": "uuid" }
```

**List response** (`ContactListResponse`):

```json
{
  "data": [ /* ContactMessage[] */ ],
  "meta": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

**Detail response** — single `ContactMessage` object.

**ContactMessage fields:**

| Field | Type | Nullable | Source |
|-------|------|----------|--------|
| `id` | string | no | `raw.id` |
| `fullName` | string | no | `raw.fullName` / `raw.full_name` |
| `email` | string | no | `raw.email` |
| `subject` | string | no | `raw.subject` |
| `message` | string | no | `raw.message` |
| `isRead` | boolean | no (default false) | `raw.isRead` / `raw.is_read` |
| `repliedAt` | string (ISO) | yes | `raw.repliedAt` / `raw.replied_at` |
| `ipAddress` | string | yes | `raw.ipAddress` / `raw.ip_address` |
| `createdAt` | string (ISO) | no | `raw.createdAt` / `raw.created_at` |
| `updatedAt` | string (ISO) | no | `raw.updatedAt` / `raw.updated_at` |

Both camelCase and snake_case keys are accepted by the `toContactMessage()` mapper.

### 0.3 Auth Transport

The backend expects **cookie-based auth** (HTTP-only cookie with session/JWT). The module uses `globalRequest` which forwards cookies automatically (`withCredentials`). Transport is swappable via `setContactTransport()` for testing or alternative auth schemes.

### 0.4 Error Contract

Errors are normalized to `ContactApiError`:

```ts
{ message: string; status: number; errors?: Record<string, string[]> }
```

Expected HTTP status codes:
- `400` — validation failure (`errors` will contain field-level messages)
- `401` — unauthenticated
- `403` — unauthorized (non-admin)
- `404` — message not found
- `409` — conflict (e.g., already deleted)
- `429` — rate limited
- `500` — server error

### 0.5 Host Prerequisites

The consuming Next.js app must provide:

1. **`QueryClientProvider`** from `@tanstack/react-query` mounted at the app root
2. **`globalRequest`** utility at `@/app/helpers/globalRequest` (or swap transport via `setContactTransport()`)
3. **Backend base URL** configured in the app's environment (handled by `globalRequest`)
4. **Its own UI layer** — this module exports only logic (types, hooks, API functions, validation)

### 0.6 Module Boundaries

**Inside the module (src/modules/contact/):**
- Domain types, DTOs, and type guards
- Pure validation and sanitization
- API transport abstraction and raw endpoint functions
- TanStack Query hooks with cache invalidation
- Optional zustand store for UI selection state
- Query key factory for deterministic cache keys

**Outside the module (consumer app responsibility):**
- Page components and routing
- Form UI and validation display
- List/detail layout and styling
- Error presentation (toasts, inline messages)
- Loading/empty/error states rendering
- TanStack Query provider setup
- Authentication state management

---

## Phase 5 — Consumer Contract

### Public API Surface

Import from the barrel:

```ts
import {
  // Hooks
  useSubmitContact,
  useContactList,
  useContactDetail,
  useMarkContactAsRead,
  useMarkContactAsReplied,
  useDeleteContact,
  useContactAdmin,

  // Validation
  validateContactDraft,
  sanitizeContactDraft,
  normalizeContactError,
  parseValidationErrors,

  // Query keys
  contactKeys,

  // API functions (for server contexts or custom mutations)
  submitContactMessageApi,
  getContactMessagesApi,
  getContactMessageByIdApi,
  markContactAsReadApi,
  markContactAsRepliedApi,
  deleteContactMessageApi,

  // Transport (for testing)
  setContactTransport,
  getContactTransport,

  // Constants
  CONTACT_LIMITS,
  CONTACT_SORT_FIELDS,
  CONTACT_ENDPOINTS,

  // Cache orchestration (for custom mutations)
  invalidateContactLists,
  invalidateContactDetail,
  removeContactDetail,

  // Types
  type CreateContactMessageDto,
  type ContactMessage,
  type ContactListResponse,
  type PaginationMeta,
  type ContactActionResponse,
  type ContactQueryParams,
  type ContactSortField,
  type ContactOrder,
  type ContactApiError,
  type ValidationErrorMap,
  type ContactSelectionState,
} from "@/modules/contact";
```

### Hook Usage Examples

```tsx
// Submit a contact message
const { mutate, isPending } = useSubmitContact();
mutate({ fullName, email, subject, message });

// Admin list with filters
const { data, isLoading } = useContactList({ page: 1, limit: 20, isRead: false });

// Admin detail
const { data } = useContactDetail("message-id");

// Mark as read
const { mutate: markRead } = useMarkContactAsRead();
markRead("message-id");

// Mark as replied
const { mutate: markReplied } = useMarkContactAsReplied();
markReplied("message-id");

// Delete
const { mutate: deleteMsg } = useDeleteContact();
deleteMsg("message-id");

// Combined admin state
const { list, detail, markAsRead, markAsReplied, deleteMessage } = useContactAdmin();
```

### Cache Behavior

| Mutation | Cache Effect |
|----------|-------------|
| `useSubmitContact` | No cache invalidation (public submit ≠ admin cache) |
| `useMarkContactAsRead` | Invalidates detail + all list variants |
| `useMarkContactAsReplied` | Invalidates detail + all list variants |
| `useDeleteContact` | Removes detail cache + invalidates all list variants |

### Portability Note

The module imports `globalRequest` from `@/app/helpers/globalRequest`. This is the project-wide transport convention. If copying to another project, either:
1. Provide a `globalRequest` at the same path, or
2. Use `setContactTransport()` with a custom adapter before calling any hooks/APIs.
