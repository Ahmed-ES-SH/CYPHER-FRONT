"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";
import type { Product } from "../types/product.types";

export function useProduct(slug: string | undefined) {
  return useQuery<Product>({
    queryKey: productKeys.detail(slug ?? ""),
    queryFn: () => getProductApi(slug!),
    enabled: !!slug,
    staleTime: PRODUCTS_DEFAULTS.STALE_TIME,
    gcTime: PRODUCTS_DEFAULTS.GC_TIME,
    retry: PRODUCTS_DEFAULTS.RETRY,
  });
}
