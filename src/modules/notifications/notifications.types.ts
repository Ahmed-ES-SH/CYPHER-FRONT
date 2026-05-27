/* =========================================================
   NOTIFICATION TYPES — Fully merged from work plan (Phases 1-4)
   Combines src/modules/ (body, priority, channel) with
   app/modules/ (WebSocket payloads, cursor pagination, ApiError)
========================================================= */

export enum NotificationType {
  ORDER_UPDATE = "order_update",
  PAYMENT_RECEIVED = "payment_received",
  PAYMENT_FAILED = "payment_failed",
  SHIPPING_UPDATE = "shipping_update",
  ACCOUNT_UPDATE = "account_update",
  PROMOTIONAL = "promotional",
  ADMIN_BROADCAST = "admin_broadcast",
  SYSTEM = "system",
}

export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export enum NotificationChannel {
  PUSH = "push",
  EMAIL = "email",
  IN_APP = "in_app",
  SMS = "sms",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  link?: string;
  image?: string;
  priority: NotificationPriority;
  channel: NotificationChannel;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface UnreadCount {
  total: number;
  byType: Partial<Record<NotificationType, number>>;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: PaginationMeta;
  unread: UnreadCount;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Cursor-based pagination (for user-facing infinite scroll) */
export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: CursorPaginationMeta;
}

export interface NotificationPreferences {
  email: NotificationChannelPreference;
  push: NotificationChannelPreference;
  sms: NotificationChannelPreference;
  in_app: NotificationChannelPreference;
}

export interface NotificationChannelPreference {
  enabled: boolean;
  types: NotificationType[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface UpdatePreferencesDto {
  email?: Partial<NotificationChannelPreference>;
  push?: Partial<NotificationChannelPreference>;
  sms?: Partial<NotificationChannelPreference>;
  in_app?: Partial<NotificationChannelPreference>;
}

export interface MarkAsReadDto {
  ids?: string[];
  all?: boolean;
  type?: NotificationType;
}

export interface MarkAsReadResponse {
  modified: number;
}

export interface PushSubscriptionRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  sortBy?: "createdAt" | "priority";
  order?: "ASC" | "DESC";
}

/** Cursor-based query params for infinite scroll */
export interface NotificationCursorQueryParams {
  cursor?: string;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
}

export interface AdminNotificationQueryParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  userId?: string;
  sortBy?: "createdAt" | "type";
  order?: "ASC" | "DESC";
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  link?: string;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
}

export interface AdminBroadcastDto {
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  userIds?: string[];
  link?: string;
  image?: string;
  data?: Record<string, unknown>;
  scheduledAt?: string;
}

export interface BroadcastResult {
  id: string;
  sent: number;
  failed: number;
  scheduledAt?: string;
}

export interface PusherConfig {
  appKey: string;
  cluster: string;
  channel: string;
  authEndpoint?: string;
}

export enum PusherEvent {
  NEW_NOTIFICATION = "new-notification",
  NOTIFICATION_READ = "notification-read",
  NOTIFICATION_READ_ALL = "notification-read-all",
  NOTIFICATION_DELETED = "notification-deleted",
  PAYMENT_UPDATE = "payment-update",
  UNREAD_COUNT = "unread-count",
}

/* =========================================================
   WebSocket Event Payloads (Phase 3 / Work Plan)
========================================================= */

export interface NotificationEventPayload {
  eventId: string;
  notification: Notification;
  type: "new" | "read" | "read_all" | "deleted";
}

export interface NotificationReadEventPayload {
  eventId: string;
  notificationId: string;
  readAt: string;
}

export interface NotificationDeletedEventPayload {
  eventId: string;
  notificationId: string;
}

export interface PaymentUpdateEventPayload {
  eventId: string;
  notificationId: string;
  status: "success" | "failed";
  orderId?: string;
}

/* =========================================================
   Error Types
========================================================= */

export interface NotificationApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

export type NotificationSortField = "createdAt" | "priority";
export type SortOrder = "ASC" | "DESC";
export type ValidationErrorMap = Record<string, string>;

