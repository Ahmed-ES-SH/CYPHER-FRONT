"use client";

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useProducts } from "@/src/modules/products";
import type { Product, ProductQuery } from "@/src/modules/products";

interface ShopContextValue {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  gridView: "grid" | "list";
  showingStart: number;
  showingEnd: number;
  activeFilters: ProductQuery;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onGridViewChange: (view: "grid" | "list") => void;
  onFilterChange: (updates: Partial<ProductQuery>) => void;
  onClearFilters: () => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShopContext() {
  const ctx = useContext(ShopContext);
  if (!ctx)
    throw new Error("useShopContext must be used within a ShopProvider");
  return ctx;
}

const ROUTE_CATEGORY_MAP: Record<string, string | undefined> = {
  "/cellphones": "smartphones",
  "/Laptops": "laptops",
};

const getNum = (key: string, sp: URLSearchParams) => {
  const val = sp.get(key);
  return val ? Number(val) : undefined;
};

function parseFilters(
  sp: URLSearchParams,
  categorySlugFromPath?: string,
): ProductQuery {
  const categoryIds = sp.get("categoryIds") || undefined;

  let resolvedCategorySlug = categorySlugFromPath;
  let resolvedCategoryIds = categoryIds;

  if (resolvedCategorySlug && resolvedCategoryIds) {
    resolvedCategoryIds = undefined;
  }

  return {
    page: getNum("page", sp) || 1,
    limit: getNum("limit", sp) || 16,
    sortBy: (sp.get("sortBy") as ProductQuery["sortBy"]) || "createdAt",
    sortOrder: (sp.get("sortOrder") as ProductQuery["sortOrder"]) || "desc",
    search: sp.get("search") || undefined,
    categorySlug: resolvedCategorySlug,
    categoryIds: resolvedCategoryIds,
    brand: sp.get("brand") || undefined,
    minPrice: getNum("minPrice", sp),
    maxPrice: getNum("maxPrice", sp),
    minDiscount: getNum("minDiscount", sp),
    maxDiscount: getNum("maxDiscount", sp),
    minWeight: getNum("minWeight", sp),
    maxWeight: getNum("maxWeight", sp),
    minRating: getNum("minRating", sp),
    tags: sp.get("tags") || undefined,
    onSale: sp.get("onSale") === "true" || undefined,
    inStockOnly: sp.get("inStockOnly") === "true" || undefined,
  };
}

export default function ShopProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const limit = Number(searchParams.get("limit")) || 16;
  const page = Number(searchParams.get("page")) || 1;
  const gridView = searchParams.get("gridView") === "list" ? "list" : "grid";

  const subpath = pathname.split("/shop")[1] || "";
  const categorySlugFromPath = ROUTE_CATEGORY_MAP[subpath];

  const activeFilters = useMemo<ProductQuery>(
    () => parseFilters(searchParams, categorySlugFromPath),
    [searchParams, categorySlugFromPath],
  );

  const query: ProductQuery = useMemo(
    () => ({
      page: activeFilters.page,
      limit: activeFilters.limit,
      sortBy: activeFilters.sortBy,
      sortOrder: activeFilters.sortOrder,
      search: activeFilters.search,
      categorySlug: activeFilters.categorySlug,
      categoryIds: activeFilters.categoryIds,
      brand: activeFilters.brand,
      minPrice: activeFilters.minPrice,
      maxPrice: activeFilters.maxPrice,
      minDiscount: activeFilters.minDiscount,
      maxDiscount: activeFilters.maxDiscount,
      minWeight: activeFilters.minWeight,
      maxWeight: activeFilters.maxWeight,
      minRating: activeFilters.minRating,
      tags: activeFilters.tags,
      onSale: activeFilters.onSale,
      inStockOnly: activeFilters.inStockOnly,
    }),
    [activeFilters],
  );

  const { data, isLoading, isError } = useProducts(query);

  const products = useMemo<Product[]>(
    () => data?.data ?? [],
    [data],
  );

  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 0;
  const showingStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = Math.min(page * limit, total);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const onSortChange = useCallback(
    (newSortBy: string, newSortOrder: string) => {
      updateParams({
        sortBy: newSortBy,
        sortOrder: newSortOrder,
        page: "1",
      });
    },
    [updateParams],
  );

  const onLimitChange = useCallback(
    (newLimit: number) => {
      updateParams({ limit: String(newLimit), page: "1" });
    },
    [updateParams],
  );

  const onPageChange = useCallback(
    (newPage: number) => {
      updateParams({ page: String(newPage) });
    },
    [updateParams],
  );

  const onGridViewChange = useCallback(
    (view: "grid" | "list") => {
      updateParams({ gridView: view === "list" ? "list" : "" });
    },
    [updateParams],
  );

  const onFilterChange = useCallback(
    (updates: Partial<ProductQuery>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!("page" in updates)) {
        params.set("page", "1");
      }
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          value === false
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const onClearFilters = useCallback(() => {
    router.replace(`${pathname}?page=1&limit=16`, { scroll: false });
  }, [router, pathname]);

  const value: ShopContextValue = useMemo(
    () => ({
      products,
      isLoading,
      isError,
      page,
      totalPages,
      total,
      limit,
      sortBy,
      sortOrder,
      gridView,
      showingStart,
      showingEnd,
      activeFilters,
      onSortChange,
      onLimitChange,
      onPageChange,
      onGridViewChange,
      onFilterChange,
      onClearFilters,
    }),
    [
      products,
      isLoading,
      isError,
      page,
      totalPages,
      total,
      limit,
      sortBy,
      sortOrder,
      gridView,
      showingStart,
      showingEnd,
      activeFilters,
      onSortChange,
      onLimitChange,
      onPageChange,
      onGridViewChange,
      onFilterChange,
      onClearFilters,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
