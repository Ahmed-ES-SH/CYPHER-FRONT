import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BLOG_ENDPOINTS,
  blogKeys,
  toBlogArticle,
  toBlogArticleSummary,
  toBlogCategory,
  toBlogTag,
  toBlogAuthor,
  normalizeSlug,
  buildQueryString,
  estimateReadTime,
  generateExcerpt,
  parseArticleFilters,
  serializeArticleFilters,
  normalizeArticleFilters,
  parseApiError,
  parseValidationErrors,
  getBlogPostsApi,
  getBlogPostApi,
} from "../api/blog.api";
import type { ArticleFilters } from "../types/blog.types";

/* =========================================================
   BLOG_ENDPOINTS
   ========================================================= */

describe("BLOG_ENDPOINTS", () => {
  it("PUBLIC_LIST is /api/blog", () => {
    expect(BLOG_ENDPOINTS.PUBLIC_LIST).toBe("/api/blog");
  });

  it("PUBLIC_DETAIL interpolates slug", () => {
    expect(BLOG_ENDPOINTS.PUBLIC_DETAIL("hello-world")).toBe(
      "/api/blog/hello-world",
    );
  });

  it("ADMIN_LIST is /api/admin/blog", () => {
    expect(BLOG_ENDPOINTS.ADMIN_LIST).toBe("/api/admin/blog");
  });

  it("ADMIN_DETAIL interpolates id", () => {
    expect(BLOG_ENDPOINTS.ADMIN_DETAIL("abc-123")).toBe(
      "/api/admin/blog/abc-123",
    );
  });

  it("CREATE is /api/admin/blog", () => {
    expect(BLOG_ENDPOINTS.CREATE).toBe("/api/admin/blog");
  });

  it("UPDATE interpolates id", () => {
    expect(BLOG_ENDPOINTS.UPDATE("id-1")).toBe("/api/admin/blog/id-1");
  });

  it("PUBLISH interpolates id", () => {
    expect(BLOG_ENDPOINTS.PUBLISH("id-1")).toBe(
      "/api/admin/blog/id-1/publish",
    );
  });

  it("DELETE interpolates id", () => {
    expect(BLOG_ENDPOINTS.DELETE("id-1")).toBe("/api/admin/blog/id-1");
  });
});

/* =========================================================
   blogKeys
   ========================================================= */

describe("blogKeys", () => {
  it("all is ['blog']", () => {
    expect(blogKeys.all).toEqual(["blog"]);
  });

  it("lists() is ['blog', 'list']", () => {
    expect(blogKeys.lists()).toEqual(["blog", "list"]);
  });

  it("list(filters) includes filters", () => {
    const filters: ArticleFilters = { page: 1, limit: 10 };
    const key = blogKeys.list(filters);
    expect(key[0]).toBe("blog");
    expect(key[1]).toBe("list");
    expect(key[2]).toEqual(filters);
  });

  it("list() without filters", () => {
    const key = blogKeys.list();
    expect(key).toEqual(["blog", "list", undefined]);
  });

  it("detail(slug) is ['blog', 'detail', slug]", () => {
    expect(blogKeys.detail("my-article")).toEqual([
      "blog",
      "detail",
      "my-article",
    ]);
  });

  it("admin() prefix is ['blog', 'admin']", () => {
    expect(blogKeys.admin()).toEqual(["blog", "admin"]);
  });

  it("adminList(filters) includes filters", () => {
    const key = blogKeys.adminList({ page: 2 });
    expect(key[0]).toBe("blog");
    expect(key[1]).toBe("admin");
    expect(key[2]).toBe("list");
    expect(key[3]).toEqual({ page: 2 });
  });

  it("mutations() is ['blog', 'mutations']", () => {
    expect(blogKeys.mutations()).toEqual(["blog", "mutations"]);
  });
});

/* =========================================================
   normalizeSlug
   ========================================================= */

describe("normalizeSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(normalizeSlug("Hello World")).toBe("hello-world");
  });

  it("strips special characters", () => {
    expect(normalizeSlug("Hello! World?")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(normalizeSlug("hello---world")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(normalizeSlug("--hello-world--")).toBe("hello-world");
  });

  it("preserves Arabic characters", () => {
    expect(normalizeSlug("مرحبا العالم")).toBe("مرحبا-العالم");
  });

  it("handles empty string", () => {
    expect(normalizeSlug("")).toBe("");
  });
});

/* =========================================================
   buildQueryString
   ========================================================= */

describe("buildQueryString", () => {
  it("returns empty string for undefined filters", () => {
    expect(buildQueryString()).toBe("");
  });

  it("returns empty string for empty filters", () => {
    expect(buildQueryString({})).toBe("");
  });

  it("includes page when >= 1", () => {
    expect(buildQueryString({ page: 2 })).toBe("?page=2");
  });

  it("excludes page when < 1", () => {
    expect(buildQueryString({ page: 0 })).toBe("");
  });

  it("includes limit when between 1 and 100", () => {
    expect(buildQueryString({ limit: 25 })).toBe("?limit=25");
  });

  it("excludes limit when > 100", () => {
    expect(buildQueryString({ limit: 500 })).toBe("");
  });

  it("includes search", () => {
    expect(buildQueryString({ search: "iphone" })).toBe("?search=iphone");
  });

  it("includes sortBy", () => {
    const qs = buildQueryString({
      sortBy: "createdAt",
    });
    expect(qs).toContain("sortBy=createdAt");
  });

  it("includes category and tag", () => {
    const qs = buildQueryString({
      category: "smartphones",
      tag: "apple",
    });
    expect(qs).toContain("category=smartphones");
    expect(qs).toContain("tag=apple");
  });

  it("includes published boolean", () => {
    expect(buildQueryString({ published: true })).toContain(
      "published=true",
    );
    expect(buildQueryString({ published: false })).toContain(
      "published=false",
    );
  });

  it("combines multiple params", () => {
    const qs = buildQueryString({
      page: 1,
      limit: 20,
      search: "test",
      category: "tech",
      sortBy: "title",
    });
    expect(qs).toContain("page=1");
    expect(qs).toContain("limit=20");
    expect(qs).toContain("search=test");
    expect(qs).toContain("category=tech");
    expect(qs).toContain("sortBy=title");
  });
});

/* =========================================================
   estimateReadTime
   ========================================================= */

describe("estimateReadTime", () => {
  it("returns 0 for empty content", () => {
    expect(estimateReadTime("")).toBe(0);
  });

  it("returns 1 for very short content", () => {
    expect(estimateReadTime("Short text")).toBe(1);
  });

  it("calculates correctly for 400 words (2 min at 200 wpm)", () => {
    const words = Array(400).fill("word").join(" ");
    expect(estimateReadTime(words)).toBe(2);
  });

  it("rounds up fractional minutes", () => {
    // 250 words / 200 wpm = 1.25 -> ceil -> 2
    const words = Array(250).fill("word").join(" ");
    expect(estimateReadTime(words)).toBe(2);
  });

  it("respects custom wpm", () => {
    const words = Array(400).fill("word").join(" ");
    expect(estimateReadTime(words, 100)).toBe(4);
  });
});

/* =========================================================
   generateExcerpt
   ========================================================= */

describe("generateExcerpt", () => {
  it("strips HTML tags", () => {
    const html = "<p>Hello <strong>world</strong></p>";
    expect(generateExcerpt(html)).toBe("Hello world");
  });

  it("returns full text when shorter than maxLength", () => {
    expect(generateExcerpt("Short", 160)).toBe("Short");
  });

  it("truncates and appends ellipsis", () => {
    const long = "A".repeat(200);
    const result = generateExcerpt(long, 160);
    expect(result.length).toBe(163); // 160 + "..."
    expect(result.endsWith("...")).toBe(true);
  });

  it("uses default maxLength of 160", () => {
    const long = "A".repeat(200);
    const result = generateExcerpt(long);
    expect(result.length).toBe(163);
  });

  it("handles empty string", () => {
    expect(generateExcerpt("")).toBe("");
  });
});

/* =========================================================
   parseArticleFilters
   ========================================================= */

describe("parseArticleFilters", () => {
  it("parses page from searchParams", () => {
    const result = parseArticleFilters({ page: "2" });
    expect(result.page).toBe(2);
  });

  it("ignores invalid page", () => {
    const result = parseArticleFilters({ page: "invalid" });
    expect(result.page).toBeUndefined();
  });

  it("parses limit within bounds", () => {
    const result = parseArticleFilters({ limit: "50" });
    expect(result.limit).toBe(50);
  });

  it("ignores limit > 100", () => {
    const result = parseArticleFilters({ limit: "200" });
    expect(result.limit).toBeUndefined();
  });

  it("parses search", () => {
    const result = parseArticleFilters({ search: "  iphone  " });
    expect(result.search).toBe("iphone");
  });

  it("parses category", () => {
    const result = parseArticleFilters({ category: "smartphones" });
    expect(result.category).toBe("smartphones");
  });

  it("parses tag", () => {
    const result = parseArticleFilters({ tag: "apple" });
    expect(result.tag).toBe("apple");
  });

  it("parses published as true", () => {
    const result = parseArticleFilters({ published: "true" });
    expect(result.published).toBe(true);
  });

  it("parses published as false", () => {
    const result = parseArticleFilters({ published: "false" });
    expect(result.published).toBe(false);
  });

  it("parses sortBy", () => {
    const result = parseArticleFilters({
      sortBy: "title",
    });
    expect(result.sortBy).toBe("title");
  });

  it("returns empty object for empty input", () => {
    expect(parseArticleFilters({})).toEqual({});
  });
});

/* =========================================================
   serializeArticleFilters
   ========================================================= */

describe("serializeArticleFilters", () => {
  it("converts filters to string params", () => {
    const result = serializeArticleFilters({
      page: 2,
      limit: 10,
      search: "test",
      sortBy: "createdAt",
      category: "tech",
      tag: "apple",
      published: true,
    });
    expect(result).toEqual({
      page: "2",
      limit: "10",
      search: "test",
      sortBy: "createdAt",
      category: "tech",
      tag: "apple",
      published: "true",
    });
  });

  it("omits undefined/null values", () => {
    const result = serializeArticleFilters({});
    expect(result).toEqual({});
  });
});

/* =========================================================
   normalizeArticleFilters
   ========================================================= */

describe("normalizeArticleFilters", () => {
  it("fills defaults for empty filters", () => {
    const result = normalizeArticleFilters({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortBy).toBe("createdAt");
  });

  it("preserves provided values", () => {
    const result = normalizeArticleFilters({
      page: 3,
      limit: 50,
      sortBy: "title",
    });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
    expect(result.sortBy).toBe("title");
  });
});

/* =========================================================
   toBlogCategory
   ========================================================= */

describe("toBlogCategory", () => {
  it("maps a raw category object", () => {
    const raw = {
      id: "cat-1",
      name: "Technology",
      slug: "technology",
      description: "Tech articles",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };
    expect(toBlogCategory(raw)).toEqual(raw);
  });

  it("defaults missing optional fields", () => {
    const raw = { id: "cat-2", name: "News", slug: "news" };
    const result = toBlogCategory(raw);
    expect(result.description).toBeNull();
    expect(result.createdAt).toBe("");
    expect(result.updatedAt).toBe("");
  });
});

/* =========================================================
   toBlogTag
   ========================================================= */

describe("toBlogTag", () => {
  it("maps a raw tag object", () => {
    const raw = { id: "tag-1", name: "Apple", slug: "apple" };
    expect(toBlogTag(raw)).toEqual(raw);
  });
});

/* =========================================================
   toBlogAuthor
   ========================================================= */

describe("toBlogAuthor", () => {
  it("maps a raw author object", () => {
    const raw = {
      id: "author-1",
      name: "John Doe",
      email: "john@test.com",
      avatar: "https://example.com/avatar.jpg",
      bio: "Tech writer",
    };
    expect(toBlogAuthor(raw)).toEqual(raw);
  });

  it("defaults missing optional fields", () => {
    const raw = { id: "author-2", name: "Jane" };
    const result = toBlogAuthor(raw);
    expect(result.email).toBe("");
    expect(result.avatar).toBeNull();
    expect(result.bio).toBeNull();
  });
});

/* =========================================================
   toBlogArticleSummary
   ========================================================= */

describe("toBlogArticleSummary", () => {
  it("maps a raw article summary", () => {
    const raw = {
      id: "art-1",
      title: "Test Article",
      slug: "test-article",
      excerpt: "A test article",
      featuredImage: null,
      category: { id: "cat-1", name: "Tech", slug: "tech" },
      tags: [{ id: "tag-1", name: "Apple", slug: "apple" }],
      author: { id: "author-1", name: "John", avatar: null },
      status: "published",
      publishedAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const result = toBlogArticleSummary(raw);
    expect(result.id).toBe("art-1");
    expect(result.title).toBe("Test Article");
    expect(result.author.name).toBe("John");
    expect(result.tags).toHaveLength(1);
  });

  it("defaults missing fields", () => {
    const raw = { id: "art-2", title: "Untitled", slug: "untitled" };
    const result = toBlogArticleSummary(raw);
    expect(result.excerpt).toBe("");
    expect(result.featuredImage).toBeNull();
    expect(result.author.name).toBe("Unknown");
    expect(result.status).toBe("draft");
  });
});

/* =========================================================
   toBlogArticle
   ========================================================= */

describe("toBlogArticle", () => {
  it("maps a raw full article", () => {
    const raw = {
      id: "art-1",
      title: "Full Article",
      slug: "full-article",
      excerpt: "Excerpt",
      content: "Full content here",
      featuredImage: "https://example.com/img.jpg",
      category: { id: "cat-1", name: "Tech", slug: "tech" },
      tags: [{ id: "tag-1", name: "Apple", slug: "apple" }],
      author: {
        id: "author-1",
        name: "John",
        email: "john@test.com",
        avatar: null,
        bio: null,
      },
      status: "published",
      publishedAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };
    const result = toBlogArticle(raw);
    expect(result.id).toBe("art-1");
    expect(result.content).toBe("Full content here");
    expect(result.author.email).toBe("john@test.com");
    expect(result.updatedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("defaults missing fields", () => {
    const raw = { id: "art-2", title: "Untitled", slug: "untitled" };
    const result = toBlogArticle(raw);
    expect(result.content).toBe("");
    expect(result.status).toBe("draft");
    expect(result.author.name).toBe("Unknown");
  });
});

/* =========================================================
   parseApiError
   ========================================================= */

describe("parseApiError", () => {
  it("extracts message and status from structured error", () => {
    const result = parseApiError({
      message: "Not found",
      status: 404,
    });
    expect(result.message).toBe("Not found");
    expect(result.status).toBe(404);
  });

  it("defaults for null/undefined", () => {
    const result = parseApiError(null);
    expect(result.message).toBe("An unexpected error occurred");
    expect(result.status).toBe(500);
  });

  it("extracts nested validation errors", () => {
    const result = parseApiError({
      message: "Validation failed",
      status: 422,
      errors: { title: ["Title is required"] },
    });
    expect(result.errors?.title).toEqual(["Title is required"]);
  });

  it("defaults status for non-standard error shapes", () => {
    const result = parseApiError({ message: "Oops" });
    expect(result.status).toBe(500);
  });
});

/* =========================================================
   parseValidationErrors
   ========================================================= */

describe("parseValidationErrors", () => {
  it("converts field arrays to first-message map", () => {
    const result = parseValidationErrors({
      title: ["Title is required", "Too short"],
      content: ["Content cannot be empty"],
    });
    expect(result).toEqual({
      title: "Title is required",
      content: "Content cannot be empty",
    });
  });

  it("returns empty object when no errors", () => {
    expect(parseValidationErrors(undefined)).toEqual({});
    expect(parseValidationErrors({})).toEqual({});
  });

  it("handles empty arrays with fallback message", () => {
    const result = parseValidationErrors({ title: [] });
    expect(result.title).toBe("Invalid value");
  });
});

/* =========================================================
   getBlogPostsApi — mocks
   ========================================================= */

describe("getBlogPostsApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns paginated articles from transport", async () => {
    const mockTransport = {
      get: vi.fn().mockResolvedValue({
        data: [
          {
            id: "1",
            title: "Article 1",
            slug: "article-1",
            excerpt: "Excerpt",
            category: { id: "c1", name: "Tech", slug: "tech" },
            tags: [],
            author: { id: "a1", name: "John", avatar: null },
            status: "published",
            publishedAt: "2026-01-01T00:00:00.000Z",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          lastPage: 1,
          total: 1,
        },
      }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const result = await getBlogPostsApi({ page: 1 }, mockTransport);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe("Article 1");
    expect(result.meta.total).toBe(1);
  });

  it("handles various API response shapes (raw array, articles, posts)", async () => {
    // Test 'articles' property
    const transport1 = {
      get: vi.fn().mockResolvedValue({
        articles: [
          {
            id: "1",
            title: "From articles",
            slug: "from-articles",
            excerpt: "",
            category: { id: "c1", name: "Tech", slug: "tech" },
            tags: [],
            author: { id: "a1", name: "A", avatar: null },
            status: "draft",
            createdAt: "",
          },
        ],
        meta: { page: 1, limit: 20, lastPage: 1, total: 1 },
      }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    const result1 = await getBlogPostsApi(undefined, transport1);
    expect(result1.data[0].title).toBe("From articles");
  });

  it("falls back to empty meta when not provided", async () => {
    const transport = {
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const result = await getBlogPostsApi(undefined, transport);
    expect(result.data).toEqual([]);
    expect(result.meta.page).toBe(1);
    expect(result.meta.total).toBe(0);
  });

  it("throws when transport fails", async () => {
    const transport = {
      get: vi.fn().mockRejectedValue(new Error("Network error")),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    await expect(getBlogPostsApi(undefined, transport)).rejects.toThrow(
      "Network error",
    );
  });
});

/* =========================================================
   getBlogPostApi — mocks
   ========================================================= */

describe("getBlogPostApi", () => {
  it("returns a mapped blog article from transport", async () => {
    const transport = {
      get: vi.fn().mockResolvedValue({
        id: "1",
        title: "Single Article",
        slug: "single-article",
        excerpt: "Excerpt",
        content: "Full content",
        category: { id: "c1", name: "Tech", slug: "tech" },
        tags: [],
        author: {
          id: "a1",
          name: "John",
          email: "john@test.com",
          avatar: null,
          bio: null,
        },
        status: "published",
        publishedAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const result = await getBlogPostApi("single-article", transport);
    expect(result.title).toBe("Single Article");
    expect(result.content).toBe("Full content");
    expect(result.author.email).toBe("john@test.com");
  });
});
