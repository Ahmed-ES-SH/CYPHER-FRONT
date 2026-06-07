"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useCategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || "";
  const sortBy = (searchParams.get("sortBy") as string) || "";
  const sortOrder = (searchParams.get("sortOrder") as string) || "";

  const updateFilter = useCallback(
    (key: string, value: string | number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value != null && String(value) !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
      // Reset page when filters change (except when explicitly changing page)
      if (key !== "page") params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return { page, limit, search, sortBy, sortOrder, updateFilter };
}
