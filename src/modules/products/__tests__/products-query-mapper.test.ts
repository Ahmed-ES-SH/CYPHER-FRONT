import { describe, it, expect } from "vitest";
import {
  normalizeProductQuery,
  normalizeAdminProductQuery,
  serializeProductQuery,
} from "../transformers/product-query.mapper";

/* =========================================================
   normalizeProductQuery
   ========================================================= */

describe("normalizeProductQuery", () => {
  it("returns defaults for empty query", () => {
    const result = normalizeProductQuery({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it("clamps page to minimum 1", () => {
    expect(normalizeProductQuery({ page: 0 }).page).toBe(1);
    expect(normalizeProductQuery({ page: -5 }).page).toBe(1);
  });

  it("clamps limit between 1 and 100", () => {
    expect(normalizeProductQuery({ limit: 1 }).limit).toBe(1);
    expect(normalizeProductQuery({ limit: 200 }).limit).toBe(100);
  });

  it("strips undefined optional fields", () => {
    const result = normalizeProductQuery({
      search: "",
      categorySlug: "",
    });
    expect(result.search).toBeUndefined();
    expect(result.categorySlug).toBeUndefined();
  });

  it("trims search and categorySlug", () => {
    const result = normalizeProductQuery({
      search: "  laptop  ",
      categorySlug: "  electronics  ",
    });
    expect(result.search).toBe("laptop");
    expect(result.categorySlug).toBe("electronics");
  });

  it("clamps minPrice and maxPrice to non-negative", () => {
    const result = normalizeProductQuery({ minPrice: -10, maxPrice: -5 });
    expect(result.minPrice).toBe(0);
    expect(result.maxPrice).toBe(0);
  });
});

/* =========================================================
   normalizeAdminProductQuery
   ========================================================= */

describe("normalizeAdminProductQuery", () => {
  it("extends product query with admin fields", () => {
    const result = normalizeAdminProductQuery({
      page: 2,
      isPublished: true,
      isDeleted: false,
    });
    expect(result.page).toBe(2);
    expect(result.isPublished).toBe(true);
    expect(result.isDeleted).toBe(false);
  });

  it("treats undefined admin fields as undefined", () => {
    const result = normalizeAdminProductQuery({});
    expect(result.isPublished).toBeUndefined();
    expect(result.isDeleted).toBeUndefined();
  });
});

/* =========================================================
   serializeProductQuery
   ========================================================= */

describe("serializeProductQuery", () => {
  it("omits default values", () => {
    const result = serializeProductQuery({ page: 1, limit: 10 });
    expect(result.page).toBeUndefined();
    expect(result.limit).toBeUndefined();
  });

  it("includes non-default values", () => {
    const result = serializeProductQuery({ page: 2, limit: 20 });
    expect(result.page).toBe("2");
    expect(result.limit).toBe("20");
  });

  it("serializes string filters", () => {
    const result = serializeProductQuery({
      search: "laptop",
      categorySlug: "electronics",
    });
    expect(result.search).toBe("laptop");
    expect(result.categorySlug).toBe("electronics");
  });

  it("serializes price filters", () => {
    const result = serializeProductQuery({ minPrice: 10, maxPrice: 100 });
    expect(result.minPrice).toBe("10");
    expect(result.maxPrice).toBe("100");
  });

  it("serializes sort params", () => {
    const result = serializeProductQuery({
      sortBy: "price",
      sortOrder: "asc",
    });
    expect(result.sortBy).toBe("price");
    expect(result.sortOrder).toBe("asc");
  });

  it("serializes inStockOnly", () => {
    const result = serializeProductQuery({ inStockOnly: true });
    expect(result.inStock).toBe("true");
  });

  it("serializes admin-specific fields", () => {
    const result = serializeProductQuery({
      isPublished: true,
      isDeleted: false,
    });
    expect(result.isPublished).toBe("true");
    expect(result.isDeleted).toBe("false");
  });

  it("omits admin fields on ProductQuery", () => {
    const result = serializeProductQuery({});
    expect(result.isPublished).toBeUndefined();
    expect(result.isDeleted).toBeUndefined();
  });

  it("returns empty object for default query", () => {
    const result = serializeProductQuery({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});
