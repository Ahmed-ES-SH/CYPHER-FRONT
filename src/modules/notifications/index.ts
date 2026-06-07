export { NotificationsPage } from "./components/pages/NotificationsPage";

/* ─── Hooks ─── */

export {
  useNotifications,
  useInfiniteNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useSubscribePush,
  useAdminNotifications,
  useAdminSendNotification,
  useAdminDeleteNotification,
  useSendBroadcast,
  useRealtimeNotifications,
  useNotificationManager,
} from "./notifications.hooks";

export { useNotificationStore } from "./notifications.store";

export { usePusherEvent } from "./hooks/usePusherEvent.hook";

/* ─── Components ─── */

export { ToastManager, showNotificationToast } from "./components/ToastManager";
export { NotificationItem } from "./components/NotificationItem";
export { NotificationFeed } from "./components/NotificationFeed";
export { InfiniteNotificationFeed } from "./components/InfiniteNotificationFeed";
export { NotificationBadge } from "./components/NotificationBadge";
export { NotificationPreferencesCard as NotificationPreferencesPanel } from "./components/NotificationPreferences";
export { UserNotificationsPage } from "./components/UserNotificationsPage";
export { AdminNotificationsPage } from "./components/AdminNotificationsPage";
export { SendNotificationForm } from "./components/SendNotificationForm";
export { BroadcastNotificationForm } from "./components/BroadcastNotificationForm";

/* ─── Skeletons ─── */

export {
  SkeletonNotificationItem,
  SkeletonNotificationFeed,
  SkeletonNotificationBadge,
  SkeletonNotificationPreferences,
} from "./components/SkeletonNotificationFeed";

/* ─── Context ─── */

export { NotificationsProvider, useEventBus } from "./context/NotificationsProvider";

/* ─── Client ─── */

export {
  configurePusher,
  isPusherConfigured,
  getPusherClient,
  getRawPusherInstance,
  resetPusherClient,
} from "./notifications.client";

/* ─── Types ─── */

export type {
  Notification,
  UnreadCount,
  NotificationListResponse,
  CursorPaginatedResponse,
  CursorPaginationMeta,
  PaginationMeta,
  NotificationPreferences,
  NotificationChannelPreference,
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
  PusherConfig,
  NotificationEventPayload,
  NotificationReadEventPayload,
  NotificationDeletedEventPayload,
  PaymentUpdateEventPayload,
  NotificationApiError,
  ValidationErrorMap,
} from "./notifications.types";

export {
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  PusherEvent,
} from "./notifications.types";

export type { NotificationState } from "./notifications.store";

/* ─── API ─── */

export {
  NOTIFICATION_ENDPOINTS,
  notificationKeys,
  setNotificationTransport,
  getNotificationTransport,
  validateAdminBroadcast,
  normalizeNotificationError,
  parseValidationErrors,
  buildNotificationQueryParams,
  buildCursorQueryParams,
  buildAdminQueryParams,
  toNotification,
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
} from "./notifications.api";

export {
  invalidateNotificationLists,
  invalidateUnreadCount,
  invalidatePreferences,
} from "./notifications.cache";

export { pusherAuthHandler } from "./pusher-auth.handler";

/* ─── Config ─── */

export {
  NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_STALE_TIME,
  NOTIFICATION_GC_TIME,
  NOTIFICATION_RETRY,
  POLL_INTERVAL,
  DEFAULT_PUSHER_CONFIG,
  getPusherConfigFromEnv,
  validatePusherConfig,
} from "./notifications.config";

/* ─── Styles ─── */

export {
  typeBorderColors,
  typeBgColors,
  typeIconColors,
  priorityBadgeStyles,
  priorityDotColors,
} from "./constants/notifications.styles";
