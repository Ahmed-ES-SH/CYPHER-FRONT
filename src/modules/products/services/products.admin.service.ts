import {
  getAdminProductsApi,
  getAdminProductApi,
  createProductApi,
  updateProductApi,
  toggleProductPublishApi,
  deleteProductApi,
} from "../api/products.api";
import type { Product } from "../types/product.types";
import type {
  AdminProductQuery,
  CreateProductDto,
  UpdateProductDto,
  PaginatedResult,
  MutationResult,
  PublishToggleResult,
} from "../types/product-dto.types";

export async function fetchAdminProducts(
  query?: AdminProductQuery,
): Promise<PaginatedResult<Product>> {
  return getAdminProductsApi(query);
}

export async function fetchAdminProduct(id: string): Promise<Product> {
  return getAdminProductApi(id);
}

export async function createProduct(
  dto: CreateProductDto,
): Promise<Product> {
  return createProductApi(dto);
}

export async function updateProduct(
  id: string,
  dto: UpdateProductDto,
): Promise<Product> {
  return updateProductApi(id, dto);
}

export async function toggleProductPublish(
  id: string,
): Promise<PublishToggleResult> {
  return toggleProductPublishApi(id);
}

export async function deleteProduct(id: string): Promise<MutationResult> {
  return deleteProductApi(id);
}
