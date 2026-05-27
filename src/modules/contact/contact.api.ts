/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalRequest } from "@/app/helpers/globalRequest";
import type {
  CreateContactMessageDto,
  ContactMessage,
  ContactListResponse,
  ContactActionResponse,
  ContactQueryParams,
  ContactSortField,
  ContactOrder,
  ContactApiError,
  ValidationErrorMap,
} from "./contact.types";

/* =========================================================
   Constants
   ========================================================= */

export const CONTACT_LIMITS = {
  FULLNAME_MIN: 1,
  FULLNAME_MAX: 100,
  EMAIL_MAX: 255,
  SUBJECT_MAX: 200,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 5000,
  PAGE_MIN: 1,
  LIMIT_MIN: 1,
  LIMIT_MAX: 100,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
} as const;

export const CONTACT_SORT_FIELDS: readonly ContactSortField[] = [
  "createdAt",
  "updatedAt",
  "fullName",
  "email",
  "subject",
  "isRead",
] as const;

/* =========================================================
   Endpoints
   ========================================================= */

export const CONTACT_ENDPOINTS = {
  SUBMIT: "/api/contact",
  LIST: "/api/admin/contact",
  DETAIL: (id: string) => `/api/admin/contact/${id}`,
  MARK_READ: (id: string) => `/api/admin/contact/${id}/read`,
  MARK_REPLIED: (id: string) => `/api/admin/contact/${id}/replied`,
  DELETE: (id: string) => `/api/admin/contact/${id}`,
} as const;

/* =========================================================
   Validation Helpers (pure)
   ========================================================= */

export function validateContactDraft(dto: CreateContactMessageDto): ValidationErrorMap {
  const errors: ValidationErrorMap = {};
  const trimmed = sanitizeContactDraft(dto);

  if (!trimmed.fullName) {
    errors.fullName = "Full name is required";
  } else if (trimmed.fullName.length > CONTACT_LIMITS.FULLNAME_MAX) {
    errors.fullName = `Full name must be at most ${CONTACT_LIMITS.FULLNAME_MAX} characters`;
  }

  if (!trimmed.email) {
    errors.email = "Email is required";
  } else if (trimmed.email.length > CONTACT_LIMITS.EMAIL_MAX) {
    errors.email = `Email must be at most ${CONTACT_LIMITS.EMAIL_MAX} characters`;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
    errors.email = "Invalid email format";
  }

  if (!trimmed.subject) {
    errors.subject = "Subject is required";
  } else if (trimmed.subject.length > CONTACT_LIMITS.SUBJECT_MAX) {
    errors.subject = `Subject must be at most ${CONTACT_LIMITS.SUBJECT_MAX} characters`;
  }

  if (!trimmed.message) {
    errors.message = "Message is required";
  } else if (trimmed.message.length < CONTACT_LIMITS.MESSAGE_MIN) {
    errors.message = `Message must be at least ${CONTACT_LIMITS.MESSAGE_MIN} characters`;
  } else if (trimmed.message.length > CONTACT_LIMITS.MESSAGE_MAX) {
    errors.message = `Message must be at most ${CONTACT_LIMITS.MESSAGE_MAX} characters`;
  }

  return errors;
}

export function sanitizeContactDraft(dto: CreateContactMessageDto): CreateContactMessageDto {
  return {
    fullName: dto.fullName.trim(),
    email: dto.email.trim(),
    subject: dto.subject.trim(),
    message: dto.message.trim(),
  };
}

/* =========================================================
   Query Param Builders
   ========================================================= */

export function normalizeSortField(field: string | undefined): ContactSortField {
  if (field && (CONTACT_SORT_FIELDS as readonly string[]).includes(field)) {
    return field as ContactSortField;
  }
  return "createdAt";
}

export function normalizeOrder(order: string | undefined): ContactOrder {
  return order === "ASC" ? "ASC" : "DESC";
}

export function buildContactQueryParams(params: ContactQueryParams): string {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(Math.max(params.page ?? CONTACT_LIMITS.DEFAULT_PAGE, CONTACT_LIMITS.PAGE_MIN)));
  searchParams.set("limit", String(Math.min(Math.max(params.limit ?? CONTACT_LIMITS.DEFAULT_LIMIT, CONTACT_LIMITS.LIMIT_MIN), CONTACT_LIMITS.LIMIT_MAX)));
  searchParams.set("sortBy", normalizeSortField(params.sortBy));
  searchParams.set("order", normalizeOrder(params.order));

  if (params.isRead !== undefined) {
    searchParams.set("isRead", String(params.isRead));
  }

  return searchParams.toString();
}

/* =========================================================
   Error Normalization
   ========================================================= */

export function normalizeContactError(error: unknown): ContactApiError {
  if (error && typeof error === "object" && "message" in error) {
    return {
      message: (error as any).message ?? "An unexpected error occurred",
      status: (error as any).status ?? 500,
      errors: (error as any).errors,
    };
  }
  return { message: "An unexpected error occurred", status: 500 };
}

export function parseValidationErrors(
  errors?: Record<string, string[]>,
): ValidationErrorMap {
  if (!errors) return {};
  const map: ValidationErrorMap = {};
  for (const [field, messages] of Object.entries(errors)) {
    map[field] = messages[0] ?? "Invalid value";
  }
  return map;
}

/* =========================================================
   Client + Transport
   ========================================================= */

interface Transport {
  get<T = any>(endpoint: string): Promise<T>;
  post<T = any>(endpoint: string, body?: unknown): Promise<T>;
  patch<T = any>(endpoint: string, body?: unknown): Promise<T>;
  delete<T = any>(endpoint: string): Promise<T>;
}

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

const defaultTransport: Transport = {
  get: <T>(endpoint: string) => transportRequest<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    transportRequest<T>(endpoint, "POST", body),
  patch: <T>(endpoint: string, body?: unknown) =>
    transportRequest<T>(endpoint, "PATCH", body),
  delete: <T>(endpoint: string) => transportRequest<T>(endpoint, "DELETE"),
};

let activeTransport: Transport = defaultTransport;

export function setContactTransport(transport: Transport) {
  activeTransport = transport;
}

export function getContactTransport(): Transport {
  return activeTransport;
}

/* =========================================================
   Query Key Factory
   ========================================================= */

export const contactKeys = {
  all: ["contact"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (params?: ContactQueryParams) => {
    const normalized = params ? normalizeQueryParams(params) : undefined;
    return [...contactKeys.lists(), normalized].filter((v) => v !== undefined);
  },
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  mutations: () => [...contactKeys.all, "mutations"] as const,
};

function normalizeQueryParams(params: ContactQueryParams): Record<string, string> {
  return {
    page: String(Math.max(params.page ?? CONTACT_LIMITS.DEFAULT_PAGE, CONTACT_LIMITS.PAGE_MIN)),
    limit: String(Math.min(Math.max(params.limit ?? CONTACT_LIMITS.DEFAULT_LIMIT, CONTACT_LIMITS.LIMIT_MIN), CONTACT_LIMITS.LIMIT_MAX)),
    sortBy: normalizeSortField(params.sortBy),
    order: normalizeOrder(params.order),
    ...(params.isRead !== undefined ? { isRead: String(params.isRead) } : {}),
  };
}

/* =========================================================
   Response Mappers
   ========================================================= */

export function toContactMessage(raw: any): ContactMessage {
  return {
    id: raw.id,
    fullName: raw.fullName ?? raw.full_name ?? "",
    email: raw.email,
    subject: raw.subject,
    message: raw.message,
    isRead: raw.isRead ?? raw.is_read ?? false,
    repliedAt: raw.repliedAt ?? raw.replied_at ?? null,
    ipAddress: raw.ipAddress ?? raw.ip_address ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}

/* =========================================================
   Raw API Functions
   ========================================================= */

export async function submitContactMessageApi(
  dto: CreateContactMessageDto,
  transport?: Transport,
): Promise<ContactActionResponse> {
  const t = transport ?? activeTransport;
  return t.post<ContactActionResponse>(CONTACT_ENDPOINTS.SUBMIT, dto);
}

export async function getContactMessagesApi(
  params: ContactQueryParams = {},
  transport?: Transport,
): Promise<ContactListResponse> {
  const t = transport ?? activeTransport;
  const qs = buildContactQueryParams(params);
  const endpoint = `${CONTACT_ENDPOINTS.LIST}?${qs}`;
  const raw = await t.get<any>(endpoint);
  return {
    data: (raw.data ?? []).map(toContactMessage),
    meta: raw.meta ?? {
      page: params.page ?? CONTACT_LIMITS.DEFAULT_PAGE,
      limit: params.limit ?? CONTACT_LIMITS.DEFAULT_LIMIT,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getContactMessageByIdApi(
  id: string,
  transport?: Transport,
): Promise<ContactMessage> {
  const t = transport ?? activeTransport;
  const raw = await t.get(CONTACT_ENDPOINTS.DETAIL(id));
  return toContactMessage(raw);
}

export async function markContactAsReadApi(
  id: string,
  transport?: Transport,
): Promise<ContactActionResponse> {
  const t = transport ?? activeTransport;
  return t.patch<ContactActionResponse>(CONTACT_ENDPOINTS.MARK_READ(id));
}

export async function markContactAsRepliedApi(
  id: string,
  transport?: Transport,
): Promise<ContactActionResponse> {
  const t = transport ?? activeTransport;
  return t.patch<ContactActionResponse>(CONTACT_ENDPOINTS.MARK_REPLIED(id));
}

export async function deleteContactMessageApi(
  id: string,
  transport?: Transport,
): Promise<ContactActionResponse> {
  const t = transport ?? activeTransport;
  return t.delete<ContactActionResponse>(CONTACT_ENDPOINTS.DELETE(id));
}

/* =========================================================
   Services / Orchestration
   ========================================================= */

import type { QueryClient } from "@tanstack/react-query";

export function invalidateContactLists(
  queryClient: QueryClient,
  params?: ContactQueryParams,
) {
  if (params) {
    queryClient.invalidateQueries({
      queryKey: contactKeys.list(params),
    });
    return;
  }
  queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
}

export function invalidateContactDetail(
  queryClient: QueryClient,
  id: string,
) {
  queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
}

export function removeContactDetail(
  queryClient: QueryClient,
  id: string,
) {
  queryClient.removeQueries({ queryKey: contactKeys.detail(id) });
}
