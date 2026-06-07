import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useBlogPosts,
  useBlogPost,
} from "../hooks/blog.hooks";
import * as api from "../api/blog.api";
import type {
  PaginatedArticles,
  BlogArticle,
} from "../types/blog.types";

/* =========================================================
   Test setup
   ========================================================= */

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const mockArticleSummary = {
  id: "1",
  title: "Test Article",
  slug: "test-article",
  excerpt: "A test article",
  featuredImage: null,
  category: { id: "c1", name: "Tech", slug: "tech", description: null, createdAt: "", updatedAt: "" },
  tags: [{ id: "t1", name: "Apple", slug: "apple" }],
  author: { id: "a1", name: "John", avatar: null },
  status: "published" as const,
  publishedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const mockArticle: BlogArticle = {
  id: "1",
  title: "Test Article",
  slug: "test-article",
  excerpt: "A test article",
  content: "Full content here",
  featuredImage: null,
  category: { id: "c1", name: "Tech", slug: "tech", description: null, createdAt: "", updatedAt: "" },
  tags: [{ id: "t1", name: "Apple", slug: "apple" }],
  author: { id: "a1", name: "John", email: "john@test.com", avatar: null, bio: null },
  status: "published",
  publishedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const mockPaginated: PaginatedArticles = {
  data: [mockArticleSummary],
  meta: { page: 1, limit: 20, lastPage: 1, total: 1 },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

/* =========================================================
   useBlogPosts
   ========================================================= */

describe("useBlogPosts", () => {
  it("fetches blog posts with default params", async () => {
    vi.spyOn(api, "getBlogPostsApi").mockResolvedValue(mockPaginated);

    const { result } = renderHook(() => useBlogPosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPaginated);
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].title).toBe("Test Article");
  });

  it("fetches blog posts with custom filters", async () => {
    const spy = vi
      .spyOn(api, "getBlogPostsApi")
      .mockResolvedValue(mockPaginated);

    renderHook(() => useBlogPosts({ page: 2, limit: 10, category: "tech" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });

  it("returns empty data when no posts exist", async () => {
    vi.spyOn(api, "getBlogPostsApi").mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, lastPage: 0, total: 0 },
    });

    const { result } = renderHook(() => useBlogPosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([]);
    expect(result.current.data?.meta.total).toBe(0);
  });

  it("surfaces API errors", async () => {
    vi.spyOn(api, "getBlogPostsApi").mockRejectedValue(
      new Error("Failed to fetch"),
    );

    const { result } = renderHook(() => useBlogPosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(result.current.error?.message).toBe("Failed to fetch");
  });
});

/* =========================================================
   useBlogPost
   ========================================================= */

describe("useBlogPost", () => {
  it("fetches a single blog post by slug", async () => {
    vi.spyOn(api, "getBlogPostApi").mockResolvedValue(mockArticle);

    const { result } = renderHook(() => useBlogPost("test-article"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockArticle);
    expect(result.current.data?.content).toBe("Full content here");
  });

  it("is disabled when slug is undefined", async () => {
    const spy = vi.spyOn(api, "getBlogPostApi");

    const { result } = renderHook(() => useBlogPost(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("is disabled when slug is empty string", async () => {
    const spy = vi.spyOn(api, "getBlogPostApi");

    const { result } = renderHook(() => useBlogPost(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });

  it("surfaces API errors", async () => {
    vi.spyOn(api, "getBlogPostApi").mockRejectedValue(
      new Error("Article not found"),
    );

    const { result } = renderHook(() => useBlogPost("non-existent"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(result.current.error?.message).toBe("Article not found");
  });
});
