import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useSubscribePush,
  useAdminNotifications,
  useSendBroadcast,
  useNotificationManager,
} from "../notifications.hooks";
import * as api from "../notifications.api";
import type {
  Notification,
  NotificationListResponse,
  UnreadCount,
  NotificationPreferences,
} from "../notifications.types";
import { NotificationType, NotificationPriority, NotificationChannel } from "../notifications.types";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const mockNotification: Notification = {
  id: "n-1",
  userId: "u-1",
  type: NotificationType.ORDER_UPDATE,
  title: "Order Shipped",
  body: "Your order has shipped",
  link: "/orders/ord-1",
  priority: NotificationPriority.NORMAL,
  channel: NotificationChannel.IN_APP,
  isRead: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const mockListResponse: NotificationListResponse = {
  data: [mockNotification],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  unread: { total: 1, byType: { [NotificationType.ORDER_UPDATE]: 1 } },
};

const mockUnread: UnreadCount = {
  total: 5,
  byType: { [NotificationType.ORDER_UPDATE]: 2, [NotificationType.SYSTEM]: 3 },
};

const mockPreferences: NotificationPreferences = {
  email: { enabled: true, types: [NotificationType.ORDER_UPDATE, NotificationType.PAYMENT_RECEIVED] },
  push: { enabled: true, types: [NotificationType.ORDER_UPDATE] },
  sms: { enabled: false, types: [] },
  in_app: { enabled: true, types: [NotificationType.ORDER_UPDATE, NotificationType.PAYMENT_RECEIVED, NotificationType.SYSTEM] },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useNotifications", () => {
  it("fetches notification list", async () => {
    vi.spyOn(api, "getNotificationsApi").mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockListResponse);
  });

  it("fetches with custom params", async () => {
    const spy = vi.spyOn(api, "getNotificationsApi").mockResolvedValue(mockListResponse);

    renderHook(() => useNotifications({ type: NotificationType.ORDER_UPDATE }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});

describe("useUnreadCount", () => {
  it("fetches unread count", async () => {
    vi.spyOn(api, "getUnreadCountApi").mockResolvedValue(mockUnread);

    const { result } = renderHook(() => useUnreadCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUnread);
  });
});

describe("useMarkAsRead", () => {
  it("calls markAsReadApi with the dto", async () => {
    const spy = vi.spyOn(api, "markAsReadApi").mockResolvedValue({ modified: 1 });

    const { result } = renderHook(() => useMarkAsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ ids: ["n-1"] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ ids: ["n-1"] });
  });

  it("marks all as read", async () => {
    const spy = vi.spyOn(api, "markAsReadApi").mockResolvedValue({ modified: 5 });

    const { result } = renderHook(() => useMarkAsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ all: true });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ all: true });
  });
});

describe("useNotificationPreferences", () => {
  it("fetches preferences", async () => {
    vi.spyOn(api, "getNotificationPreferencesApi").mockResolvedValue(mockPreferences);

    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPreferences);
  });
});

describe("useUpdateNotificationPreferences", () => {
  it("calls updateNotificationPreferencesApi", async () => {
    const spy = vi.spyOn(api, "updateNotificationPreferencesApi").mockResolvedValue(mockPreferences);

    const { result } = renderHook(() => useUpdateNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ email: { enabled: false } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ email: { enabled: false } });
  });
});

describe("useSubscribePush", () => {
  it("calls subscribePushApi", async () => {
    const spy = vi.spyOn(api, "subscribePushApi").mockResolvedValue({ success: true });

    const { result } = renderHook(() => useSubscribePush(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      endpoint: "https://example.com/push",
      keys: { p256dh: "key", auth: "auth" },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({
      endpoint: "https://example.com/push",
      keys: { p256dh: "key", auth: "auth" },
    });
  });
});

describe("useAdminNotifications", () => {
  it("fetches admin notification list", async () => {
    vi.spyOn(api, "getAdminNotificationsApi").mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useAdminNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockListResponse);
  });
});

describe("useSendBroadcast", () => {
  it("calls sendBroadcastApi", async () => {
    const spy = vi.spyOn(api, "sendBroadcastApi").mockResolvedValue({
      id: "b-1",
      sent: 100,
      failed: 0,
    });

    const { result } = renderHook(() => useSendBroadcast(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      title: "Test",
      body: "Body",
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.NORMAL,
      channels: [NotificationChannel.IN_APP],
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalled();
  });
});

describe("useNotificationManager", () => {
  it("returns aggregated notification state", async () => {
    vi.spyOn(api, "getNotificationsApi").mockResolvedValue(mockListResponse);
    vi.spyOn(api, "getUnreadCountApi").mockResolvedValue(mockUnread);

    const { result } = renderHook(() => useNotificationManager(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications).toEqual([mockNotification]);
    expect(result.current.unread).toEqual(mockUnread);
    expect(result.current.meta).toEqual(mockListResponse.meta);
    expect(result.current.isError).toBe(false);
  });

  it("returns empty notifications array when no data", async () => {
    vi.spyOn(api, "getNotificationsApi").mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      unread: { total: 0, byType: {} },
    });
    vi.spyOn(api, "getUnreadCountApi").mockResolvedValue({ total: 0, byType: {} });

    const { result } = renderHook(() => useNotificationManager(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications).toEqual([]);
  });
});
