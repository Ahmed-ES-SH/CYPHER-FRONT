import { globalRequest } from "@/app/helpers/globalRequest";
import { PRODUCTS_ENDPOINTS } from "./products.endpoints";
import { getProductsConfig } from "../config/products.config";
import {
  normalizeProductPayload,
  coercePagination,
  RawProductPayload,
} from "../transformers/product.mapper";
import { serializeProductQuery } from "../transformers/product-query.mapper";
import type { Product } from "../types/product.types";
import type {
  CreateProductDto,
  UpdateProductDto,
  ProductQuery,
  AdminProductQuery,
  PaginatedResult,
  MutationResult,
  PublishToggleResult,
} from "../types/product-dto.types";
import type {
  ApiError,
  ValidationErrorItem,
} from "../types/product-error.types";

export interface RawProductsListResponse {
  data?: RawProductPayload[];
  products?: RawProductPayload[];
  pagination?: Record<string, unknown>;
}

function parseValidationErrors(
  errors?: Record<string, string[]>,
): ValidationErrorItem[] | undefined {
  if (!errors) return undefined;
  return Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message })),
  );
}

async function productsRequest<TResult = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const { baseURL } = getProductsConfig();
  const res = await globalRequest({
    endpoint,
    method,
    body,
    ...(baseURL ? { baseURL } : {}),
  });
  if (!res.success) {
    throw {
      message: res.message,
      status: res.statusCode ?? 500,
      errors: parseValidationErrors(res.errors),
    } satisfies ApiError;
  }
  return res.data as TResult;
}

function buildQueryString(params: Record<string, string>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}

/* =========================================================
   Public API
   ========================================================= */

export async function getProductsApi(
  query?: ProductQuery,
): Promise<PaginatedResult<Product>> {
  const qs = query ? buildQueryString(serializeProductQuery(query)) : "";
  const raw = await productsRequest<RawProductsListResponse>(
    `${PRODUCTS_ENDPOINTS.PUBLIC_LIST}${qs}`,
  );
  const items = raw.data ?? raw.products ?? [];
  return {
    data: items.map((item) => normalizeProductPayload(item)),
    pagination: coercePagination(
      raw.pagination ?? (raw as unknown as Record<string, unknown>),
    ),
  };
}

export async function getProductApi(slug: string): Promise<Product> {
  const raw = await productsRequest<RawProductPayload>(
    PRODUCTS_ENDPOINTS.PUBLIC_BY_SLUG(slug),
  );
  return normalizeProductPayload(raw);
}

export async function getProductsByCategoryApi(
  categorySlug: string,
  query?: ProductQuery,
): Promise<PaginatedResult<Product>> {
  const qs = query ? buildQueryString(serializeProductQuery(query)) : "";
  const raw = await productsRequest<RawProductsListResponse>(
    `${PRODUCTS_ENDPOINTS.PUBLIC_BY_CATEGORY(categorySlug)}${qs}`,
  );
  const items = raw.data ?? raw.products ?? [];
  return {
    data: items.map((item) => normalizeProductPayload(item)),
    pagination: coercePagination(
      raw.pagination ?? (raw as unknown as Record<string, unknown>),
    ),
  };
}

export async function getAdminProductsApi(
  query?: AdminProductQuery,
): Promise<PaginatedResult<Product>> {
  const qs = query ? buildQueryString(serializeProductQuery(query)) : "";
  const raw = await productsRequest<RawProductsListResponse>(
    `${PRODUCTS_ENDPOINTS.ADMIN_LIST}${qs}`,
  );
  const items = raw.data ?? raw.products ?? [];
  return {
    data: items.map((item) => normalizeProductPayload(item)),
    pagination: coercePagination(
      raw.pagination ?? (raw as unknown as Record<string, unknown>),
    ),
  };
}

export async function getAdminProductApi(id: string): Promise<Product> {
  const raw = await productsRequest<RawProductPayload>(
    PRODUCTS_ENDPOINTS.ADMIN_GET(id),
  );
  return normalizeProductPayload(raw);
}

export async function createProductApi(
  dto: CreateProductDto,
): Promise<Product> {
  const raw = await productsRequest<RawProductPayload>(
    PRODUCTS_ENDPOINTS.CREATE,
    "POST",
    dto,
  );
  return normalizeProductPayload(raw);
}

export async function updateProductApi(
  id: string,
  dto: UpdateProductDto,
): Promise<Product> {
  const raw = await productsRequest<RawProductPayload>(
    PRODUCTS_ENDPOINTS.UPDATE(id),
    "PATCH",
    dto,
  );
  return normalizeProductPayload(raw);
}

export async function toggleProductPublishApi(
  id: string,
): Promise<PublishToggleResult> {
  return productsRequest<PublishToggleResult>(
    PRODUCTS_ENDPOINTS.TOGGLE_PUBLISH(id),
    "PATCH",
  );
}

export async function deleteProductApi(id: string): Promise<MutationResult> {
  return productsRequest<MutationResult>(
    PRODUCTS_ENDPOINTS.DELETE(id),
    "DELETE",
  );
}
