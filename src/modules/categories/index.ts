export {
  useCategories,
  useCategory,
  useAdminCategories,
  useAdminCategory,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoriesMutation,
  prefetchCategories,
  prefetchCategory,
  prefetchAdminCategories,
  prefetchAdminCategory,
} from "./categories.hooks";

export {
  useCategoriesSelectionStore,
} from "./categories.store";

export type {
  Category,
  CategoryDetails,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput,
  CategoryFilters,
  CategorySortField,
  SortOrder,
  PaginatedCategories,
  PaginationMeta,
  DeleteCategoryResult,
  ApiError,
  ValidationErrorMap,
} from "./categories.types";

export type { CategoriesSelectionState } from "./categories.store";

export {
  defaultTransport,
  setTransport,
  getActiveTransport,
  parseApiError,
  parseValidationErrors,
  CATEGORY_ENDPOINTS,
  categoryKeys,
  getCategoriesApi,
  getCategoryApi,
  getAdminCategoriesApi,
  getAdminCategoryApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  reorderCategoriesApi,
  toCategory,
  toCategoryDetails,
  normalizeSlug,
  buildQueryString,
  invalidateCategoryLists,
  invalidateAdminCategoryLists,
  invalidateCategoryDetail,
  invalidateAdminCategoryDetail,
} from "./categories.api";

export type { Transport } from "./categories.api";
