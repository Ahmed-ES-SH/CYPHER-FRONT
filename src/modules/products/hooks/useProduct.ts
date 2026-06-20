"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";
import { getProductsConfig } from "../config/products.config";
import type { Product } from "../types/product.types";

export function useProduct(id: string | undefined) {
  const config = getProductsConfig();
  const safeId = id?.trim() || "";

  return useQuery<Product>({
    queryKey: productKeys.detail(safeId),
    queryFn: () => {
      if (!safeId) {
        throw new Error("Product id is required.");
      }
      return getProductApi(safeId);
    },
    enabled: safeId.length > 0,
    staleTime: config.staleTime ?? PRODUCTS_DEFAULTS.STALE_TIME,
    gcTime: config.gcTime ?? PRODUCTS_DEFAULTS.GC_TIME,
    retry: config.retryCount ?? PRODUCTS_DEFAULTS.RETRY,
  });
}
