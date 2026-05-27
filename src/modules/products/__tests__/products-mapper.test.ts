import { describe, it, expect } from "vitest";
import {
  normalizeProductPayload,
  normalizeTags,
  normalizeMediaUrls,
  coercePagination,
} from "../transformers/product.mapper";
import type { ProductMedia } from "../types/product.types";

/* =========================================================
   normalizeTags
   ========================================================= */

describe("normalizeTags", () => {
  it("returns empty array for undefined", () => {
    expect(normalizeTags(undefined)).toEqual([]);
  });

  it("returns empty array for non-array", () => {
    expect(normalizeTags(null as unknown as string[])).toEqual([]);
  });

  it("lowercases and trims tags", () => {
    expect(normalizeTags(["  ELECTRONICS ", "Gadget "])).toEqual([
      "electronics",
      "gadget",
    ]);
  });

  it("deduplicates tags", () => {
    expect(normalizeTags(["tag", "TAG", "tag"])).toEqual(["tag"]);
  });

  it("filters out empty strings", () => {
    expect(normalizeTags(["valid", "", "  "])).toEqual(["valid"]);
  });
});

/* =========================================================
   normalizeMediaUrls
   ========================================================= */

describe("normalizeMediaUrls", () => {
  it("returns empty array for undefined", () => {
    expect(normalizeMediaUrls(undefined)).toEqual([]);
  });

  it("converts string array to ProductMedia", () => {
    const result = normalizeMediaUrls(["/img1.jpg", "/img2.jpg"]);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ url: "/img1.jpg" });
    expect(result[1]).toEqual({ url: "/img2.jpg" });
  });

  it("passes through ProductMedia objects", () => {
    const media: ProductMedia[] = [
      { url: "/img.jpg", alt: "Image", isPrimary: true },
    ];
    const result = normalizeMediaUrls(media);
    expect(result).toEqual(media);
  });

  it("handles mixed arrays", () => {
    const input: (string | ProductMedia)[] = [
      "/img1.jpg",
      { url: "/img2.jpg", alt: "Second" },
    ];
    const result = normalizeMediaUrls(input);
    expect(result[0]).toEqual({ url: "/img1.jpg" });
    expect(result[1]).toEqual({ url: "/img2.jpg", alt: "Second" });
  });
});

/* =========================================================
   coercePagination
   ========================================================= */

describe("coercePagination", () => {
  it("extracts page, limit, total, totalPages", () => {
    const result = coercePagination({
      page: 2,
      limit: 20,
      total: 100,
      totalPages: 5,
    });
    expect(result).toEqual({ page: 2, limit: 20, total: 100, totalPages: 5 });
  });

  it("handles snake_case totalPages as lastPage", () => {
    const result = coercePagination({
      page: 1,
      limit: 10,
      total: 50,
      lastPage: 3,
    });
    expect(result.totalPages).toBe(3);
  });

  it("clamps minimum values", () => {
    const result = coercePagination({
      page: 0,
      limit: 0,
      total: -1,
      totalPages: 0,
    });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(1);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it("clamps limit to max 100", () => {
    const result = coercePagination({
      page: 1,
      limit: 500,
      total: 1000,
      totalPages: 10,
    });
    expect(result.limit).toBe(100);
  });

  it("handles empty object", () => {
    const result = coercePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });
});

/* =========================================================
   normalizeProductPayload
   ========================================================= */

describe("normalizeProductPayload", () => {
  const minimalRaw = {
    id: "prod-1",
    title: "Test Product",
    description: "A test product",
    sku: "TST-001",
    price: 29.99,
    stock: 10,
    categoryId: "cat-1",
  };

  it("normalizes a minimal raw payload", () => {
    const product = normalizeProductPayload(minimalRaw);
    expect(product.id).toBe("prod-1");
    expect(product.title).toBe("Test Product");
    expect(product.price).toBe(29.99);
    expect(product.stock).toBe(10);
    expect(product.slug).toBe("test-product");
    expect(product.tags).toEqual([]);
    expect(product.media).toEqual([]);
    expect(product.rating).toBe(0);
    expect(product.discountedPrice).toBe(29.99);
    expect(product.availabilityStatus).toBe("In Stock");
  });

  it("clamps negative price to 0", () => {
    const product = normalizeProductPayload({ ...minimalRaw, price: -10 });
    expect(product.price).toBe(0);
  });

  it("handles discountPercentage", () => {
    const product = normalizeProductPayload({
      ...minimalRaw,
      price: 100,
      discountPercentage: 20,
    });
    expect(product.discountPercentage).toBe(20);
    expect(product.discountedPrice).toBe(80);
  });

  it("clamps discountPercentage between 0 and 100", () => {
    const p1 = normalizeProductPayload({
      ...minimalRaw,
      discountPercentage: -10,
    });
    expect(p1.discountPercentage).toBe(0);

    const p2 = normalizeProductPayload({
      ...minimalRaw,
      discountPercentage: 150,
    });
    expect(p2.discountPercentage).toBe(100);
  });

  it("clamps stock to non-negative integer", () => {
    const product = normalizeProductPayload({ ...minimalRaw, stock: -5 });
    expect(product.stock).toBe(0);
  });

  it("clamps rating between 0 and 5", () => {
    const p1 = normalizeProductPayload({ ...minimalRaw, rating: -1 });
    expect(p1.rating).toBe(0);

    const p2 = normalizeProductPayload({ ...minimalRaw, rating: 10 });
    expect(p2.rating).toBe(5);
  });

  it("derives availability status from stock", () => {
    const outOfStock = normalizeProductPayload({ ...minimalRaw, stock: 0 });
    expect(outOfStock.availabilityStatus).toBe("Out of Stock");

    const lowStock = normalizeProductPayload({ ...minimalRaw, stock: 3 });
    expect(lowStock.availabilityStatus).toBe("Low Stock");
  });

  it("sets minimumOrderQuantity to at least 1", () => {
    const product = normalizeProductPayload({
      ...minimalRaw,
      minimumOrderQuantity: 0,
    });
    expect(product.minimumOrderQuantity).toBe(1);
  });

  it("picks thumbnail from media", () => {
    const product = normalizeProductPayload({
      ...minimalRaw,
      media: [
        { url: "/img1.jpg", isPrimary: true },
        { url: "/img2.jpg" },
      ],
    });
    expect(product.thumbnail).toBe("/img1.jpg");
  });

  it("falls back to first media item for thumbnail", () => {
    const product = normalizeProductPayload({
      ...minimalRaw,
      images: ["/img1.jpg"],
    });
    expect(product.thumbnail).toBe("/img1.jpg");
  });

  it("uses existing slug when provided", () => {
    const product = normalizeProductPayload({
      ...minimalRaw,
      slug: "custom-slug",
    });
    expect(product.slug).toBe("custom-slug");
  });

  it("handles images array (legacy format)", () => {
    const product = normalizeProductPayload({
      ...minimalRaw,
      images: ["/img1.jpg", "/img2.jpg"],
    });
    expect(product.media).toHaveLength(2);
    expect(product.media[0].url).toBe("/img1.jpg");
  });

  it("defaults createdAt/updatedAt when missing", () => {
    const product = normalizeProductPayload(minimalRaw);
    expect(product.createdAt).toBeDefined();
    expect(product.updatedAt).toBeDefined();
  });

  it("uses dimensions or defaults", () => {
    const withDims = normalizeProductPayload({
      ...minimalRaw,
      dimensions: { width: 10, height: 5, depth: 2 },
    });
    expect(withDims.dimensions).toEqual({ width: 10, height: 5, depth: 2 });

    const withoutDims = normalizeProductPayload(minimalRaw);
    expect(withoutDims.dimensions).toEqual({ width: 0, height: 0, depth: 0 });
  });
});
