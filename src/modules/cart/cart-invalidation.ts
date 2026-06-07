import type { QueryClient } from "@tanstack/react-query";
import { cartKeys } from "./cart.keys";

export function invalidateCart(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: cartKeys.all });
}

export function invalidateCartDetail(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
}

export function invalidateCartCount(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: cartKeys.itemCount() });
}
