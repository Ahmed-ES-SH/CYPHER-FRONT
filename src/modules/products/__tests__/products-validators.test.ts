import { describe, it, expect } from "vitest";
import {
  validateCreateProduct,
  validateUpdateProduct,
} from "../validators/product.validators";
import {
  validateProductQuery,
  validateAdminProductQuery,
} from "../validators/product-query.validators";
import type { CreateProductDto } from "../types/product-dto.types";

/* =========================================================
   validateCreateProduct
   ========================================================= */

describe("validateCreateProduct", () => {
  const validDto: CreateProductDto = {
    title: "Test Product",
    description: "A great product description",
    sku: "TST-001",
    price: 29.99,
    stock: 10,
    categoryId: "cat-1",
  };

  it("returns empty errors for valid input", () => {
    expect(validateCreateProduct(validDto)).toHaveLength(0);
  });

  it("requires title", () => {
    const errors = validateCreateProduct({ ...validDto, title: "" });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "title" }),
    );
  });

  it("requires description", () => {
    const errors = validateCreateProduct({ ...validDto, description: "" });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "description" }),
    );
  });

  it("requires SKU", () => {
    const errors = validateCreateProduct({ ...validDto, sku: "" });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "sku" }),
    );
  });

  it("requires non-negative price", () => {
    const errors = validateCreateProduct({ ...validDto, price: -1 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "price" }),
    );

    expect(validateCreateProduct({ ...validDto, price: 0 })).toHaveLength(0);
  });

  it("requires non-negative stock", () => {
    const errors = validateCreateProduct({ ...validDto, stock: -1 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "stock" }),
    );

    expect(validateCreateProduct({ ...validDto, stock: 0 })).toHaveLength(0);
  });

  it("requires categoryId", () => {
    const errors = validateCreateProduct({ ...validDto, categoryId: "" });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "categoryId" }),
    );
  });

  it("returns multiple errors at once", () => {
    const errors = validateCreateProduct({
      title: "",
      description: "",
      sku: "",
      price: -1,
      stock: -1,
      categoryId: "",
    });
    expect(errors).toHaveLength(6);
  });

  it("trims whitespace before checking required fields", () => {
    const errors = validateCreateProduct({
      ...validDto,
      title: "   ",
      description: "   ",
      sku: "   ",
      categoryId: "   ",
    });
    expect(errors).toHaveLength(4);
  });
});

/* =========================================================
   validateUpdateProduct
   ========================================================= */

describe("validateUpdateProduct", () => {
  it("returns empty errors when all fields are valid", () => {
    expect(
      validateUpdateProduct({ title: "Updated", price: 10, stock: 5 }),
    ).toHaveLength(0);
  });

  it("allows partial updates (empty dto)", () => {
    expect(validateUpdateProduct({})).toHaveLength(0);
  });

  it("rejects empty title when title is provided", () => {
    const errors = validateUpdateProduct({ title: "" });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "title" }),
    );
  });

  it("ignores title validation when title is undefined", () => {
    expect(validateUpdateProduct({ price: 10 })).toHaveLength(0);
  });

  it("rejects negative price", () => {
    const errors = validateUpdateProduct({ price: -5 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "price" }),
    );
  });

  it("rejects negative stock", () => {
    const errors = validateUpdateProduct({ stock: -1 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "stock" }),
    );
  });
});

/* =========================================================
   validateProductQuery
   ========================================================= */

describe("validateProductQuery", () => {
  it("returns empty errors for empty query", () => {
    expect(validateProductQuery({})).toHaveLength(0);
  });

  it("rejects page less than 1", () => {
    const errors = validateProductQuery({ page: 0 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "page" }),
    );
  });

  it("rejects non-integer page", () => {
    const errors = validateProductQuery({ page: 1.5 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "page" }),
    );
  });

  it("rejects limit less than 1", () => {
    const errors = validateProductQuery({ limit: 0 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "limit" }),
    );
  });

  it("rejects limit greater than 100", () => {
    const errors = validateProductQuery({ limit: 101 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "limit" }),
    );
  });

  it("rejects negative minPrice", () => {
    const errors = validateProductQuery({ minPrice: -1 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "minPrice" }),
    );
  });

  it("rejects negative maxPrice", () => {
    const errors = validateProductQuery({ maxPrice: -10 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "maxPrice" }),
    );
  });

  it("rejects minPrice > maxPrice", () => {
    const errors = validateProductQuery({ minPrice: 100, maxPrice: 50 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "minPrice" }),
    );
  });

  it("accepts valid query params", () => {
    expect(
      validateProductQuery({ page: 2, limit: 20, minPrice: 10, maxPrice: 100 }),
    ).toHaveLength(0);
  });
});

/* =========================================================
   validateAdminProductQuery
   ========================================================= */

describe("validateAdminProductQuery", () => {
  it("validates base product query fields", () => {
    const errors = validateAdminProductQuery({ page: 0 });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "page" }),
    );
  });

  it("rejects non-boolean isPublished", () => {
    const errors = validateAdminProductQuery({
      isPublished: "yes" as unknown as boolean,
    });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "isPublished" }),
    );
  });

  it("accepts boolean isPublished", () => {
    expect(
      validateAdminProductQuery({ isPublished: true }),
    ).toHaveLength(0);
    expect(
      validateAdminProductQuery({ isPublished: false }),
    ).toHaveLength(0);
  });

  it("rejects non-boolean isDeleted", () => {
    const errors = validateAdminProductQuery({
      isDeleted: 1 as unknown as boolean,
    });
    expect(errors).toContainEqual(
      expect.objectContaining({ field: "isDeleted" }),
    );
  });

  it("accepts boolean isDeleted", () => {
    expect(
      validateAdminProductQuery({ isDeleted: true }),
    ).toHaveLength(0);
    expect(
      validateAdminProductQuery({ isDeleted: false }),
    ).toHaveLength(0);
  });

  it("returns empty errors for valid admin query", () => {
    expect(
      validateAdminProductQuery({
        page: 1,
        limit: 20,
        isPublished: true,
        isDeleted: false,
      }),
    ).toHaveLength(0);
  });
});
