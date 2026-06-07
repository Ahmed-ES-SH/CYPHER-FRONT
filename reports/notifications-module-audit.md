# Notifications Module — Audit Report

> **Module:** `src/modules/notifications`
> **Date:** 2026-05-29
> **Scope:** Performance, Logic, Architecture, Security, DX

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Issue Index](#issue-index)
3. [Performance Issues](#performance-issues)
4. [Logic Issues](#logic-issues)
5. [Architecture Issues](#architecture-issues)
6. [Security Issues](#security-issues)
7. [UX / Accessibility Issues](#ux--accessibility-issues)
8. [Developer-Experience Issues](#developer-experience-issues)
9. [Missing Test Coverage](#missing-test-coverage)
10. [Quick-Win Fixes](#quick-win-fixes)

---

## Executive Summary

The `notifications` module is well-structured and follows the feature-first architecture defined in `AGENTS.md`. The transport abstraction, query-key factory, and cursor pagination design are solid. However, a series of **compounding issues** can cause real user-facing problems at scale:

- A **polling timer always fires** even when Pusher is already connected, causing unnecessary network traffic.
- The **Zustand `unreadCount` is a shadow copy** of server data that is never synced from the React Query cache, creating a persistent count mismatch.
- The **Pusher client singleton** leaks channels on every re-subscription because `pusher.unsubscribe()` is called inside the per-event cleanup instead of only when there are no remaining bindings.
- The **connection state check** (`isConnected`) is a snapshot at construction time, not reactive, so the UI always shows "disconnected" even when Pusher connects seconds later.
- **Double invalidation** on `markAsRead` / `markAllAsRead` refetches the full notification list AND the admin list needlessly.
- The **`handleDelete` in `UserNotificationsPage`** shows a confirmation toast but never actually calls a delete mutation.
- The **search input in `AdminNotificationsPage`** has no debounce and the backend parameter is unimplemented (TODO left in code).
- The **`formatRelativeTime` helper** is called on every render inside a list without memoization.
- **`any` casts** in the API layer and store bypass TypeScript's type safety.

---

## Issue Index

| # | Severity | Category | Location | Title |
|---|----------|----------|----------|-------|
| 1 | 🔴 High | Performance | `notifications.hooks.ts:88–94` | Polling timer fires unconditionally alongside Pusher |
| 2 | 🔴 High | Logic | `notifications.store.ts` / `NotificationBadge.tsx` | Zustand `unreadCount` never synced from server |
| 3 | 🔴 High | Logic | `UserNotificationsPage.tsx:41–51` | Delete handler shows toast but never deletes |
| 4 | 🟠 Medium | Performance | `notifications.client.ts:57–63` | Pusher channel leaked on every subscription cleanup |
| 5 | 🟠 Medium | Performance | `notifications.hooks.ts:102–108` | Double invalidation on mark-as-read floods refetch queue |
| 6 | 🟠 Medium | Logic | `notifications.client.ts:69` | `isConnected` is a stale snapshot, not reactive |
| 7 | 🟠 Medium | Performance | `NotificationItem.tsx:40–53` | `formatRelativeTime` recalculated on every render |
| 8 | 🟠 Medium | Architecture | `notifications.hooks.ts:207–229` | `useRealtimeNotifications` duplicates the provider's subscription |
| 9 | 🟠 Medium | Logic | `AdminNotificationsPage.tsx:51–55` | Search submits but backend `search` param is unimplemented |
| 10 | 🟡 Low | Performance | `NotificationsProvider.tsx:108–111` | Polling `setInterval` checking connection inside provider |
| 11 | 🟡 Low | Architecture | `notifications.api.ts:302` | `QueryClient` import at bottom of API file — wrong layer |
| 12 | 🟡 Low | Security | `pusher-auth.handler.ts:13–16` | Dual env-var fallback for backend URL silently hides misconfiguration |
| 13 | 🟡 Low | Architecture | `notifications.store.ts:13` | `any` type in `setFilter` weakens type safety |
| 14 | 🟡 Low | DX | `notifications.api.ts:1` | Module-level `eslint-disable` silences all `any` warnings |
| 15 | 🟡 Low | UX / A11y | `NotificationPreferences.tsx:125–145` | Toggle `<button>` missing `aria-label` |
| 16 | 🟡 Low | UX / A11y | `InfiniteNotificationFeed.tsx:62` | `unreadCount` hard-coded to `0` in infinite feed |
| 17 | 🟡 Low | Testing | `__tests__/` | No hook-level or component-level tests for critical paths |

---

## Performance Issues

---

### ISSUE-1 🔴 — Polling timer fires alongside Pusher (double-fetch)

**File:** [`notifications.hooks.ts`](../src/modules/notifications/notifications.hooks.ts) — Lines 70–94

**Problem:**
`useUnreadCount` sets up **two** independent `useEffect`s:
1. A Pusher subscription that invalidates on `new-notification`.
2. An unconditional `setInterval` that fires every 15 s regardless of whether Pusher is connected.

When Pusher is active, every real-time event triggers an immediate refetch **and** the polling timer fires 4× per minute on top of that. On a page with many users, this multiplies unnecessary API calls.

```ts
// Current — problematic
useEffect(() => {
  const interval = setInterval(() => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
  }, POLL_INTERVAL);
  return () => clearInterval(interval);
}, [queryClient]); // ← always runs, even when Pusher is active
```

**Fix:**
Make the polling interval **conditional** — only poll when Pusher is not configured or not connected. Use `isPusherConfigured()` as the gate:

```ts
// Fixed
useEffect(() => {
  // Skip polling when real-time updates are available
  if (isPusherConfigured()) return;

  const interval = setInterval(() => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
  }, POLL_INTERVAL);

  return () => clearInterval(interval);
}, [queryClient]);
```

---

### ISSUE-4 🟠 — Pusher channel leaked on every subscription cleanup

**File:** [`notifications.client.ts`](../src/modules/notifications/notifications.client.ts) — Lines 57–63

**Problem:**
The `subscribe` method in the `PusherClient` wrapper unbinds the event handler AND immediately calls `pusher.unsubscribe(channel)` in the cleanup function. However, the `NotificationsProvider` subscribes to **all** `PusherEvent` values on the **same channel** simultaneously. When any one subscription cleans up, it unsubscribes the entire channel — breaking all other event listeners for that channel.

```ts
// Current — problematic
subscribe: (channel, event, handler) => {
  const ch = pusher.subscribe(channel);
  ch.bind(event, handler);
  return () => {
    ch.unbind(event, handler);
    pusher.unsubscribe(channel); // ← kills the channel for ALL events
  };
},
```

**Fix:**
Track a binding reference count per channel. Only call `pusher.unsubscribe` when the last binding is removed:

```ts
// Fixed — reference-counted channel management
const channelRefs = new Map<string, { channel: ReturnType<typeof pusher.subscribe>; count: number }>();

subscribe: (channelName, event, handler) => {
  if (!channelRefs.has(channelName)) {
    channelRefs.set(channelName, { channel: pusher.subscribe(channelName), count: 0 });
  }
  const ref = channelRefs.get(channelName)!;
  ref.count++;
  ref.channel.bind(event, handler);

  return () => {
    ref.channel.unbind(event, handler);
    ref.count--;
    if (ref.count <= 0) {
      pusher.unsubscribe(channelName);
      channelRefs.delete(channelName);
    }
  };
},
```

---

### ISSUE-5 🟠 — Double invalidation on mark-as-read floods refetch queue

**File:** [`notifications.hooks.ts`](../src/modules/notifications/notifications.hooks.ts) — Lines 102–108

**Problem:**
`useMarkAsRead` and `useMarkAllAsRead` both call `invalidateNotificationLists(queryClient)` on success, which invalidates the entire `["notifications", "list"]` subtree. The `useSendBroadcast` hook additionally invalidates `notificationKeys.adminLists()`. These invalidations kick off multiple parallel refetches that often resolve the same stale data.

For `useMarkAsRead`, the better strategy is an **optimistic update** on the specific notification item rather than a full list refetch — marking `isRead: true` on the cached item immediately.

**Fix — Optimistic update for `useMarkAsRead`:**
```ts
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkAsReadResponse, Error, MarkAsReadDto>({
    mutationFn: (dto) => markAsReadApi(dto),

    onMutate: async (dto) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

      // Snapshot the previous value for rollback
      const previous = queryClient.getQueriesData({ queryKey: notificationKeys.lists() });

      // Optimistically mark notifications as read in the cache
      if (dto.ids) {
        queryClient.setQueriesData<NotificationListResponse>(
          { queryKey: notificationKeys.lists() },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((n) =>
                dto.ids!.includes(n.id) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
              ),
            };
          },
        );
      }

      return { previous };
    },

    onError: (_err, _dto, context) => {
      // Roll back on error
      if (context?.previous) {
        context.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
    },

    onSettled: () => {
      // Refetch once after mutation settles to get authoritative server state
      invalidateUnreadCount(queryClient);
    },
  });
}
```

---

### ISSUE-7 🟠 — `formatRelativeTime` recalculated on every render

**File:** [`NotificationItem.tsx`](../src/modules/notifications/components/NotificationItem.tsx) — Lines 40–53

**Problem:**
`formatRelativeTime` calls `Date.now()` on every render. Inside a long list animated by Framer Motion (which can trigger re-renders during animation), this function runs repeatedly with no memoization. It also has a subtle bug: the `"Just now"` branch uses `< 1` minutes which means anything under 60 seconds — but a notification created exactly 59 seconds ago shows "Just now" which is imprecise.

**Fix:**
Memoize the call with `useMemo` inside the component, or extract the result via a custom `useRelativeTime` hook. For lists, also consider debouncing the parent re-render:

```ts
// In NotificationItem.tsx
const relativeTime = useMemo(
  () => formatRelativeTime(notification.createdAt),
  [notification.createdAt],
);
```

---

### ISSUE-10 🟡 — `setInterval` connection check inside `NotificationsProvider`

**File:** [`NotificationsProvider.tsx`](../src/modules/notifications/context/NotificationsProvider.tsx) — Lines 107–111

**Problem:**
A `setInterval` running every 5 s polls `getPusherClient()?.isConnected` to update the `isConnected` state. Since `isConnected` is a **snapshot taken at client construction time** (see Issue-6), this polling never reflects reality. It also creates an interval per-mount of the provider and causes a state update every 5 s even when connection state hasn't changed.

**Fix:**
Replace the poll with a Pusher connection-state event listener:

```ts
// In getPusherClient(), expose the raw pusher instance connection events
// In NotificationsProvider.tsx
useEffect(() => {
  if (!enabled || !userId) return;
  const client = getPusherClient();
  if (!client) return;

  // Subscribe to connection state changes rather than polling
  const pusherInstance = getPusherRawInstance(); // expose raw pusher
  const handleConnected = () => setIsConnected(true);
  const handleDisconnected = () => setIsConnected(false);

  pusherInstance.connection.bind('connected', handleConnected);
  pusherInstance.connection.bind('disconnected', handleDisconnected);

  return () => {
    pusherInstance.connection.unbind('connected', handleConnected);
    pusherInstance.connection.unbind('disconnected', handleDisconnected);
  };
}, [userId, enabled]);
```

---

## Logic Issues

---

### ISSUE-2 🔴 — Zustand `unreadCount` never synced from server

**File:** [`notifications.store.ts`](../src/modules/notifications/notifications.store.ts) + [`NotificationBadge.tsx`](../src/modules/notifications/components/NotificationBadge.tsx)

**Problem:**
`NotificationBadge` correctly reads from `useUnreadCount()` (React Query). But `useNotificationStore` also holds `unreadCount` and `decrementUnread()` — and **no code ever calls `setUnreadCount`** with the server value. This creates a zombie counter that defaults to `0` and is only decremented locally. Any consumer using `useNotificationStore().unreadCount` instead of the React Query hook will always display `0`.

**Fix — Two options:**

**Option A (Recommended):** Remove `unreadCount` from the Zustand store entirely. All consumers should read from `useUnreadCount()`:
```ts
// Remove from NotificationState interface:
// unreadCount: number;
// setUnreadCount: (count: number) => void;
// decrementUnread: () => void;
```

**Option B:** If local optimistic decrement is needed, sync the store from the React Query result in a bridge hook:
```ts
// hooks/useSyncUnreadCount.ts
export function useSyncUnreadCount() {
  const { data } = useUnreadCount();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (data?.total !== undefined) {
      setUnreadCount(data.total);
    }
  }, [data?.total, setUnreadCount]);
}
```

---

### ISSUE-3 🔴 — Delete handler in `UserNotificationsPage` is a no-op

**File:** [`UserNotificationsPage.tsx`](../src/modules/notifications/components/UserNotificationsPage.tsx) — Lines 41–51

**Problem:**
The `handleDelete` function shows a confirmation toast with a "Delete" action button — but clicking it only calls `toast.success("Notification deleted")`. **No mutation is invoked.** The notification remains in the database and re-appears on next refetch.

```ts
// Current — broken
const handleDelete = (id: string) => {
  toast("Delete notification?", {
    action: {
      label: "Delete",
      onClick: () => {
        // ← no actual delete call here!
        toast.success("Notification deleted");
      },
    },
  });
};
```

**Fix:**
Wire in `useAdminDeleteNotification` (or a user-facing delete mutation if the backend supports it):

```ts
// Fixed
const { mutate: deleteNotification } = useAdminDeleteNotification();

const handleDelete = (id: string) => {
  toast("Delete this notification?", {
    action: {
      label: "Delete",
      onClick: () => {
        deleteNotification(id, {
          onSuccess: () => toast.success("Notification deleted"),
          onError: (err) => toast.error(err.message || "Failed to delete"),
        });
      },
    },
  });
};
```

---

### ISSUE-6 🟠 — `isConnected` is a stale snapshot

**File:** [`notifications.client.ts`](../src/modules/notifications/notifications.client.ts) — Line 69

**Problem:**
```ts
isConnected: pusher.connection.state === "connected",
```
This evaluates the connection state **once at client construction time** and stores a boolean. Pusher connects asynchronously (usually 200–800 ms after initialization), so `isConnected` will almost always be `false` when first read. The `NotificationsProvider` and `usePusherEvent` both surface this stale value.

**Fix:**
Expose `isConnected` as a getter so it's evaluated at read time:

```ts
// In getPusherClient() — use getter
clientInstance = {
  subscribe: (...) => { ... },
  disconnect: () => { ... },
  get isConnected() {
    return pusher.connection.state === "connected";
  },
};
```

---

### ISSUE-8 🟠 — `useRealtimeNotifications` duplicates the provider's subscription

**File:** [`notifications.hooks.ts`](../src/modules/notifications/notifications.hooks.ts) — Lines 207–229

**Problem:**
`useRealtimeNotifications` directly calls `getPusherClient()` and subscribes to `PusherEvent.NEW_NOTIFICATION`. If a component is wrapped in `NotificationsProvider` (which already subscribes to all events and dispatches them), calling `useRealtimeNotifications` creates a **second independent Pusher subscription** for the same event on the same channel. This means the same event triggers the handler twice, and the channel leak from Issue-4 is also doubled.

`ToastManager` consumes `useRealtimeNotifications` — meaning any app that uses both `NotificationsProvider` and `ToastManager` will double-fire invalidations.

**Fix:**
Rewrite `useRealtimeNotifications` to use the `useEventBus` hook from the provider instead of subscribing directly:

```ts
// Fixed — use the provider's event bus, not a direct Pusher connection
export function useRealtimeNotifications(enabled = false) {
  const queryClient = useQueryClient();
  const { subscribe } = useEventBus();

  const handleNewNotification = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) return;
    return subscribe(PusherEvent.NEW_NOTIFICATION, handleNewNotification);
  }, [enabled, subscribe, handleNewNotification]);
}
```

> ⚠️ **Note:** This requires `useRealtimeNotifications` to be called inside a `<NotificationsProvider>` tree.

---

### ISSUE-9 🟠 — Search input has no debounce + backend param is unimplemented

**File:** [`AdminNotificationsPage.tsx`](../src/modules/notifications/components/AdminNotificationsPage.tsx) — Lines 51–55

**Problem:**
The search form fires `refetch()` on submit — which doesn't actually pass `searchQuery` to the API. The comment confirms: `/* TODO: Enable search once the backend supports a search query parameter */`. This means the search UI is completely non-functional and will silently confuse admins who type a query and expect filtered results.

Additionally, the `searchQuery` state is created and updated but never used in the `filters` object passed to `useAdminNotifications`.

**Fix (until backend supports search):**
Either remove the search input entirely to avoid misleading admins, or disable it with a visible `"Coming soon"` tooltip:

```tsx
{/* Option A — hide it until backend is ready */}
{process.env.NEXT_PUBLIC_ENABLE_NOTIFICATION_SEARCH === "true" && (
  <form onSubmit={handleSearch}>...</form>
)}

{/* Option B — visually disabled with explanation */}
<div className="relative flex-1 max-w-sm" title="Search is not yet available">
  <input
    disabled
    placeholder="Search (coming soon)"
    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-subtle text-sm opacity-50 cursor-not-allowed"
  />
</div>
```

**Fix (when backend search is ready):**
```ts
const filters: AdminNotificationQueryParams = {
  page,
  limit: 15,
  ...(typeFilter && { type: typeFilter as NotificationType }),
  ...(debouncedSearch && { search: debouncedSearch }), // add to type + API call
};
```

And add debounce to avoid a query on every keystroke:
```ts
const [searchQuery, setSearchQuery] = useState("");
const debouncedSearch = useDebounce(searchQuery, 400);

useEffect(() => {
  setPage(1); // reset pagination when search changes
}, [debouncedSearch]);
```

---

### ISSUE-16 🟡 — `unreadCount` hard-coded to `0` in `InfiniteNotificationFeed`

**File:** [`InfiniteNotificationFeed.tsx`](../src/modules/notifications/components/InfiniteNotificationFeed.tsx) — Line 62

**Problem:**
```ts
const unreadCount = 0; // Cursor pages don't include unread count; handled separately
```
The component passes `unreadCount={0}` to `NotificationFeed`, which hides the "Mark all read" button permanently in the infinite feed view — even when there are unread notifications.

**Fix:**
Derive the unread count from the flattened `notifications` array:

```ts
const notifications: Notification[] = data?.pages.flatMap((page) => page.data) ?? [];
const unreadCount = notifications.filter((n) => !n.isRead).length;
```

Or accept an external `unreadCount` prop injected from the page-level `useUnreadCount()` hook.

---

## Architecture Issues

---

### ISSUE-11 🟡 — `QueryClient` import at bottom of API file

**File:** [`notifications.api.ts`](../src/modules/notifications/notifications.api.ts) — Line 302

**Problem:**
`import type { QueryClient } from "@tanstack/react-query"` appears at line 302 — well below the function definitions that use it. More importantly, the `invalidateNotification*` helper functions that accept a `QueryClient` argument live in the API layer. Per the architecture in `AGENTS.md`, the API layer should contain **raw HTTP requests only**. Cache invalidation belongs in the hooks layer.

**Fix:**
Move the three invalidation helpers (`invalidateNotificationLists`, `invalidateUnreadCount`, `invalidatePreferences`) to `notifications.hooks.ts` or a dedicated `notifications.cache.ts` file:

```
src/modules/notifications/
├── notifications.api.ts       ← HTTP only, no QueryClient
├── notifications.cache.ts     ← invalidation helpers (new file)
└── notifications.hooks.ts     ← imports from both
```

---

### ISSUE-13 🟡 — `any` type in Zustand store `setFilter`

**File:** [`notifications.store.ts`](../src/modules/notifications/notifications.store.ts) — Line 13

**Problem:**
```ts
setFilter: (key: keyof NotificationQueryParams, value: any) => void;
```
The `any` type for `value` allows calling `setFilter("page", "not-a-number")` without a TypeScript error — silently corrupting the query params passed to the API.

**Fix:**
Use a conditional type to infer the correct value type for each key:

```ts
setFilter: <K extends keyof NotificationQueryParams>(
  key: K,
  value: NotificationQueryParams[K],
) => void;
```

---

## Security Issues

---

### ISSUE-12 🟡 — Dual env-var fallback for backend URL silently hides misconfiguration

**File:** [`pusher-auth.handler.ts`](../src/modules/notifications/pusher-auth.handler.ts) — Lines 13–16

**Problem:**
```ts
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACK_END_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:5000";
```
Three possible values are tried in order. If the production environment is missing **both** env vars, the handler silently falls back to `http://localhost:5000` — proxying Pusher auth requests to a non-existent local server and returning `500` to users. This makes misconfiguration invisible until auth starts failing.

Additionally, `NEXT_PUBLIC_` prefixed env vars are exposed to the browser bundle. A server-only secret like a backend URL should use a non-prefixed server-side env var.

**Fix:**
1. Use a single, non-prefixed env var for server-side use.
2. Throw (or warn loudly) at startup if not configured:

```ts
// pusher-auth.handler.ts
const BACKEND_URL = process.env.BACKEND_URL; // server-only, not NEXT_PUBLIC_

if (!BACKEND_URL) {
  throw new Error("[pusher-auth] BACKEND_URL environment variable is not set.");
}
```

---

## UX / Accessibility Issues

---

### ISSUE-15 🟡 — Toggle button missing `aria-label` in `NotificationPreferences`

**File:** [`NotificationPreferences.tsx`](../src/modules/notifications/components/NotificationPreferences.tsx) — Lines 125–145

**Problem:**
The `<button role="switch">` has `aria-checked` but no `aria-label`. Screen readers will announce "switch, checked" with no context about *which* channel is being toggled.

**Fix:**
```tsx
<button
  role="switch"
  aria-checked={isEnabled}
  aria-label={`${channel.label} — ${isEnabled ? "enabled" : "disabled"}`}
  onClick={() => handleToggle(channel.key)}
  disabled={isPending}
  ...
>
```

---

### ISSUE-16 🟡 (revisited) — No accessible "no more notifications" region announcement

**File:** [`InfiniteNotificationFeed.tsx`](../src/modules/notifications/components/InfiniteNotificationFeed.tsx) — Line 93–96

**Problem:**
The "You've reached the end" paragraph is visually rendered but not announced to screen readers when it appears after scrolling.

**Fix:**
Add `aria-live="polite"` and `role="status"` to announce end-of-list dynamically:

```tsx
{!hasNextPage && notifications.length > 0 && (
  <p
    role="status"
    aria-live="polite"
    className="text-center text-sm text-text-muted py-6"
  >
    You&apos;ve reached the end
  </p>
)}
```

---

## Developer-Experience Issues

---

### ISSUE-14 🟡 — Module-level `eslint-disable` silences all `any` warnings

**File:** [`notifications.api.ts`](../src/modules/notifications/notifications.api.ts) — Line 1

**Problem:**
```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
```
This blanket disable covers the entire 319-line file, hiding real type issues (e.g., `raw: any` in `toNotification`, `Transport` generics defaulting to `any`).

**Fix:**
Remove the file-level disable and apply narrower inline suppressions only where truly necessary. Most `any` usages in `toNotification` can be typed as `Record<string, unknown>`:

```ts
// Before
export function toNotification(raw: any): Notification {

// After
export function toNotification(raw: Record<string, unknown>): Notification {
  return {
    id: raw.id as string,
    userId: (raw.userId ?? raw.user_id ?? "") as string,
    // ...
  };
}
```

---

## Missing Test Coverage

**File:** [`__tests__/`](../src/modules/notifications/__tests__)

The existing tests cover API utility functions well. The following high-risk paths have **zero test coverage**:

| Missing Test | Risk |
|---|---|
| `useUnreadCount` — verifies Pusher subscription sets up and cleans up | High |
| `useMarkAsRead` — verifies optimistic update and rollback on error | High |
| `useRealtimeNotifications` — verifies duplicate subscription is not created | High |
| `NotificationsProvider` — verifies deduplication of events by `eventId` | Medium |
| `NotificationBadge` — renders correct count, shows skeleton while loading | Medium |
| `InfiniteNotificationFeed` — IntersectionObserver triggers `fetchNextPage` | Medium |
| `pusherAuthHandler` — returns 401 when cookie missing, 400 on bad body | High |

**Recommended test setup additions:**
```ts
// Example: testing the dedup logic in NotificationsProvider
it("drops duplicate events with same eventId", () => {
  const handler = vi.fn();
  // render provider, subscribe handler, fire same event twice
  // expect handler called once
});
```

---

## Quick-Win Fixes

These can be applied immediately with minimal risk:

| # | File | Change | Time |
|---|---|---|---|
| Q1 | `notifications.hooks.ts:88` | Gate polling behind `!isPusherConfigured()` | 5 min |
| Q2 | `notifications.client.ts:69` | Change `isConnected` to a getter | 5 min |
| Q3 | `NotificationItem.tsx:107` | Wrap `formatRelativeTime` in `useMemo` | 5 min |
| Q4 | `UserNotificationsPage.tsx:41` | Wire actual delete mutation in `handleDelete` | 10 min |
| Q5 | `InfiniteNotificationFeed.tsx:62` | Derive `unreadCount` from flattened array | 5 min |
| Q6 | `notifications.store.ts:13` | Replace `any` with conditional generic type | 10 min |
| Q7 | `NotificationPreferences.tsx:128` | Add `aria-label` to toggle button | 5 min |
| Q8 | `AdminNotificationsPage.tsx:53` | Disable/hide non-functional search UI | 5 min |

---

## Summary of Priority Actions

```
🔴 CRITICAL (fix before next release)
  ├── ISSUE-3: Delete in UserNotificationsPage is a no-op — data loss risk
  ├── ISSUE-2: Zustand unreadCount is never populated — stale UI for any consumer
  └── ISSUE-1: Polling + Pusher double-fetch — unnecessary server load

🟠 IMPORTANT (fix in next sprint)
  ├── ISSUE-4: Pusher channel leak on cleanup
  ├── ISSUE-5: Replace full-list invalidation with optimistic update on mark-read
  ├── ISSUE-6: isConnected is always false until page reload
  ├── ISSUE-8: useRealtimeNotifications bypasses provider, creates duplicate subscription
  └── ISSUE-9: Disable or implement admin search (currently a UX lie)

🟡 IMPROVEMENTS (backlog)
  ├── ISSUE-10: Remove 5s connection-state poll from provider
  ├── ISSUE-11: Move QueryClient helpers out of the API layer
  ├── ISSUE-12: Fix backend URL env var — use non-NEXT_PUBLIC_ + fail fast
  ├── ISSUE-13: Type-safe setFilter in Zustand store
  ├── ISSUE-14: Remove blanket eslint-disable in notifications.api.ts
  ├── ISSUE-15: Add aria-label to preference toggles
  ├── ISSUE-16: Fix hard-coded unreadCount=0 in InfiniteNotificationFeed
  └── Add hook + component test coverage for critical paths
```
