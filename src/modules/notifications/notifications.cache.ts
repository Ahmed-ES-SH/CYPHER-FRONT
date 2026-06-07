import type { QueryClient } from "@tanstack/react-query";
import { notificationKeys } from "./notifications.api";
import type { NotificationQueryParams } from "./notifications.types";

export function invalidateNotificationLists(queryClient: QueryClient, params?: NotificationQueryParams) {
  if (params) {
    queryClient.invalidateQueries({ queryKey: notificationKeys.list(params) });
    return;
  }
  queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
}

export function invalidateUnreadCount(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
}

export function invalidatePreferences(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
}
