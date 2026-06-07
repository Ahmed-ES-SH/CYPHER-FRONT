"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";
import { getProductsConfig } from "../config/products.config";
import type { Product } from "../types/product.types";

export function useProduct(slug: string | undefined) {
  const config = getProductsConfig();
  const safeSlug = slug?.trim() || "";

  return useQuery<Product>({
    queryKey: productKeys.detail(safeSlug),
    queryFn: () => {
      if (!safeSlug) {
        throw new Error("Product slug is required.");
      }
      return getProductApi(safeSlug);
    },
    enabled: safeSlug.length > 0,
    staleTime: config.staleTime ?? PRODUCTS_DEFAULTS.STALE_TIME,
    gcTime: config.gcTime ?? PRODUCTS_DEFAULTS.GC_TIME,
    retry: config.retryCount ?? PRODUCTS_DEFAULTS.RETRY,
  });
}
