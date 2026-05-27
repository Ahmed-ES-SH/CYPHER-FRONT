"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminProductsApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";
import type { Product } from "../types/product.types";
import type {
  AdminProductQuery,
  PaginatedResult,
} from "../types/product-dto.types";

export function useAdminProducts(filters: AdminProductQuery = {}) {
  return useQuery<PaginatedResult<Product>>({
    queryKey: productKeys.adminList(filters),
    queryFn: () => getAdminProductsApi(filters),
    staleTime: PRODUCTS_DEFAULTS.STALE_TIME,
    gcTime: PRODUCTS_DEFAULTS.GC_TIME,
    retry: PRODUCTS_DEFAULTS.RETRY,
  });
}
