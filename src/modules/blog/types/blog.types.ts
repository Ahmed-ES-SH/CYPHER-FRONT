/* =========================================================
   Read Models (timestamps as ISO strings)
   ========================================================= */

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  category: BlogCategory;
  tags: BlogTag[];
  author: BlogAuthor;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  category: BlogCategory;
  tags: BlogTag[];
  author: Pick<BlogAuthor, "id" | "name" | "avatar">;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
}

export type ArticleStatus = "draft" | "published" | "archived";

/* =========================================================
   Write DTOs
   ========================================================= */

export interface CreateArticleInput {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string | null;
  categoryId: string;
  tagIds?: string[];
  status?: ArticleStatus;
  publishedAt?: string | null;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string | null;
  categoryId?: string;
  tagIds?: string[];
  status?: ArticleStatus;
  publishedAt?: string | null;
}

export interface PublishArticleInput {
  status: Extract<ArticleStatus, "published" | "draft">;
}

/* =========================================================
   Query Types
   ========================================================= */

export type BlogSortField = "title" | "createdAt" | "publishedAt" | "updatedAt";

export type SortOrder = "ASC" | "DESC";

export interface ArticleFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: BlogSortField;
  sortOrder?: SortOrder;
  category?: string;
  tag?: string;
  published?: boolean;
}

/* =========================================================
   Response Wrappers
   ========================================================= */

export interface PaginationMeta {
  page: number;
  limit: number;
  lastPage: number;
  total: number;
}

export interface PaginatedArticles {
  data: BlogArticleSummary[];
  meta: PaginationMeta;
}

export interface DeleteArticleResult {
  success: boolean;
  message: string;
}

/* =========================================================
   Error Types
   ========================================================= */

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export type ValidationErrorMap = Record<string, string>;

export class BlogApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "BlogApiError";
    this.status = status;
    this.errors = errors;
  }
}
