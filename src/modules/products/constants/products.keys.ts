import type { ProductQuery, AdminProductQuery } from "../types/product-dto.types";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (query?: ProductQuery) =>
    [...productKeys.lists(), query ?? {}] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  admin: () => [...productKeys.all, "admin"] as const,
  adminLists: () => [...productKeys.admin(), "list"] as const,
  adminList: (query?: AdminProductQuery) =>
    [...productKeys.adminLists(), query ?? {}] as const,
  adminDetails: () => [...productKeys.admin(), "detail"] as const,
  adminDetail: (id: string) => [...productKeys.adminDetails(), id] as const,
  mutations: () => [...productKeys.all, "mutations"] as const,
};
