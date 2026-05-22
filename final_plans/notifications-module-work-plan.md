# Notifications Module — Frontend Work Plan (Modular Plug-and-Play Edition)

> **Source:** `integrations_plans/notifications-integration-plan.md`
> **Backend:** NestJS v11 · TypeORM · PostgreSQL · Pusher (Realtime)
> **Frontend:** Next.js 16 (App Router) · React 19 · TypeScript · Zustand · React Query · Pusher
> **Created:** 2026-05-22
> **Status:** Approved (Modular Architecture Revision)

---

## Executive Summary: Plug-and-Play Architecture

To build a **100% plug-and-play** notification system that can be dropped into any Next.js project and work instantly, we avoid spreading feature logic across global folders (`helpers/`, `hooks/`, `store/`, `types/`) as cautioned in the project's `AGENTS.md`.

Instead, the entire system is encapsulated inside a single module folder: **`app/modules/notifications/`**.

The host project only needs to create minimal, one-line "entry point shells" in the standard Next.js route folders (e.g. `app/api/...` and `app/(pathes)/...`) that import and re-export the modular handlers and pages. This keeps the global codebase completely clean and guarantees total portability.

---

## Table of Contents

- [Phase 0 — Project Setup & Foundations](#phase-0--project-setup--foundations)
- [Phase 1 — TypeScript Types & Enums](#phase-1--typescript-types--enums)
- [Phase 2 — Isolated API Client & API Functions](#phase-2--isolated-api-client--api-functions)
- [Phase 3 — Realtime Pusher Connection & Auth Proxy Route](#phase-3--realtime-pusher-connection--auth-proxy-route)
- [Phase 4 — Typesafe React Query Hooks & Cache Invalidation](#phase-4--typesafe-react-query-hooks--cache-invalidation)
- [Phase 5 — Centralized Event Bus & Pusher Hook](#phase-5--centralized-event-bus--pusher-hook)
- [Phase 6 — Styled UI Components (The Innovation Frame)](#phase-6--styled-ui-components-the-innovation-frame)
- [Phase 7 — User Page & Preferences Toggles](#phase-7--user-page--preferences-toggles)
- [Phase 8 — Admin Control Dashboard & Broadcast Forms](#phase-8--admin-control-dashboard--broadcast-forms)
- [Phase 9 — Skeletons, Error Handlers & Polling Fallback](#phase-9--skeletons-error-handlers--polling-fallback)
- [Appendix A — Complete File Tree](#appendix-a--complete-file-tree)
- [Appendix B — Caching & Invalidation Matrix](#appendix-b--caching--invalidation-matrix)
- [Appendix C — How to Port This Module to Another Project](#appendix-c--how-to-port-this-module-to-another-project)
- [Dependency Graph & Recommended Order](#dependency-graph--recommended-order)

---

## Phase 0 — Project Setup & Foundations

**Goal:** Establish the self-contained module structure and ensure the peer-dependency tools (Pusher client and React Query) are verified.

### Tasks

| #   | Task                                   | Details                                                                                                                                                                                                                   | Depends On |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 0.1 | Add `pusher-js` to project             | Run `pnpm add pusher-js` to equip the application with the client-side realtime WebSocket engine.                                                                                                                         | —          |
| 0.2 | Verify `QueryClientProvider` setup     | Ensure the project's root layout contains a TanStack React Query provider to support the module's server-state hooks.                                                                                                     | —          |
| 0.3 | Add Pusher credentials to `.env.local` | Confirm `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` are populated.                                                                                                                                          | —          |
| 0.4 | Create Notifications module directory  | Initialize the structure: `src/modules/notifications/` with 4 core files (`notifications.api.ts`, `notifications.hooks.ts`, `notifications.store.ts`, `notifications.types.ts`), `index.ts`, and `components/` subfolder. | —          |

### Deliverables

- `pusher-js` installed in project dependencies.
- Environment variables verified in `.env.local`.
- Encapsulated directory structure `app/modules/notifications/` initialized.

---

## Phase 1 — TypeScript Types & Enums

**Goal:** Declare strongly typed data models, request payloads, response templates, and websocket events in a single isolated types contract.

### Tasks

| #   | Task                                      | Details                                                                                                                                       | Files                                                    |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1.1 | Create isolated types file                | Initialize all notification and preference contracts in `app/modules/notifications/types/notifications.types.ts`.                             | `app/modules/notifications/types/notifications.types.ts` |
| 1.2 | Define `NotificationType` enum            | Expose `ORDER_UPDATED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `SYSTEM`, and `BROADCAST` categories.                                            | `app/modules/notifications/types/notifications.types.ts` |
| 1.3 | Define `Notification` contract            | Declare fields: `id` (UUID), `userId`, `type` (Enum), `title`, `message`, `data` (Record JSON), `isRead`, `readAt`, `isDeleted`, `createdAt`. | `app/modules/notifications/types/notifications.types.ts` |
| 1.4 | Define `NotificationPreferences` contract | Model standard toggles: `orderNotifications`, `paymentNotifications`, `systemNotifications`, `emailEnabled`, `pushEnabled`.                   | `app/modules/notifications/types/notifications.types.ts` |
| 1.5 | Define DTO contracts                      | Provide definitions for `CreateNotificationDto`, `BroadcastNotificationDto`, `UpdatePreferencesDto`, and Query DTOs.                          | `app/modules/notifications/types/notifications.types.ts` |
| 1.6 | Declare API response formats              | Model cursor templates `CursorPaginatedResponse<T>` (for users) and offset paginated templates `PaginatedNotifications<T>` (for admin).       | `app/modules/notifications/types/notifications.types.ts` |
| 1.7 | Declare WebSocket payloads                | Define structures for `NotificationEventPayload` (deduplicated with `eventId` UUIDs), read/delete events, and payment updates.                | `app/modules/notifications/types/notifications.types.ts` |
| 1.8 | Define local `ApiError` interface         | Shape error properties: `statusCode`, `message` (string or array), validation `errors?` list, and `timestamp`.                                | `app/modules/notifications/types/notifications.types.ts` |

### Deliverables

- `app/modules/notifications/notifications.types.ts` — exporting 100% of the types and enums used by the module.

---

## Phase 2 — Isolated API Client & API Functions

**Goal:** Establish an independent, decoupled Axios instance for notifications with integrated JWT extraction and response error parsers, plus the 11 feature API endpoints.

### Tasks

| #   | Task                                | Details                                                                                                                                          | Files                                                   |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| 2.1 | Create self-contained Axios client  | Instantiate a dedicated client in `notifications.client.ts`. Includes standard timeout (10s) and reads the encrypted JWT cookie dynamically.     | `app/modules/notifications/api/notifications.client.ts` |
| 2.2 | Build error interceptor             | intercept errors and normalize the payload to match the `ApiError` format defined in Phase 1, isolating error mapping.                           | `app/modules/notifications/api/notifications.client.ts` |
| 2.3 | Write NestJS validation parser      | Write `parseValidationErrors(error: ApiError)` to map nested validation errors into a clean, key-value field error record for UI forms.          | `app/modules/notifications/api/notifications.client.ts` |
| 2.4 | Create notifications API engine     | Write the API endpoints. Import the isolated Axios client to communicate with backend.                                                           | `app/modules/notifications/api/notifications.api.ts`    |
| 2.5 | Implement user operations           | Code functions: `getNotifications(cursor, limit)`, `getUnreadCount()`, `markAsRead(id)`, `markAllAsRead()`, `deleteNotification(id)`.            | `app/modules/notifications/api/notifications.api.ts`    |
| 2.6 | Implement preference operations     | Code functions: `getPreferences()` and `updatePreferences(dto)` (passing parameters as query params to match the backend specification).         | `app/modules/notifications/api/notifications.api.ts`    |
| 2.7 | Implement administrative operations | Code functions: `adminListNotifications(query)`, `adminSendNotification(dto)`, `adminBroadcastNotification(dto)`, `adminDeleteNotification(id)`. | `app/modules/notifications/api/notifications.api.ts`    |

### Deliverables

- `app/modules/notifications/notifications.api.ts` — fully isolated Axios client + API operations + Pusher auth handler + constants + keys.

---

## Phase 3 — Realtime Pusher Connection & Auth Proxy Route

**Goal:** Establish the Pusher connection engine and write the handler for authorization proxying inside the module, keeping Next.js API endpoints decoupled.

### Tasks

| #   | Task                              | Details                                                                                                                                           | Files                                                  |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 3.1 | Implement Pusher Auth Handler     | Write the server handler `pusherAuthHandler(req: NextRequest)`. It extracts the cookie/headers and forwards them safely to the backend.           | `app/modules/notifications/api/pusher-auth.handler.ts` |
| 3.2 | Create Next.js API Shell Route    | Set up the routing shell `app/api/pusher/auth/route.ts`. It acts as a one-line delegate importing `pusherAuthHandler` from the module.            | `app/api/pusher/auth/route.ts`                         |
| 3.3 | Establish Pusher Client Singleton | Write a safe singleton instantiator `getPusherInstance()` targeting `authEndpoint: '/api/pusher/auth'` with robust lifecycle disconnect cleanups. | `app/modules/notifications/api/pusher.client.ts`       |

### Deliverables

- `app/modules/notifications/notifications.api.ts` — Pusher auth handler + client singleton.
- `app/api/pusher/auth/route.ts` — 1-line re-export routing shell in standard app router.

---

## Phase 4 — Typesafe React Query Hooks & Cache Invalidation

**Goal:** Declare strongly typed React Query queries and mutations coupled with automated cache invalidation logic.

### Tasks

| #   | Task                        | Details                                                                                                                                | Files                                                              |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 4.1 | Write key factory constants | Declare typesafe `notificationsKeys` factory. Prevents key collisions across the host application.                                     | `app/modules/notifications/constants/notifications.constants.ts`   |
| 4.2 | Create User Hooks package   | Code custom hooks `useNotifications`, `useUnreadCount`, and `useNotificationPreferences` utilizing staleTimes (30s, 10s, 5m).          | `app/modules/notifications/hooks/useNotifications.hook.ts`         |
| 4.3 | Add user mutation hooks     | Code mutations: `useMarkAsRead`, `useMarkAllAsRead`, `useDeleteNotification`, `useUpdatePreferences` with automated invalidations.     | `app/modules/notifications/hooks/useNotifications.hook.ts`         |
| 4.4 | Create Infinite query hook  | Code `useInfiniteNotifications` utilizing cursor-based `useInfiniteQuery`. Extracts `meta.nextCursor` for seamless list scrolling.     | `app/modules/notifications/hooks/useInfiniteNotifications.hook.ts` |
| 4.5 | Create Admin hooks package  | Code administrative queries and mutations: `useAdminNotifications`, `useAdminSendNotification`, `useAdminBroadcast`, `useAdminDelete`. | `app/modules/notifications/hooks/useAdminNotifications.hook.ts`    |

### Deliverables

- `app/modules/notifications/notifications.api.ts` — keys factory.
- `app/modules/notifications/notifications.hooks.ts` — all hooks combined (`useNotifications`, `useInfiniteNotifications`, `useAdminNotifications`).

---

## Phase 5 — Centralized Event Bus & Pusher Hook

**Goal:** Solve strict-mode re-subscription triggers and prevent WebSocket quota exhaustion by routing realtime Pusher events through a central Context Provider Event Bus.

### Context-to-Hook Architecture

```
                                      ┌───> usePusherEvent(onNotificationNew)
                                      │
Pusher WebSocket ───> Provider Bus ───┼───> usePusherEvent(onNotificationCount)
(One Connection)    (Deduplication)   │
                                      └───> usePusherEvent(onPaymentStatus)
```

### Tasks

| #   | Task                       | Details                                                                                                                                   | Files                                                         |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 5.1 | Code Central Provider      | Build `NotificationsProvider`. On mount (when `userId` active), creates **exactly one connection** to the user private channel.           | `app/modules/notifications/context/NotificationsProvider.tsx` |
| 5.2 | Build deduplication engine | Store processed event UUIDs inside a capped, central `seenEventIdsRef` Set (retaining the last 500 events) to prevent duplicate triggers. | `app/modules/notifications/context/NotificationsProvider.tsx` |
| 5.3 | Build listener registrar   | Provide helper subscription bindings inside the provider context to distribute event payloads downstream to custom hooks.                 | `app/modules/notifications/context/NotificationsProvider.tsx` |
| 5.4 | Code event consumer hook   | Build `usePusherEvent(eventName, callback)` hook. Binds the callback on mount and handles cleanup automatically on unmount.               | `app/modules/notifications/hooks/usePusherEvent.hook.ts`      |

### Deliverables

- `app/modules/notifications/context/NotificationsProvider.tsx` — connection manager & central bus.
- `app/modules/notifications/hooks/usePusherEvent.hook.ts` — lightweight listener hook.

---

## Phase 6 — Styled UI Components (The Innovation Frame)

**Goal:** Create premium, responsive, and interactive visual interfaces styled strictly to match **The Innovation Frame** guidelines (Space Grotesk typography, neutral surface cards, smooth micro-animations, and premium accents).

### Tasks

| #   | Task                       | Details                                                                                                                                                 | Files                                                               |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 6.1 | Code Notification Item     | Build `NotificationItem.tsx`. Includes type indicator icons (blue, cyan, yellow), relative relative timestamps, read/unread states, and action buttons. | `app/modules/notifications/components/NotificationItem.tsx`         |
| 6.2 | Code Realtime Feed         | Build `NotificationFeed.tsx`. Shows an interactive list matching local optimistic notifications and real-time pushes. Features a custom empty state.    | `app/modules/notifications/components/NotificationFeed.tsx`         |
| 6.3 | Code Infinite Feed         | Build `InfiniteNotificationFeed.tsx`. Uses an `IntersectionObserver` trigger at the list footer to fetch the next cursor page automatically.            | `app/modules/notifications/components/InfiniteNotificationFeed.tsx` |
| 6.4 | Code Navbar Badge          | Build `NotificationBadge.tsx`. Display a clean bell icon. Integrates real-time count badges that flash on updates.                                      | `app/modules/notifications/components/NotificationBadge.tsx`        |
| 6.5 | Create CSS/style constants | Map status-level tailwind styles (borders, text colors, background gradients) in `notifications.styles.ts` for clean code structure.                    | `app/modules/notifications/constants/notifications.styles.ts`       |

### Deliverables

- Premium notification feed modules designed in `app/modules/notifications/components/`.
- Styling tokens established in `app/modules/notifications/constants/notifications.styles.ts`.

---

## Phase 7 — User Page & Preferences Toggles

**Goal:** Create the user notification dashboard and account-level preference switches.

### Tasks

| #   | Task                           | Details                                                                                                                      | Files                                                              |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 7.1 | Build User Page Component      | Write `UserNotificationsPage.tsx`. Contains list headers, "Mark all as read" button, and `InfiniteNotificationFeed`.         | `app/modules/notifications/components/UserNotificationsPage.tsx`   |
| 7.2 | Create Next.js User Page Shell | Define routing entry `app/(pathes)/notifications/page.tsx`. Shell simply imports and renders the modular User Page.          | `app/(pathes)/notifications/page.tsx`                              |
| 7.3 | Code preferences control card  | Build `NotificationPreferences.tsx`. Renders toggle switches mapped to React Query mutations to update settings immediately. | `app/modules/notifications/components/NotificationPreferences.tsx` |

### Deliverables

- `app/modules/notifications/components/UserNotificationsPage.tsx` & `NotificationPreferences.tsx`.
- `app/(pathes)/notifications/page.tsx` — routing page shell.

---

## Phase 8 — Admin Control Dashboard & Broadcast Forms

**Goal:** Create the administrative dashboard for sending, auditing, and deleting platform notifications.

### Tasks

| #   | Task                            | Details                                                                                                                       | Files                                                                |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 8.1 | Build Admin Dashboard Component | Write `AdminNotificationsPage.tsx`. Consists of search/filter fields, a paginated user list table, and delete rows.           | `app/modules/notifications/components/AdminNotificationsPage.tsx`    |
| 8.2 | Create Next.js Admin Page Shell | Setup entry route `app/admin/notifications/page.tsx`. Check admin roles before displaying the imported dashboard component.   | `app/admin/notifications/page.tsx`                                   |
| 8.3 | Build Targeted Send Form        | Code `SendNotificationForm.tsx`. Validates target user UUIDs, selects message categories, and submits targeted notifications. | `app/modules/notifications/components/SendNotificationForm.tsx`      |
| 8.4 | Build Global Announcement Form  | Code `BroadcastNotificationForm.tsx`. Admin form to broadcast announcements system-wide or target specific user groups.       | `app/modules/notifications/components/BroadcastNotificationForm.tsx` |

### Deliverables

- Isolated admin dashboard components under `app/modules/notifications/components/`.
- Routing entry shell `app/admin/notifications/page.tsx`.

---

## Phase 9 — Skeletons, Error Handlers & Polling Fallback

**Goal:** Incorporate graceful error logging, loading skeletons, and connection fallbacks to guarantee robust operation under network failures.

### Tasks

| #   | Task                          | Details                                                                                                                                     | Files                                                      |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 9.1 | Build Loading Skeletons       | Create pulse items (`framer-motion` or CSS pulse animations) to replace badges, feeds, and preference controls during loading.              | `app/modules/notifications/components/`                    |
| 9.2 | Code Zustand UI state store   | Create `notifications.store.ts` inside the module directory to manage UI states (e.g., drawer toggling, active filter categories).          | `app/modules/notifications/store/notifications.store.ts`   |
| 9.3 | Add Polling Fallback          | If the Pusher connection goes offline, fallback to a 60-second background polling cycle in `useNotifications` to keep count badges updated. | `app/modules/notifications/hooks/useNotifications.hook.ts` |
| 9.4 | Add Error Boundaries & Toasts | Attach error hooks to Sonner Toast alert popups. Show contextual validation errors on admin forms using `parseValidationErrors`.            | All components                                             |

### Deliverables

- Dynamic loading skeletons, fallback polling mechanism, and Zustand UI state store.

---

## Appendix A — Complete File Tree

This file tree demonstrates the structure of the module. Only four tiny shell files exist outside the modular root:

```
frontend/
├── app/
│   ├── modules/
│   │   └── notifications/                            ← NEW (Self-Contained Module Folder)
│   │       ├── index.ts                              # Export portal
│   │       ├── notifications.api.ts                  # API client + endpoints + Pusher client/auth + constants + keys + provider
│   │       ├── notifications.hooks.ts                # All hooks (useNotifications, useInfiniteNotifications, useAdminNotifications, usePusherEvent)
│   │       ├── notifications.store.ts                # Zustand UI state store
│   │       ├── notifications.types.ts                # All types, enums, DTOs
│   │       └── components/                           # UI components (remain separate)
│   │           ├── NotificationBadge.tsx
│   │           ├── NotificationItem.tsx
│   │           ├── NotificationFeed.tsx
│   │           ├── InfiniteNotificationFeed.tsx
│   │           ├── NotificationPreferences.tsx
│   │           ├── UserNotificationsPage.tsx
│   │           ├── AdminNotificationsPage.tsx
│   │           ├── SendNotificationForm.tsx
│   │           └── BroadcastNotificationForm.tsx
│   │
│   │   /* --- Minimal Integration Shell Routes --- */
│   ├── (pathes)/
│   │   └── notifications/
│   │       └── page.tsx                              ← NEW (1-liner user dashboard view re-export)
│   ├── admin/
│   │   └── notifications/
│   │       └── page.tsx                              ← NEW (1-liner admin board view re-export)
│   ├── api/
│   │   └── pusher/
│   │       └── auth/
│   │           └── route.ts                          ← NEW (1-liner proxy api route re-export)
```

---

## Appendix B — Caching & Invalidation Matrix

| Mutation                      | Action                          | Target Key Invalidation                                        |
| ----------------------------- | ------------------------------- | -------------------------------------------------------------- |
| `markAsRead(id)`              | User reads notification         | `notificationsKeys.lists()`, `notificationsKeys.unreadCount()` |
| `markAllAsRead()`             | User reads all                  | `notificationsKeys.lists()`, `notificationsKeys.unreadCount()` |
| `deleteNotification(id)`      | User soft deletes notification  | `notificationsKeys.lists()`, `notificationsKeys.unreadCount()` |
| `updatePreferences(dto)`      | User updates preferences        | `notificationsKeys.preferences()`                              |
| `adminSendNotification(dto)`  | Admin sends to user             | `notificationsKeys.adminLists()`                               |
| `adminBroadcastNotification`  | Admin broadcasts global message | `notificationsKeys.adminLists()`                               |
| `adminDeleteNotification(id)` | Admin hard deletes notification | `notificationsKeys.adminLists()`                               |

---

## Appendix C — How to Port This Module to Another Project

Copying this module into another project takes less than two minutes:

1. **Copy Folder:** Copy the folder `/app/modules/notifications` into the new project's `/app/modules/` (or `/src/app/modules/`) directory.
2. **Install Peer Dependencies:** Ensure `pusher-js`, `@tanstack/react-query`, `axios`, and `zustand` are installed in the new project.
3. **Configure Environment Variables:** Add your Pusher App Credentials into the new project's `.env` configuration file.
4. **Create Shell Routes:** Create the three one-line route files:
   - In `app/api/pusher/auth/route.ts`:
     ```typescript
     export { pusherAuthHandler as POST } from "@/app/modules/notifications/api/pusher-auth.handler";
     ```
   - In `app/notifications/page.tsx`:
     ```typescript
     import { UserNotificationsPage } from "@/app/modules/notifications/components/UserNotificationsPage";
     export default UserNotificationsPage;
     ```
   - In `app/admin/notifications/page.tsx` (wrap in your project's Admin authentication guard):
     ```typescript
     import { AdminNotificationsPage } from "@/app/modules/notifications/components/AdminNotificationsPage";
     export default AdminNotificationsPage;
     ```
5. **Adjust Token Retrieval (If needed):** If the new project does not use cookie-based JWT authorization, simply update the token-retrieval function inside `app/modules/notifications/api/notifications.client.ts`.

---

## Dependency Graph & Recommended Order

```
[Phase 0: Foundations & Dirs]
            │
            ▼
[Phase 1: Types & Enums]
            │
            ▼
[Phase 2: Custom Client & Endpoints]
            │
      ┌─────┴────────────────────────┐
      ▼                              ▼
[Phase 3: Pusher Auth & Shell]   [Phase 4: React Query Hooks]
      │                              │
      ▼                              │
[Phase 5: Event Bus Context]         │
      │                              │
      └─────┬────────────────────────┘
            ▼
[Phase 6: Styled UI Components]
            │
      ┌─────┴────────────────────────┐
      ▼                              ▼
[Phase 7: User dashboard]        [Phase 8: Admin Board]
      │                              │
      └─────┬────────────────────────┘
            ▼
[Phase 9: Skeletons & Fallbacks]
```

### Development Priority Schedule

1. **Setup & Types (Phases 0 & 1):** Define strict type interfaces early to establish clear TypeScript contracts.
2. **API & Connection Bus (Phases 2, 3 & 5):** Create the dedicated Axios client, configure the auth proxy, and establish the `<NotificationsProvider>` central event bus to handle communication robustly.
3. **Query Engine & Hooks (Phase 4):** Code user-level, admin-level, and infinite-scrolling query hooks.
4. **UI components & Dashboards (Phases 6, 7 & 8):** Build the components and forms, wrapping standard layouts inside Next.js page shells.
5. **Robustness & Skeletons (Phase 9):** Implement loading skeletons, Zustand UI stores, and polling fallback intervals.
