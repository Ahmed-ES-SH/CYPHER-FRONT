import type { ProductDimensions, ProductMedia } from "./product.types";

export interface CreateProductDto {
  title: string;
  description: string;
  sku: string;
  price: number;
  discountPercentage?: number;
  stock: number;
  minimumOrderQuantity?: number;
  categoryId: string;
  brand?: string;
  tags?: string[];
  media?: ProductMedia[];
  dimensions?: ProductDimensions;
  weight?: number;
  isPublished?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  categoryIds?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "title" | "rating" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  inStockOnly?: boolean;
  brand?: string;
  onSale?: boolean;
  minDiscount?: number;
  maxDiscount?: number;
  minWeight?: number;
  maxWeight?: number;
  tags?: string;
  minRating?: number;
}

export interface AdminProductQuery extends ProductQuery {
  isPublished?: boolean;
  isDeleted?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MutationResult {
  success: boolean;
  message: string;
  productId?: string;
}

export interface PublishToggleResult {
  success: boolean;
  isPublished: boolean;
  message: string;
}
