"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient, UseQueryOptions } from "@tanstack/react-query";
import type {
  Category,
  CategoryDetails,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput,
  CategoryFilters,
  PaginatedCategories,
  DeleteCategoryResult,
} from "./categories.types";
import {
  getCategoriesApi,
  getCategoryApi,
  getAdminCategoriesApi,
  getAdminCategoryApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  reorderCategoriesApi,
  categoryKeys,
} from "./categories.api";

/* =========================================================
   Cache Defaults
   ========================================================= */

const CATEGORY_STALE_TIME = 5 * 60 * 1000;
const CATEGORY_GC_TIME = 30 * 60 * 1000;
const CATEGORY_RETRY = 1;

/* =========================================================
   Public Hooks
   ========================================================= */

export function useCategories(options?: Partial<UseQueryOptions<Category[], Error>>) {
  return useQuery<Category[], Error>({
    queryKey: categoryKeys.list(),
    queryFn: () => getCategoriesApi(),
    staleTime: CATEGORY_STALE_TIME,
    gcTime: CATEGORY_GC_TIME,
    retry: CATEGORY_RETRY,
    ...options,
  });
}

export function useCategory(
  slug: string | undefined,
  options?: Partial<UseQueryOptions<CategoryDetails, Error>>,
) {
  return useQuery<CategoryDetails, Error>({
    queryKey: categoryKeys.detail(slug ?? ""),
    queryFn: () => getCategoryApi(slug!),
    enabled: !!slug,
    staleTime: CATEGORY_STALE_TIME,
    gcTime: CATEGORY_GC_TIME,
    retry: CATEGORY_RETRY,
    ...options,
  });
}

/* =========================================================
   Admin Hooks
   ========================================================= */

export function useAdminCategories(
  filters: CategoryFilters = {},
  options?: Partial<UseQueryOptions<PaginatedCategories, Error>>,
) {
  return useQuery<PaginatedCategories, Error>({
    queryKey: categoryKeys.adminList(filters),
    queryFn: () => getAdminCategoriesApi(filters),
    staleTime: CATEGORY_STALE_TIME,
    gcTime: CATEGORY_GC_TIME,
    retry: CATEGORY_RETRY,
    ...options,
  });
}

export function useAdminCategory(
  id: string | undefined,
  options?: Partial<UseQueryOptions<CategoryDetails, Error>>,
) {
  return useQuery<CategoryDetails, Error>({
    queryKey: categoryKeys.adminDetail(id ?? ""),
    queryFn: () => getAdminCategoryApi(id!),
    enabled: !!id,
    staleTime: CATEGORY_STALE_TIME,
    gcTime: CATEGORY_GC_TIME,
    retry: CATEGORY_RETRY,
    ...options,
  });
}

/* =========================================================
   Mutation Hooks
   ========================================================= */

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryInput>({
    mutationFn: (input) => createCategoryApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, { id: string; input: UpdateCategoryInput }>({
    mutationFn: ({ id, input }) => updateCategoryApi(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminDetail(id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.details() });
      if (_data?.slug) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.detail(_data.slug) });
      }
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteCategoryResult, Error, string>({
    mutationFn: (id) => deleteCategoryApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminDetails() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.details() });
    },
  });
}

export function useReorderCategoriesMutation() {
  const queryClient = useQueryClient();

  return useMutation<Category[], Error, ReorderCategoriesInput>({
    mutationFn: (input) => reorderCategoriesApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.adminDetails() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.details() });
    },
  });
}

/* =========================================================
   Prefetch Helpers (for Next.js App Router)
   ========================================================= */

export async function prefetchCategories(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => getCategoriesApi(),
    staleTime: CATEGORY_STALE_TIME,
  });
}

export async function prefetchCategory(
  queryClient: QueryClient,
  slug: string,
) {
  return queryClient.prefetchQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => getCategoryApi(slug),
    staleTime: CATEGORY_STALE_TIME,
  });
}

export async function prefetchAdminCategories(
  queryClient: QueryClient,
  filters?: CategoryFilters,
) {
  return queryClient.prefetchQuery({
    queryKey: categoryKeys.adminList(filters),
    queryFn: () => getAdminCategoriesApi(filters),
    staleTime: CATEGORY_STALE_TIME,
  });
}

export async function prefetchAdminCategory(
  queryClient: QueryClient,
  id: string,
) {
  return queryClient.prefetchQuery({
    queryKey: categoryKeys.adminDetail(id),
    queryFn: () => getAdminCategoryApi(id),
    staleTime: CATEGORY_STALE_TIME,
  });
}
