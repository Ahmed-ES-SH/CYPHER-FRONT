/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalRequest } from "@/app/helpers/globalRequest";
import { getBlogConfig } from "../config/blog.config";
import {
  BlogApiError,
  type BlogArticle,
  type BlogArticleSummary,
  type BlogCategory,
  type BlogTag,
  type BlogAuthor,
  type CreateArticleInput,
  type UpdateArticleInput,
  type PublishArticleInput,
  type ArticleFilters,
  type PaginatedArticles,
  type DeleteArticleResult,
  type ApiError,
} from "../types/blog.types";

/* =========================================================
   Transport Interface + Adapter
   ========================================================= */

export interface Transport {
  get<T = any>(endpoint: string): Promise<T>;
  post<T = any>(endpoint: string, body?: unknown): Promise<T>;
  patch<T = any>(endpoint: string, body?: unknown): Promise<T>;
  delete<T = any>(endpoint: string): Promise<T>;
}

async function transportRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  // If we are executing in the browser, call the API directly to bypass Server Actions overhead (PERF-01)
  if (typeof window !== "undefined") {
    const config = getBlogConfig();
    const url = `${config.baseURL}${endpoint}`;
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new BlogApiError(data?.message ?? "An error occurred", response.status, data?.errors);
      }
      return data as TResult;
    } catch (err) {
      if (err instanceof BlogApiError) throw err;
      throw new BlogApiError(
        err instanceof Error ? err.message : "Network error",
        500
      );
    }
  }

  // Server-side fallback using Server Actions
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    throw new BlogApiError(res.message, res.statusCode ?? 500);
  }
  return res.data as TResult;
}

export const defaultTransport: Transport = {
  get: <T>(endpoint: string) => transportRequest<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    transportRequest<T>(endpoint, "POST", body),
  patch: <T>(endpoint: string, body?: unknown) =>
    transportRequest<T>(endpoint, "PATCH", body),
  delete: <T>(endpoint: string) => transportRequest<T>(endpoint, "DELETE"),
};

let activeTransport: Transport = defaultTransport;

export function setTransport(transport: Transport) {
  activeTransport = transport;
}

export function getActiveTransport(): Transport {
  return activeTransport;
}

/* =========================================================
   Error Parsing
   ========================================================= */

export function parseApiError(error: unknown): ApiError {
  if (error && typeof error === "object" && "message" in error) {
    return {
      message: (error as any).message ?? "An unexpected error occurred",
      status: (error as any).status ?? 500,
      errors: (error as any).errors,
    };
  }
  return { message: "An unexpected error occurred", status: 500 };
}

export function parseValidationErrors(
  errors?: Record<string, string[]>,
): Record<string, string> {
  if (!errors) return {};
  const map: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    map[field] = messages[0] ?? "Invalid value";
  }
  return map;
}

/* =========================================================
   Endpoint Constants
   ========================================================= */

export const BLOG_ENDPOINTS = {
  PUBLIC_LIST: "/api/blog",
  PUBLIC_DETAIL: (slug: string) => `/api/blog/${slug}`,
  ADMIN_LIST: "/api/admin/blog",
  ADMIN_DETAIL: (id: string) => `/api/admin/blog/${id}`,
  CREATE: "/api/admin/blog",
  UPDATE: (id: string) => `/api/admin/blog/${id}`,
  PUBLISH: (id: string) => `/api/admin/blog/${id}/publish`,
  DELETE: (id: string) => `/api/admin/blog/${id}`,
} as const;

/* =========================================================
   Query Key Factory
   ========================================================= */

export const blogKeys = {
  all: ["blog"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (filters?: ArticleFilters) =>
    [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
  admin: () => [...blogKeys.all, "admin"] as const,
  adminLists: () => [...blogKeys.admin(), "list"] as const,
  adminList: (filters?: ArticleFilters) =>
    [...blogKeys.adminLists(), filters] as const,
  adminDetails: () => [...blogKeys.admin(), "detail"] as const,
  adminDetail: (id: string) => [...blogKeys.adminDetails(), id] as const,
  mutations: () => [...blogKeys.all, "mutations"] as const,
};

/* =========================================================
   Response Mappers
   ========================================================= */

export function toBlogAuthor(raw: any): BlogAuthor {
  if (typeof raw === "string") {
    return {
      id: raw,
      name: "Unknown",
      email: "",
      avatar: null,
      bio: null,
    };
  }
  return {
    id: raw?.id ?? "",
    name: raw?.name ?? "Unknown",
    email: raw?.email ?? "",
    avatar: raw?.avatar ?? null,
    bio: raw?.bio ?? null,
  };
}

export function toBlogCategory(raw: any): BlogCategory {
  if (typeof raw === "string") {
    return {
      id: raw,
      name: "Uncategorized",
      slug: "uncategorized",
      description: null,
      createdAt: "",
      updatedAt: "",
    };
  }
  return {
    id: raw?.id ?? "",
    name: raw?.name ?? "Uncategorized",
    slug: raw?.slug ?? "uncategorized",
    description: raw?.description ?? null,
    createdAt: raw?.createdAt ?? "",
    updatedAt: raw?.updatedAt ?? "",
  };
}

export function toBlogTag(raw: any): BlogTag {
  if (typeof raw === "string") {
    return {
      id: raw,
      name: "Untagged",
      slug: "untagged",
    };
  }
  return {
    id: raw?.id ?? "",
    name: raw?.name ?? "Untagged",
    slug: raw?.slug ?? "untagged",
  };
}

export function toBlogArticleSummary(raw: any): BlogArticleSummary {
  const authorData = raw?.author ?? raw?.authorId ?? {};
  return {
    id: raw?.id ?? "",
    title: raw?.title ?? "Untitled",
    slug: raw?.slug ?? "",
    excerpt: raw?.excerpt ?? "",
    featuredImage: raw?.featuredImage ?? null,
    category: toBlogCategory(raw?.category ?? raw?.categoryId ?? {}),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(toBlogTag) : [],
    author: {
      id: typeof authorData === "string" ? authorData : (authorData?.id ?? ""),
      name: typeof authorData === "string" ? "Unknown" : (authorData?.name ?? "Unknown"),
      avatar: typeof authorData === "string" ? null : (authorData?.avatar ?? null),
    },
    status: raw?.status ?? "draft",
    publishedAt: raw?.publishedAt ?? null,
    createdAt: raw?.createdAt ?? "",
  };
}

export function toBlogArticle(raw: any): BlogArticle {
  return {
    id: raw?.id ?? "",
    title: raw?.title ?? "Untitled",
    slug: raw?.slug ?? "",
    excerpt: raw?.excerpt ?? "",
    content: raw?.content ?? "",
    featuredImage: raw?.featuredImage ?? null,
    category: toBlogCategory(raw?.category ?? raw?.categoryId ?? {}),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(toBlogTag) : [],
    author: toBlogAuthor(raw?.author ?? raw?.authorId ?? {}),
    status: raw?.status ?? "draft",
    publishedAt: raw?.publishedAt ?? null,
    createdAt: raw?.createdAt ?? "",
    updatedAt: raw?.updatedAt ?? "",
  };
}

/* =========================================================
   Public API Functions
   ========================================================= */

export async function getBlogPostsApi(
  filters?: ArticleFilters,
  transport?: Transport,
): Promise<PaginatedArticles> {
  const t = transport ?? activeTransport;
  const qs = buildQueryString(filters);
  const endpoint = `${BLOG_ENDPOINTS.PUBLIC_LIST}${qs}`;
  const raw = await t.get<any>(endpoint) ?? {};
  console.log("[getBlogPostsApi] Raw request response:", raw);
  const itemsArray = raw.data ?? raw.articles ?? raw.posts ?? raw ?? [];
  const safeArray = Array.isArray(itemsArray) ? itemsArray : [];
  const totalCount = safeArray.length;
  const fallbackLimit = filters?.limit ?? 20;

  return {
    data: safeArray.map(toBlogArticleSummary),
    meta: raw.meta ?? {
      page: filters?.page ?? 1,
      limit: fallbackLimit,
      lastPage: Math.max(1, Math.ceil(totalCount / fallbackLimit)),
      total: totalCount,
    },
  };
}

export async function getBlogPostApi(
  slug: string,
  transport?: Transport,
): Promise<BlogArticle> {
  const t = transport ?? activeTransport;
  const raw = await t.get(BLOG_ENDPOINTS.PUBLIC_DETAIL(slug));
  return toBlogArticle(raw);
}

/* =========================================================
   Admin API Functions
   ========================================================= */

export async function getAdminBlogPostsApi(
  filters: ArticleFilters = {},
  transport?: Transport,
): Promise<PaginatedArticles> {
  const t = transport ?? activeTransport;
  const qs = buildQueryString(filters);
  const endpoint = `${BLOG_ENDPOINTS.ADMIN_LIST}${qs}`;
  const raw = await t.get<any>(endpoint) ?? {};
  const itemsArray = raw.data ?? raw.articles ?? raw.posts ?? raw ?? [];
  const safeArray = Array.isArray(itemsArray) ? itemsArray : [];
  const totalCount = safeArray.length;
  const fallbackLimit = filters.limit ?? 20;

  return {
    data: safeArray.map(toBlogArticleSummary),
    meta: raw.meta ?? {
      page: filters.page ?? 1,
      limit: fallbackLimit,
      lastPage: Math.max(1, Math.ceil(totalCount / fallbackLimit)),
      total: totalCount,
    },
  };
}

export async function getAdminBlogPostApi(
  id: string,
  transport?: Transport,
): Promise<BlogArticle> {
  const t = transport ?? activeTransport;
  const raw = await t.get(BLOG_ENDPOINTS.ADMIN_DETAIL(id));
  return toBlogArticle(raw);
}

export async function createBlogPostApi(
  input: CreateArticleInput,
  transport?: Transport,
): Promise<BlogArticle> {
  const t = transport ?? activeTransport;
  const raw = await t.post(BLOG_ENDPOINTS.CREATE, input);
  return toBlogArticle(raw);
}

export async function updateBlogPostApi(
  id: string,
  input: UpdateArticleInput,
  transport?: Transport,
): Promise<BlogArticle> {
  const t = transport ?? activeTransport;
  const raw = await t.patch(BLOG_ENDPOINTS.UPDATE(id), input);
  return toBlogArticle(raw);
}

export async function publishBlogPostApi(
  id: string,
  input: PublishArticleInput,
  transport?: Transport,
): Promise<BlogArticle> {
  const t = transport ?? activeTransport;
  const raw = await t.patch(BLOG_ENDPOINTS.PUBLISH(id), input);
  return toBlogArticle(raw);
}

export async function deleteBlogPostApi(
  id: string,
  transport?: Transport,
): Promise<DeleteArticleResult> {
  const t = transport ?? activeTransport;
  return t.delete<DeleteArticleResult>(BLOG_ENDPOINTS.DELETE(id));
}

/* =========================================================
   Pure Helpers
   ========================================================= */

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildQueryString(filters?: ArticleFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();

  if (filters.page != null && filters.page >= 1) {
    params.set("page", String(filters.page));
  }
  if (filters.limit != null && filters.limit >= 1 && filters.limit <= 100) {
    params.set("limit", String(filters.limit));
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.sortBy) {
    params.set("sortBy", filters.sortBy);
  }  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.tag) {
    params.set("tag", filters.tag);
  }
  if (filters.published != null) {
    params.set("published", String(filters.published));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function estimateReadTime(
  content: string,
  wordsPerMinute = 200,
): number {
  const trimmed = content.trim();
  if (!trimmed) return 0;
  const wordCount = trimmed.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function generateExcerpt(
  content: string,
  maxLength = 160,
): string {
  const stripped = content.replace(/<[^>]*>/g, "").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trimEnd() + "...";
}

export function parseArticleFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ArticleFilters {
  const filters: ArticleFilters = {};

  const page = searchParams.page;
  if (typeof page === "string") {
    const n = parseInt(page, 10);
    if (!isNaN(n) && n >= 1) filters.page = n;
  }

  const limit = searchParams.limit;
  if (typeof limit === "string") {
    const n = parseInt(limit, 10);
    if (!isNaN(n) && n >= 1 && n <= 100) filters.limit = n;
  }

  const search = searchParams.search;
  if (typeof search === "string" && search.trim()) {
    filters.search = search.trim();
  }

  const sortBy = searchParams.sortBy;
  if (typeof sortBy === "string") {
    filters.sortBy = sortBy as ArticleFilters["sortBy"];
  }

  const sortOrder = searchParams.sortOrder;
  if (typeof sortOrder === "string") {
    filters.sortOrder = sortOrder as ArticleFilters["sortOrder"];
  }

  const category = searchParams.category;
  if (typeof category === "string" && category.trim()) {
    filters.category = category.trim();
  }

  const tag = searchParams.tag;
  if (typeof tag === "string" && tag.trim()) {
    filters.tag = tag.trim();
  }

  const published = searchParams.published;
  if (published === "true") filters.published = true;
  else if (published === "false") filters.published = false;

  return filters;
}

export function serializeArticleFilters(
  filters: ArticleFilters,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.page != null && filters.page >= 1) params.page = String(filters.page);
  if (filters.limit != null) params.limit = String(filters.limit);
  if (filters.search) params.search = filters.search;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;
  if (filters.category) params.category = filters.category;
  if (filters.tag) params.tag = filters.tag;
  if (filters.published != null) params.published = String(filters.published);
  return params;
}

export function normalizeArticleFilters(
  filters: ArticleFilters,
): ArticleFilters {
  return {
    ...filters,
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    sortBy: filters.sortBy ?? "createdAt",
  };
}

/* =========================================================
   Invalidation Helpers
   ========================================================= */

import type { QueryClient } from "@tanstack/react-query";

export function invalidateBlogLists(
  queryClient: QueryClient,
  filters?: ArticleFilters,
) {
  if (filters) {
    queryClient.invalidateQueries({
      queryKey: blogKeys.list(filters),
    });
    return;
  }
  queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
}

export function invalidateAdminBlogLists(
  queryClient: QueryClient,
  filters?: ArticleFilters,
) {
  if (filters) {
    queryClient.invalidateQueries({
      queryKey: blogKeys.adminList(filters),
    });
    return;
  }
  queryClient.invalidateQueries({ queryKey: blogKeys.adminLists() });
}

export function invalidateBlogDetail(
  queryClient: QueryClient,
  slug: string,
) {
  queryClient.invalidateQueries({ queryKey: blogKeys.detail(slug) });
}

export function invalidateAdminBlogDetail(
  queryClient: QueryClient,
  id: string,
) {
  queryClient.invalidateQueries({ queryKey: blogKeys.adminDetail(id) });
}

export function removeBlogDetail(
  queryClient: QueryClient,
  slug: string,
) {
  queryClient.removeQueries({ queryKey: blogKeys.detail(slug) });
}

export function removeAdminBlogDetail(
  queryClient: QueryClient,
  id: string,
) {
  queryClient.removeQueries({ queryKey: blogKeys.adminDetail(id) });
}
