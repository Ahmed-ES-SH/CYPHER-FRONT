import type { ProductQuery, AdminProductQuery } from "../types/product-dto.types";
import type { ValidationErrorItem } from "../types/product-error.types";

export function validateProductQuery(
  query: Partial<ProductQuery>,
): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = [];
  if (
    query.page !== undefined &&
    (query.page < 1 || !Number.isInteger(query.page))
  ) {
    errors.push({ field: "page", message: "Page must be a positive integer" });
  }
  if (
    query.limit !== undefined &&
    (query.limit < 1 || query.limit > 100 || !Number.isInteger(query.limit))
  ) {
    errors.push({
      field: "limit",
      message: "Limit must be between 1 and 100",
    });
  }
  if (query.minPrice !== undefined && query.minPrice < 0) {
    errors.push({
      field: "minPrice",
      message: "Minimum price cannot be negative",
    });
  }
  if (query.maxPrice !== undefined && query.maxPrice < 0) {
    errors.push({
      field: "maxPrice",
      message: "Maximum price cannot be negative",
    });
  }
  if (
    query.minPrice !== undefined &&
    query.maxPrice !== undefined &&
    query.minPrice > query.maxPrice
  ) {
    errors.push({
      field: "minPrice",
      message: "Minimum price cannot exceed maximum price",
    });
  }
  return errors;
}

export function validateAdminProductQuery(
  query: Partial<AdminProductQuery>,
): ValidationErrorItem[] {
  const errors = validateProductQuery(query);

  if (
    query.isPublished !== undefined &&
    typeof query.isPublished !== "boolean"
  ) {
    errors.push({
      field: "isPublished",
      message: "isPublished must be a boolean value",
    });
  }

  if (query.isDeleted !== undefined && typeof query.isDeleted !== "boolean") {
    errors.push({
      field: "isDeleted",
      message: "isDeleted must be a boolean value",
    });
  }

  return errors;
}
