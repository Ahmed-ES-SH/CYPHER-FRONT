import type { QueryClient } from "@tanstack/react-query";
import { getProductApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import { PRODUCTS_DEFAULTS } from "../constants/products.defaults";

export async function prefetchProduct(
  queryClient: QueryClient,
  id: string,
) {
  return queryClient.prefetchQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductApi(id),
    staleTime: PRODUCTS_DEFAULTS.STALE_TIME,
  });
}
