"use client";
import { useAppQuery } from "@/app/hooks/useAppQuery";
import type { FilterOptions } from "../types/filter-options.types";
import { PRODUCTS_ENDPOINTS } from "../api/products.endpoints";

interface FilterOptionsResponse {
  data: FilterOptions;
}

export function useFilterOptions() {
  return useAppQuery<FilterOptionsResponse>({
    queryKey: ["products", "filterOptions"],
    endpoint: PRODUCTS_ENDPOINTS.FILTER_OPTIONS,
    options: {
      staleTime: 5 * 60 * 1000,
    },
  });
}
