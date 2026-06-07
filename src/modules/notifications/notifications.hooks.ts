"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import type {
  Notification,
  NotificationListResponse,
  CursorPaginatedResponse,
  UnreadCount,
  NotificationPreferences,
  UpdatePreferencesDto,
  MarkAsReadDto,
  MarkAsReadResponse,
  PushSubscriptionRequest,
  CreateNotificationDto,
  AdminBroadcastDto,
  BroadcastResult,
  NotificationQueryParams,
  NotificationCursorQueryParams,
  AdminNotificationQueryParams,
} from "./notifications.types";
import { PusherEvent } from "./notifications.types";
import { getPusherConfigFromEnv } from "./notifications.config";
import {
  getNotificationsApi,
  getCursorNotificationsApi,
  getUnreadCountApi,
  markAsReadApi,
  getNotificationPreferencesApi,
  updateNotificationPreferencesApi,
  subscribePushApi,
  getAdminNotificationsApi,
  adminSendNotificationApi,
  sendBroadcastApi,
  adminDeleteNotificationApi,
  notificationKeys,
} from "./notifications.api";
import {
  invalidateNotificationLists,
  invalidateUnreadCount,
  invalidatePreferences,
} from "./notifications.cache";
import {
  NOTIFICATION_STALE_TIME,
  NOTIFICATION_GC_TIME,
  NOTIFICATION_RETRY,
  POLL_INTERVAL,
} from "./notifications.config";
import { getPusherClient, isPusherConfigured } from "./notifications.client";
import { useEventBus } from "./context/NotificationsProvider";

export function useNotifications(params: NotificationQueryParams = {}) {
  return useQuery<NotificationListResponse>({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotificationsApi(params),
    staleTime: NOTIFICATION_STALE_TIME,
    gcTime: NOTIFICATION_GC_TIME,
    retry: NOTIFICATION_RETRY,
  });
}

export function useUnreadCount() {
  const queryClient = useQueryClient();

  const query = useQuery<UnreadCount>({
    queryKey: notificationKeys.unread(),
    queryFn: () => getUnreadCountApi(),
    staleTime: 10 * 1000,
    gcTime: 60 * 1000,
    retry: NOTIFICATION_RETRY,
  });

  useEffect(() => {
    if (!isPusherConfigured()) return;

    const client = getPusherClient();
    if (!client) return;

    const pusherConfig = getPusherConfigFromEnv();
    const unsubscribe = client.subscribe(
      pusherConfig.channel,
      PusherEvent.NEW_NOTIFICATION,
      () => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      },
    );

    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    if (isPusherConfigured()) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [queryClient]);

  return query;
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkAsReadResponse, Error, MarkAsReadDto>({
    mutationFn: (dto) => markAsReadApi(dto),

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: notificationKeys.lists(),
      }) as [string[], NotificationListResponse | undefined][];

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
      const ctx = context as { previous: [string[], NotificationListResponse | undefined][] } | undefined;
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
    },

    onSettled: () => {
      invalidateUnreadCount(queryClient);
    },
  });
}

export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: notificationKeys.preferences(),
    queryFn: () => getNotificationPreferencesApi(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: NOTIFICATION_RETRY,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation<NotificationPreferences, Error, UpdatePreferencesDto>({
    mutationFn: (dto) => updateNotificationPreferencesApi(dto),
    onSuccess: () => {
      invalidatePreferences(queryClient);
    },
  });
}

export function useSubscribePush() {
  return useMutation<{ success: boolean }, Error, PushSubscriptionRequest>({
    mutationFn: (dto) => subscribePushApi(dto),
  });
}

export function useAdminNotifications(params: AdminNotificationQueryParams = {}) {
  return useQuery<NotificationListResponse>({
    queryKey: notificationKeys.adminList(params),
    queryFn: () => getAdminNotificationsApi(params),
    staleTime: NOTIFICATION_STALE_TIME,
    gcTime: NOTIFICATION_GC_TIME,
    retry: NOTIFICATION_RETRY,
  });
}

export function useSendBroadcast() {
  const queryClient = useQueryClient();

  return useMutation<BroadcastResult, Error, AdminBroadcastDto>({
    mutationFn: (dto) => sendBroadcastApi(dto),
    onSuccess: () => {
      invalidateNotificationLists(queryClient);
      queryClient.invalidateQueries({ queryKey: notificationKeys.adminLists() });
    },
  });
}

export function useInfiniteNotifications(params: NotificationCursorQueryParams = {}) {
  return useInfiniteQuery<CursorPaginatedResponse<Notification>>({
    queryKey: notificationKeys.infiniteList(params),
    queryFn: ({ pageParam }) =>
      getCursorNotificationsApi({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: NOTIFICATION_STALE_TIME,
    gcTime: NOTIFICATION_GC_TIME,
    retry: NOTIFICATION_RETRY,
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkAsReadResponse, Error>({
    mutationFn: () => markAsReadApi({ all: true }),
    onSuccess: () => {
      invalidateNotificationLists(queryClient);
      invalidateUnreadCount(queryClient);
    },
  });
}

export function useAdminSendNotification() {
  const queryClient = useQueryClient();

  return useMutation<Notification, Error, CreateNotificationDto>({
    mutationFn: (dto) => adminSendNotificationApi(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.adminLists() });
    },
  });
}

export function useAdminDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => adminDeleteNotificationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.adminLists() });
    },
  });
}

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

export function useNotificationManager(params: NotificationQueryParams = {}) {
  const list = useNotifications(params);
  const unread = useUnreadCount();
  const markAsRead = useMarkAsRead();

  return {
    notifications: list.data?.data ?? [],
    meta: list.data?.meta,
    unread: unread.data,
    isLoading: list.isPending,
    isError: list.isError,
    error: list.error,
    refetch: list.refetch,
    markAsRead: markAsRead.mutate,
    markAllAsRead: () => markAsRead.mutate({ all: true }),
    unreadLoading: unread.isPending,
  };
}
