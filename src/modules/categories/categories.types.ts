/* =========================================================
   Read Models (timestamps as ISO strings)
   ========================================================= */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDetails extends Category {
  parentId: string | null;
  children: Category[];
}

/* =========================================================
   Write DTOs
   ========================================================= */

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  order?: number;
}

export interface ReorderCategoriesInput {
  items: { id: string; order: number }[];
}

/* =========================================================
   Query Types
   ========================================================= */

export type CategorySortField = "name" | "order" | "createdAt";

export type SortOrder = "ASC" | "DESC";

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: CategorySortField;
  sortOrder?: SortOrder;
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

export interface PaginatedCategories {
  data: Category[];
  meta: PaginationMeta;
}

export interface DeleteCategoryResult {
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

export class CategoryApiError extends Error implements ApiError {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "CategoryApiError";
    this.status = status;
    this.errors = errors;
    // Restore prototype chain
    Object.setPrototypeOf(this, CategoryApiError.prototype);
  }
}

export type ValidationErrorMap = Record<string, string>;

