import type { ProductQuery, AdminProductQuery } from "../types/product-dto.types";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";

export function normalizeProductQuery(
  query: Partial<ProductQuery>,
): ProductQuery {
  return {
    page: Math.max(1, query.page != null ? Number(query.page) : PRODUCTS_DEFAULTS.PAGE),
    limit: Math.max(
      1,
      Math.min(
        PRODUCTS_DEFAULTS.MAX_LIMIT,
        query.limit != null ? Number(query.limit) : PRODUCTS_DEFAULTS.LIMIT,
      ),
    ),
    search: query.search?.trim() || undefined,
    categorySlug: query.categorySlug?.trim() || undefined,
    minPrice:
      query.minPrice !== undefined
        ? Math.max(0, Number(query.minPrice))
        : undefined,
    maxPrice:
      query.maxPrice !== undefined
        ? Math.max(0, Number(query.maxPrice))
        : undefined,
    sortBy: query.sortBy || undefined,
    sortOrder: query.sortOrder || undefined,
    inStock: query.inStock ?? undefined,
  };
}

export function normalizeAdminProductQuery(
  query: Partial<AdminProductQuery>,
): AdminProductQuery {
  return {
    ...normalizeProductQuery(query),
    isPublished: query.isPublished ?? undefined,
    isDeleted: query.isDeleted ?? undefined,
  };
}

export function serializeProductQuery(
  query: ProductQuery | AdminProductQuery,
): Record<string, string> {
  const params: Record<string, string> = {};

  if (query.page && query.page > 1) params.page = String(query.page);
  if (query.limit && query.limit !== PRODUCTS_DEFAULTS.LIMIT)
    params.limit = String(query.limit);
  if (query.search) params.search = query.search;
  if (query.categorySlug) params.categorySlug = query.categorySlug;
  if (query.minPrice !== undefined)
    params.minPrice = String(query.minPrice);
  if (query.maxPrice !== undefined)
    params.maxPrice = String(query.maxPrice);
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.sortOrder) params.sortOrder = query.sortOrder;
  if (query.inStock !== undefined)
    params.inStock = String(query.inStock);

  if ("isPublished" in query && query.isPublished !== undefined) {
    params.isPublished = String(query.isPublished);
  }
  if ("isDeleted" in query && query.isDeleted !== undefined) {
    params.isDeleted = String(query.isDeleted);
  }

  return params;
}
