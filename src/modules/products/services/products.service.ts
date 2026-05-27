import {
  getProductsApi,
  getProductApi,
  getProductsByCategoryApi,
} from "../api/products.api";
import type { Product } from "../types/product.types";
import type { ProductQuery, PaginatedResult } from "../types/product-dto.types";

export async function fetchProducts(
  query?: ProductQuery,
): Promise<PaginatedResult<Product>> {
  return getProductsApi(query);
}

export async function fetchProduct(slug: string): Promise<Product> {
  return getProductApi(slug);
}

export async function fetchProductsByCategory(
  categorySlug: string,
  query?: ProductQuery,
): Promise<PaginatedResult<Product>> {
  return getProductsByCategoryApi(categorySlug, query);
}
