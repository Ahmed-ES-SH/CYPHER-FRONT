import type { QueryClient } from "@tanstack/react-query";
import { getProductApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";

export async function prefetchProduct(
  queryClient: QueryClient,
  slug: string,
) {
  return queryClient.prefetchQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProductApi(slug),
    staleTime: PRODUCTS_DEFAULTS.STALE_TIME,
  });
}
