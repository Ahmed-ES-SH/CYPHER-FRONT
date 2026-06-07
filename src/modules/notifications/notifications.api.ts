import { globalRequest } from "@/app/helpers/globalRequest";
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
  NotificationApiError,
  ValidationErrorMap,
} from "./notifications.types";

export const NOTIFICATION_ENDPOINTS = {
  LIST: "/api/notifications",
  UNREAD: "/api/notifications/unread",
  MARK_READ: "/api/notifications/mark-read",
  PREFERENCES: "/api/notifications/preferences",
  SUBSCRIBE_PUSH: "/api/notifications/subscribe",
  ADMIN_LIST: "/api/admin/notifications",
  ADMIN_SEND: "/api/admin/notifications",
  ADMIN_BROADCAST: "/api/admin/notifications/broadcast",
  ADMIN_DELETE: (id: string) => `/api/admin/notifications/${id}`,
} as const;

export function validateAdminBroadcast(dto: AdminBroadcastDto): ValidationErrorMap {
  const errors: ValidationErrorMap = {};

  if (!dto.title || !dto.title.trim()) {
    errors.title = "Title is required";
  } else if (dto.title.length > 200) {
    errors.title = "Title must be at most 200 characters";
  }

  if (!dto.body || !dto.body.trim()) {
    errors.body = "Body is required";
  } else if (dto.body.length > 5000) {
    errors.body = "Body must be at most 5000 characters";
  }

  if (!dto.channels || dto.channels.length === 0) {
    errors.channels = "At least one channel is required";
  }

  if (dto.channels && dto.channels.length > 0) {
    dto.channels.forEach((channel, index) => {
      if (!["push", "email", "in_app", "sms"].includes(channel)) {
        errors[`channels.${index}`] = `Invalid channel: ${channel}`;
      }
    });
  }

  return errors;
}

export function normalizeNotificationError(error: unknown): NotificationApiError {
  if (error && typeof error === "object" && "message" in error) {
    const err = error as Record<string, unknown>;
    return {
      message: (err.message as string) ?? "An unexpected error occurred",
      status: (err.status as number) ?? 500,
      errors: err.errors as Record<string, string[]> | undefined,
    };
  }
  return { message: "An unexpected error occurred", status: 500 };
}

export function parseValidationErrors(errors?: Record<string, string[]>): ValidationErrorMap {
  if (!errors) return {};
  const map: ValidationErrorMap = {};
  for (const [field, messages] of Object.entries(errors)) {
    map[field] = messages[0] ?? "Invalid value";
  }
  return map;
}

export function buildNotificationQueryParams(params: NotificationQueryParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(Math.min(params.limit ?? 20, 100)));
  if (params.type) searchParams.set("type", params.type);
  if (params.isRead !== undefined) searchParams.set("isRead", String(params.isRead));
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.order) searchParams.set("order", params.order);
  return searchParams.toString();
}

export function buildCursorQueryParams(params: NotificationCursorQueryParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(Math.min(params.limit ?? 20, 100)));
  if (params.cursor) searchParams.set("cursor", params.cursor);
  if (params.type) searchParams.set("type", params.type);
  if (params.isRead !== undefined) searchParams.set("isRead", String(params.isRead));
  return searchParams.toString();
}

export function buildAdminQueryParams(params: AdminNotificationQueryParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(Math.min(params.limit ?? 20, 100)));
  if (params.type) searchParams.set("type", params.type);
  if (params.isRead !== undefined) searchParams.set("isRead", String(params.isRead));
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.order) searchParams.set("order", params.order);
  return searchParams.toString();
}

interface Transport {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, body?: unknown): Promise<T>;
  patch<T>(endpoint: string, body?: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

async function transportRequest<TResult>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    throw { message: res.message, status: res.statusCode ?? 500 } satisfies NotificationApiError;
  }
  return res.data as TResult;
}

const defaultTransport: Transport = {
  get: <T>(endpoint: string) => transportRequest<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) => transportRequest<T>(endpoint, "POST", body),
  patch: <T>(endpoint: string, body?: unknown) => transportRequest<T>(endpoint, "PATCH", body),
  delete: <T>(endpoint: string) => transportRequest<T>(endpoint, "DELETE"),
};

let activeTransport: Transport = defaultTransport;

export function setNotificationTransport(transport: Transport) {
  activeTransport = transport;
}

export function getNotificationTransport(): Transport {
  return activeTransport;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params?: NotificationQueryParams) => {
    return [...notificationKeys.lists(), params ?? {}] as const;
  },
  infiniteLists: () => [...notificationKeys.all, "infinite-list"] as const,
  infiniteList: (params?: NotificationCursorQueryParams) => {
    return [...notificationKeys.infiniteLists(), params ?? {}] as const;
  },
  details: () => [...notificationKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  unread: () => [...notificationKeys.all, "unread"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
  adminLists: () => [...notificationKeys.all, "admin-list"] as const,
  adminList: (params?: AdminNotificationQueryParams) => {
    return [...notificationKeys.adminLists(), params ?? {}] as const;
  },
};

export function toNotification(raw: Record<string, unknown>): Notification {
  return {
    id: raw.id as string,
    userId: (raw.userId ?? raw.user_id ?? "") as string,
    type: (raw.type ?? "system") as Notification["type"],
    title: (raw.title ?? "") as string,
    body: (raw.body ?? "") as string,
    data: raw.data as Record<string, unknown> | undefined,
    link: raw.link as string | undefined,
    image: raw.image as string | undefined,
    priority: (raw.priority ?? "normal") as Notification["priority"],
    channel: (raw.channel ?? "in_app") as Notification["channel"],
    isRead: (raw.isRead ?? raw.is_read ?? false) as boolean,
    readAt: (raw.readAt ?? raw.read_at ?? undefined) as string | undefined,
    createdAt: (raw.createdAt ?? raw.created_at ?? "") as string,
  };
}

export async function getNotificationsApi(
  params: NotificationQueryParams = {},
  transport?: Transport,
): Promise<NotificationListResponse> {
  const t = transport ?? activeTransport;
  const qs = buildNotificationQueryParams(params);
  const endpoint = `${NOTIFICATION_ENDPOINTS.LIST}?${qs}`;
  const raw = await t.get<Record<string, unknown>>(endpoint);
  return {
    data: ((raw.data ?? []) as Record<string, unknown>[]).map(toNotification),
    meta: (raw.meta ?? { page: params.page ?? 1, limit: params.limit ?? 20, total: 0, totalPages: 0 }) as NotificationListResponse["meta"],
    unread: (raw.unread ?? { total: 0, byType: {} }) as NotificationListResponse["unread"],
  };
}

export async function getUnreadCountApi(
  transport?: Transport,
): Promise<UnreadCount> {
  const t = transport ?? activeTransport;
  const raw = await t.get<Record<string, unknown>>(NOTIFICATION_ENDPOINTS.UNREAD);
  return {
    total: (raw.total ?? raw.count ?? 0) as number,
    byType: (raw.byType ?? raw.by_type ?? {}) as UnreadCount["byType"],
  };
}

export async function markAsReadApi(
  dto: MarkAsReadDto,
  transport?: Transport,
): Promise<MarkAsReadResponse> {
  const t = transport ?? activeTransport;
  return t.patch<MarkAsReadResponse>(NOTIFICATION_ENDPOINTS.MARK_READ, dto);
}

export async function getNotificationPreferencesApi(
  transport?: Transport,
): Promise<NotificationPreferences> {
  const t = transport ?? activeTransport;
  return t.get<NotificationPreferences>(NOTIFICATION_ENDPOINTS.PREFERENCES);
}

export async function updateNotificationPreferencesApi(
  dto: UpdatePreferencesDto,
  transport?: Transport,
): Promise<NotificationPreferences> {
  const t = transport ?? activeTransport;
  return t.patch<NotificationPreferences>(NOTIFICATION_ENDPOINTS.PREFERENCES, dto);
}

export async function subscribePushApi(
  dto: PushSubscriptionRequest,
  transport?: Transport,
): Promise<{ success: boolean }> {
  const t = transport ?? activeTransport;
  return t.post<{ success: boolean }>(NOTIFICATION_ENDPOINTS.SUBSCRIBE_PUSH, dto);
}

export async function getAdminNotificationsApi(
  params: AdminNotificationQueryParams = {},
  transport?: Transport,
): Promise<NotificationListResponse> {
  const t = transport ?? activeTransport;
  const qs = buildAdminQueryParams(params);
  const endpoint = `${NOTIFICATION_ENDPOINTS.ADMIN_LIST}?${qs}`;
  const raw = await t.get<Record<string, unknown>>(endpoint);
  return {
    data: ((raw.data ?? []) as Record<string, unknown>[]).map(toNotification),
    meta: (raw.meta ?? { page: params.page ?? 1, limit: params.limit ?? 20, total: 0, totalPages: 0 }) as NotificationListResponse["meta"],
    unread: (raw.unread ?? { total: 0, byType: {} }) as NotificationListResponse["unread"],
  };
}

export async function getCursorNotificationsApi(
  params: NotificationCursorQueryParams = {},
  transport?: Transport,
): Promise<CursorPaginatedResponse<Notification>> {
  const t = transport ?? activeTransport;
  const qs = buildCursorQueryParams(params);
  const endpoint = `${NOTIFICATION_ENDPOINTS.LIST}?${qs}`;
  const raw = await t.get<Record<string, unknown>>(endpoint);
  return {
    data: ((raw.data ?? []) as Record<string, unknown>[]).map(toNotification),
    meta: (raw.meta ?? { nextCursor: null, hasMore: false }) as CursorPaginatedResponse<Notification>["meta"],
  };
}

export async function adminSendNotificationApi(
  dto: CreateNotificationDto,
  transport?: Transport,
): Promise<Notification> {
  const t = transport ?? activeTransport;
  const raw = await t.post<Record<string, unknown>>(NOTIFICATION_ENDPOINTS.ADMIN_SEND, dto);
  return toNotification(raw);
}

export async function sendBroadcastApi(
  dto: AdminBroadcastDto,
  transport?: Transport,
): Promise<BroadcastResult> {
  const t = transport ?? activeTransport;
  return t.post<BroadcastResult>(NOTIFICATION_ENDPOINTS.ADMIN_BROADCAST, dto);
}

export async function adminDeleteNotificationApi(
  id: string,
  transport?: Transport,
): Promise<void> {
  const t = transport ?? activeTransport;
  await t.delete(NOTIFICATION_ENDPOINTS.ADMIN_DELETE(id));
}


