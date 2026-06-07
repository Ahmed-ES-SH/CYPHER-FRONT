export {
  useBlogPosts,
  useBlogPost,
  useAdminBlogPosts,
  useAdminBlogPost,
  useCreateBlogPost,
  useUpdateBlogPost,
  usePublishBlogPost,
  useDeleteBlogPost,
  prefetchBlogPosts,
  prefetchBlogPost,
  prefetchAdminBlogPosts,
  prefetchAdminBlogPost,
} from "./hooks/blog.hooks";

export {
  useBlogUIStore,
} from "./store/blog.store";

export type {
  BlogArticle,
  BlogArticleSummary,
  BlogCategory,
  BlogTag,
  BlogAuthor,
  ArticleStatus,
  CreateArticleInput,
  UpdateArticleInput,
  PublishArticleInput,
  ArticleFilters,
  BlogSortField,
  SortOrder,
  PaginatedArticles,
  PaginationMeta,
  DeleteArticleResult,
  ApiError,
  ValidationErrorMap,
} from "./types/blog.types";

export type { BlogUIState } from "./store/blog.store";

export {
  configureBlog,
  getBlogConfig,
  resetBlogConfig,
} from "./config/blog.config";

export {
  defaultTransport,
  setTransport,
  getActiveTransport,
  parseApiError,
  parseValidationErrors,
  BLOG_ENDPOINTS,
  blogKeys,
  getBlogPostsApi,
  getBlogPostApi,
  getAdminBlogPostsApi,
  getAdminBlogPostApi,
  createBlogPostApi,
  updateBlogPostApi,
  publishBlogPostApi,
  deleteBlogPostApi,
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
  invalidateBlogLists,
  invalidateAdminBlogLists,
  invalidateBlogDetail,
  invalidateAdminBlogDetail,
  removeBlogDetail,
  removeAdminBlogDetail,
} from "./api/blog.api";

export type { Transport } from "./api/blog.api";

export { blogToLegacyArticle, blogToLegacyArticleSummary } from "./adapters/blogToLegacy";
