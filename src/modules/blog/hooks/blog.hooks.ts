"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type {
  BlogArticle,
  BlogArticleSummary,
  CreateArticleInput,
  UpdateArticleInput,
  PublishArticleInput,
  ArticleFilters,
  PaginatedArticles,
  DeleteArticleResult,
} from "../types/blog.types";
import {
  getBlogPostsApi,
  getBlogPostApi,
  getAdminBlogPostsApi,
  getAdminBlogPostApi,
  createBlogPostApi,
  updateBlogPostApi,
  publishBlogPostApi,
  deleteBlogPostApi,
  blogKeys,
  invalidateBlogLists,
  invalidateAdminBlogLists,
  invalidateBlogDetail,
  invalidateAdminBlogDetail,
  removeAdminBlogDetail,
  normalizeArticleFilters,
} from "../api/blog.api";
import { getBlogConfig } from "../config/blog.config";

/* =========================================================
   Cache Defaults (from config)
   ========================================================= */

function getStaleTime() {
  return getBlogConfig().staleTime;
}

function getAdminStaleTime() {
  return getBlogConfig().adminStaleTime;
}

function getGcTime() {
  return getBlogConfig().gcTime;
}

function getRetry() {
  return getBlogConfig().retry;
}

/* =========================================================
   Public Hooks
   ========================================================= */

export function useBlogPosts(filters?: ArticleFilters) {
  const normalizedFilters = normalizeArticleFilters(filters ?? {});
  return useQuery<PaginatedArticles>({
    queryKey: blogKeys.list(normalizedFilters),
    queryFn: () => getBlogPostsApi(normalizedFilters),
    staleTime: getStaleTime(),
    gcTime: getGcTime(),
    retry: getRetry(),
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery<BlogArticle>({
    queryKey: blogKeys.detail(slug ?? ""),
    queryFn: () => getBlogPostApi(slug!),
    enabled: !!slug,
    staleTime: getStaleTime(),
    gcTime: getGcTime(),
    retry: getRetry(),
  });
}

/* =========================================================
   Admin Hooks
   ========================================================= */

export function useAdminBlogPosts(filters: ArticleFilters = {}) {
  const normalizedFilters = normalizeArticleFilters(filters);
  return useQuery<PaginatedArticles>({
    queryKey: blogKeys.adminList(normalizedFilters),
    queryFn: () => getAdminBlogPostsApi(normalizedFilters),
    staleTime: getAdminStaleTime(),
    gcTime: getGcTime(),
    retry: getRetry(),
  });
}

export function useAdminBlogPost(id: string | undefined) {
  return useQuery<BlogArticle>({
    queryKey: blogKeys.adminDetail(id ?? ""),
    queryFn: () => getAdminBlogPostApi(id!),
    enabled: !!id,
    staleTime: getAdminStaleTime(),
    gcTime: getGcTime(),
    retry: getRetry(),
  });
}

/* =========================================================
   Mutation Hooks
   ========================================================= */

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation<BlogArticle, Error, CreateArticleInput>({
    mutationFn: (input) => createBlogPostApi(input),
    onSuccess: () => {
      invalidateBlogLists(queryClient);
      invalidateAdminBlogLists(queryClient);
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation<
    BlogArticle,
    Error,
    { id: string; input: UpdateArticleInput }
  >({
    mutationFn: ({ id, input }) => updateBlogPostApi(id, input),
    onSuccess: (data) => {
      invalidateBlogLists(queryClient);
      invalidateAdminBlogLists(queryClient);
      invalidateAdminBlogDetail(queryClient, data.id);
      if (data.slug) {
        invalidateBlogDetail(queryClient, data.slug);
      }
    },
  });
}

export function usePublishBlogPost() {
  const queryClient = useQueryClient();

  return useMutation<
    BlogArticle,
    Error,
    { id: string; input: PublishArticleInput }
  >({
    mutationFn: ({ id, input }) => publishBlogPostApi(id, input),
    onSuccess: (data) => {
      invalidateBlogLists(queryClient);
      invalidateAdminBlogLists(queryClient);
      invalidateAdminBlogDetail(queryClient, data.id);
      if (data.slug) {
        invalidateBlogDetail(queryClient, data.slug);
      }
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation<DeleteArticleResult, Error, string>({
    mutationFn: (id) => deleteBlogPostApi(id),
    onSuccess: (_data, id) => {
      removeAdminBlogDetail(queryClient, id);
      queryClient.removeQueries({ queryKey: blogKeys.details() });
      invalidateBlogLists(queryClient);
      invalidateAdminBlogLists(queryClient);
    },
  });
}

/* =========================================================
   Prefetch Helpers (for Next.js App Router)
   ========================================================= */

export async function prefetchBlogPosts(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: blogKeys.list(),
    queryFn: () => getBlogPostsApi(),
    staleTime: getStaleTime(),
  });
}

export async function prefetchBlogPost(
  queryClient: QueryClient,
  slug: string,
) {
  return queryClient.prefetchQuery({
    queryKey: blogKeys.detail(slug),
    queryFn: () => getBlogPostApi(slug),
    staleTime: getStaleTime(),
  });
}

export async function prefetchAdminBlogPosts(
  queryClient: QueryClient,
  filters?: ArticleFilters,
) {
  return queryClient.prefetchQuery({
    queryKey: blogKeys.adminList(filters),
    queryFn: () => getAdminBlogPostsApi(filters),
    staleTime: getAdminStaleTime(),
  });
}

export async function prefetchAdminBlogPost(
  queryClient: QueryClient,
  id: string,
) {
  return queryClient.prefetchQuery({
    queryKey: blogKeys.adminDetail(id),
    queryFn: () => getAdminBlogPostApi(id),
    staleTime: getAdminStaleTime(),
  });
}
