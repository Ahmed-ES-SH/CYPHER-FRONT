import type { QueryClient } from "@tanstack/react-query";
import { getProductsApi, getProductsByCategoryApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";
import type { ProductQuery } from "../types/product-dto.types";

export async function prefetchProducts(
  queryClient: QueryClient,
  query?: ProductQuery,
) {
  return queryClient.prefetchQuery({
    queryKey: productKeys.list(query),
    queryFn: () => getProductsApi(query),
    staleTime: PRODUCTS_DEFAULTS.STALE_TIME,
  });
}

export async function prefetchProductsByCategory(
  queryClient: QueryClient,
  categorySlug: string,
  query?: ProductQuery,
) {
  return queryClient.prefetchQuery({
    queryKey: [...productKeys.lists(), "category", categorySlug, query ?? {}] as const,
    queryFn: () => getProductsByCategoryApi(categorySlug, query),
    staleTime: PRODUCTS_DEFAULTS.STALE_TIME,
  });
}
