"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductsApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";
import type { Product } from "../types/product.types";
import type { ProductQuery, PaginatedResult } from "../types/product-dto.types";

export function useProducts(query?: ProductQuery) {
  return useQuery<PaginatedResult<Product>>({
    queryKey: productKeys.list(query),
    queryFn: () => getProductsApi(query),
    staleTime: PRODUCTS_DEFAULTS.STALE_TIME,
    gcTime: PRODUCTS_DEFAULTS.GC_TIME,
    retry: PRODUCTS_DEFAULTS.RETRY,
  });
}
