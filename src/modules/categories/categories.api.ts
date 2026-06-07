/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalRequest } from "@/app/helpers/globalRequest";
import type {
  Category,
  CategoryDetails,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput,
  CategoryFilters,
  PaginatedCategories,
  DeleteCategoryResult,
  ApiError,
} from "./categories.types";
import { CategoryApiError } from "./categories.types";

/* =========================================================
   Transport Interface + Adapter
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
    throw new CategoryApiError(res.message, res.statusCode ?? 500, res.errors);
  }
  return res.data as TResult;
}

export const defaultTransport: Transport = {
  get: <T>(endpoint: string) => transportRequest<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    transportRequest<T>(endpoint, "POST", body),
  patch: <T>(endpoint: string, body?: unknown) =>
    transportRequest<T>(endpoint, "PATCH", body),
  delete: <T>(endpoint: string) => transportRequest<T>(endpoint, "DELETE"),
};

let activeTransport: Transport = defaultTransport;

export function setTransport(transport: Transport) {
  activeTransport = transport;
}

export function getActiveTransport(): Transport {
  return activeTransport;
}

/* =========================================================
   Error Parsing
   ========================================================= */

export function parseApiError(error: unknown): ApiError {
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
): Record<string, string> {
  if (!errors) return {};
  const map: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    map[field] = messages[0] ?? "Invalid value";
  }
  return map;
}

/* =========================================================
   Endpoint Constants
   ========================================================= */

export const CATEGORY_ENDPOINTS = {
  PUBLIC_LIST: "/api/categories",
  ALL_PUBLIC_LIST: "/api/categories/list",

  PUBLIC_DETAIL: (slug: string) => `/api/categories/${slug}`,
  ADMIN_LIST: "/api/admin/categories",
  ADMIN_DETAIL: (id: string) => `/api/admin/categories/${id}`,
  CREATE: "/api/admin/categories",
  UPDATE: (id: string) => `/api/admin/categories/${id}`,
  DELETE: (id: string) => `/api/admin/categories/${id}`,
  REORDER: "/api/admin/categories/reorder",
} as const;

/* =========================================================
   Query Key Factory
   ========================================================= */

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: CategoryFilters) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
  admin: () => [...categoryKeys.all, "admin"] as const,
  adminLists: () => [...categoryKeys.admin(), "list"] as const,
  adminList: (filters?: CategoryFilters) =>
    [...categoryKeys.adminLists(), filters] as const,
  adminDetails: () => [...categoryKeys.admin(), "detail"] as const,
  adminDetail: (id: string) => [...categoryKeys.adminDetails(), id] as const,
  mutations: () => [...categoryKeys.all, "mutations"] as const,
};

/* =========================================================
   Response Mappers
   ========================================================= */

export function toCategory(raw: any): Category {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      name: "Unknown Category",
      slug: "",
      description: null,
      color: null,
      icon: null,
      order: 0,
      createdAt: "",
      updatedAt: "",
    };
  }
  return {
    id: raw.id ?? "",
    name: raw.name ?? "",
    slug: raw.slug ?? "",
    description: raw.description ?? null,
    color: raw.color ?? null,
    icon: raw.icon ?? null,
    order: typeof raw.order === "number" ? raw.order : 0,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

export function toCategoryDetails(raw: any): CategoryDetails {
  if (!raw || typeof raw !== "object") {
    return {
      ...toCategory(null),
      parentId: null,
      children: [],
    };
  }
  return {
    ...toCategory(raw),
    parentId: raw.parentId ?? null,
    children: Array.isArray(raw.children) ? raw.children.map(toCategory) : [],
  };
}

/* =========================================================
   Public API Functions
   ========================================================= */

export async function getCategoriesApi(
  transport?: Transport,
): Promise<Category[]> {
  const t = transport ?? activeTransport;
  const raw = await t.get<any[]>(CATEGORY_ENDPOINTS.PUBLIC_LIST);
  return (raw ?? []).map(toCategory);
}

export async function getCategoryApi(
  slug: string,
  transport?: Transport,
): Promise<CategoryDetails> {
  const t = transport ?? activeTransport;
  const raw = await t.get(CATEGORY_ENDPOINTS.PUBLIC_DETAIL(slug));
  return toCategoryDetails(raw);
}

/* =========================================================
   Admin API Functions
   ========================================================= */

export async function getAdminCategoriesApi(
  filters: CategoryFilters = {},
  transport?: Transport,
): Promise<PaginatedCategories> {
  const t = transport ?? activeTransport;
  const qs = buildQueryString(filters);
  const endpoint = `${CATEGORY_ENDPOINTS.ADMIN_LIST}${qs}`;
  const raw = await t.get<any>(endpoint);
  return {
    data: (raw.data ?? raw.categories ?? raw).map(toCategory),
    meta: raw.meta ?? {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      lastPage: 1,
      total: 0,
    },
  };
}

export async function getAdminCategoryApi(
  id: string,
  transport?: Transport,
): Promise<CategoryDetails> {
  const t = transport ?? activeTransport;
  const raw = await t.get(CATEGORY_ENDPOINTS.ADMIN_DETAIL(id));
  return toCategoryDetails(raw);
}

export async function createCategoryApi(
  input: CreateCategoryInput,
  transport?: Transport,
): Promise<Category> {
  const t = transport ?? activeTransport;
  const raw = await t.post(CATEGORY_ENDPOINTS.CREATE, input);
  return toCategory(raw);
}

export async function updateCategoryApi(
  id: string,
  input: UpdateCategoryInput,
  transport?: Transport,
): Promise<Category> {
  const t = transport ?? activeTransport;
  const raw = await t.patch(CATEGORY_ENDPOINTS.UPDATE(id), input);
  return toCategory(raw);
}

export async function deleteCategoryApi(
  id: string,
  transport?: Transport,
): Promise<DeleteCategoryResult> {
  const t = transport ?? activeTransport;
  return t.delete<DeleteCategoryResult>(CATEGORY_ENDPOINTS.DELETE(id));
}

export async function reorderCategoriesApi(
  input: ReorderCategoriesInput,
  transport?: Transport,
): Promise<Category[]> {
  const t = transport ?? activeTransport;
  const raw = await t.post<any[]>(CATEGORY_ENDPOINTS.REORDER, input);
  return (raw ?? []).map(toCategory);
}

/* =========================================================
   Pure Helpers
   ========================================================= */

export function normalizeSlug(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildQueryString(filters: CategoryFilters): string {
  const params = new URLSearchParams();

  if (filters.page != null && filters.page >= 1) {
    params.set("page", String(filters.page));
  }
  if (filters.limit != null && filters.limit >= 1 && filters.limit <= 100) {
    params.set("limit", String(filters.limit));
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.sortBy) {
    params.set("sortBy", filters.sortBy);
  }
  if (filters.sortOrder) {
    params.set("sortOrder", filters.sortOrder);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/* =========================================================
   Invalidation Helpers
   ========================================================= */

import type { QueryClient } from "@tanstack/react-query";

export function invalidateCategoryLists(
  queryClient: QueryClient,
  filters?: CategoryFilters,
) {
  if (filters) {
    queryClient.invalidateQueries({
      queryKey: categoryKeys.list(filters),
    });
    return;
  }
  queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
}

export function invalidateAdminCategoryLists(
  queryClient: QueryClient,
  filters?: CategoryFilters,
) {
  if (filters) {
    queryClient.invalidateQueries({
      queryKey: categoryKeys.adminList(filters),
    });
    return;
  }
  queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
}

export function invalidateCategoryDetail(
  queryClient: QueryClient,
  slug: string,
) {
  queryClient.invalidateQueries({ queryKey: categoryKeys.detail(slug) });
}

export function invalidateAdminCategoryDetail(
  queryClient: QueryClient,
  id: string,
) {
  queryClient.invalidateQueries({ queryKey: categoryKeys.adminDetail(id) });
}
