"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminProductApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";
import { getProductsConfig } from "../config/products.config";
import type { Product } from "../types/product.types";

export function useAdminProduct(id: string | undefined) {
  const config = getProductsConfig();
  const safeId = id?.trim() || "";

  return useQuery<Product>({
    queryKey: productKeys.adminDetail(safeId),
    queryFn: () => {
      if (!safeId) throw new Error("Product ID is required");
      return getAdminProductApi(safeId);
    },
    enabled: safeId.length > 0,
    staleTime: config.staleTime ?? PRODUCTS_DEFAULTS.STALE_TIME,
    gcTime: config.gcTime ?? PRODUCTS_DEFAULTS.GC_TIME,
    retry: config.retryCount ?? PRODUCTS_DEFAULTS.RETRY,
  });
}
