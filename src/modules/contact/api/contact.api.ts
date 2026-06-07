/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalRequest } from "@/app/helpers/globalRequest";
import {
  ContactApiError,
} from "../types/contact.types";
import type {
  CreateContactMessageDto,
  ContactMessage,
  ContactListResponse,
  ContactActionResponse,
  ContactQueryParams,
  ContactSortField,
  ContactOrder,
  ValidationErrorMap,
} from "../types/contact.types";

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

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export function sanitizeContactDraft(dto: Partial<CreateContactMessageDto>): CreateContactMessageDto {
  return {
    fullName: (typeof dto?.fullName === "string" ? dto.fullName : "").trim(),
    email: (typeof dto?.email === "string" ? dto.email : "").trim().toLowerCase(),
    subject: (typeof dto?.subject === "string" ? dto.subject : "").trim(),
    message: (typeof dto?.message === "string" ? dto.message : "").trim(),
  };
}

export function validateContactDraft(dto: Partial<CreateContactMessageDto>): ValidationErrorMap {
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
  } else if (!EMAIL_REGEX.test(trimmed.email)) {
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

/* =========================================================
   Query Param Builders
   ========================================================= */

export function normalizeContactParams(params: ContactQueryParams = {}): Required<ContactQueryParams> {
  return {
    page: Math.max(params.page ?? CONTACT_LIMITS.DEFAULT_PAGE, CONTACT_LIMITS.PAGE_MIN),
    limit: Math.min(Math.max(params.limit ?? CONTACT_LIMITS.DEFAULT_LIMIT, CONTACT_LIMITS.LIMIT_MIN), CONTACT_LIMITS.LIMIT_MAX),
    sortBy: normalizeSortField(params.sortBy),
    order: normalizeOrder(params.order),
    isRead: params.isRead ?? false,
  };
}

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
  const normalized = normalizeContactParams(params);
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(normalized.page));
  searchParams.set("limit", String(normalized.limit));
  searchParams.set("sortBy", normalized.sortBy);
  searchParams.set("order", normalized.order);
  searchParams.set("isRead", String(normalized.isRead));

  return searchParams.toString();
}

/* =========================================================
   Error Normalization
   ========================================================= */

export function normalizeContactError(error: unknown): ContactApiError {
  if (error && typeof error === "object" && "message" in error) {
    return new ContactApiError(
      (error as any).message ?? "An unexpected error occurred",
      (error as any).status ?? 500,
      (error as any).errors,
    );
  }
  return new ContactApiError("An unexpected error occurred", 500);
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

export interface Transport {
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
    throw new ContactApiError(
      res.message,
      res.statusCode ?? 500,
      res.errors,
    );
  }
  return res.data as TResult;
}

export async function browserTransportRequest<TResult = any>(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new ContactApiError(
      data.message || "An error occurred",
      res.status,
      data.errors,
    );
  }
  return data as TResult;
}

export function createBrowserTransport(): Transport {
  return {
    get: <T>(endpoint: string) => browserTransportRequest<T>(endpoint),
    post: <T>(endpoint: string, body?: unknown) =>
      browserTransportRequest<T>(endpoint, "POST", body),
    patch: <T>(endpoint: string, body?: unknown) =>
      browserTransportRequest<T>(endpoint, "PATCH", body),
    delete: <T>(endpoint: string) => browserTransportRequest<T>(endpoint, "DELETE"),
  };
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
    const normalized = params ? normalizeContactParams(params) : undefined;
    return [...contactKeys.lists(), normalized].filter((v) => v !== undefined);
  },
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  mutations: () => [...contactKeys.all, "mutations"] as const,
};

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
