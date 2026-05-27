import type { CreateProductDto, UpdateProductDto } from "../types/product-dto.types";
import type { ValidationErrorItem } from "../types/product-error.types";

export function validateCreateProduct(
  dto: CreateProductDto,
): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = [];
  if (!dto.title?.trim()) {
    errors.push({ field: "title", message: "Title is required" });
  }
  if (!dto.description?.trim()) {
    errors.push({ field: "description", message: "Description is required" });
  }
  if (!dto.sku?.trim()) {
    errors.push({ field: "sku", message: "SKU is required" });
  }
  if (dto.price == null || dto.price < 0) {
    errors.push({
      field: "price",
      message: "Price must be a non-negative number",
    });
  }
  if (dto.stock == null || dto.stock < 0) {
    errors.push({
      field: "stock",
      message: "Stock must be a non-negative number",
    });
  }
  if (!dto.categoryId?.trim()) {
    errors.push({ field: "categoryId", message: "Category is required" });
  }
  return errors;
}

export function validateUpdateProduct(
  dto: UpdateProductDto,
): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = [];
  if (dto.title !== undefined && !dto.title?.trim()) {
    errors.push({ field: "title", message: "Title cannot be empty" });
  }
  if (dto.price !== undefined && dto.price < 0) {
    errors.push({
      field: "price",
      message: "Price must be a non-negative number",
    });
  }
  if (dto.stock !== undefined && dto.stock < 0) {
    errors.push({
      field: "stock",
      message: "Stock must be a non-negative number",
    });
  }
  return errors;
}
