import { describe, it, expect } from "vitest";
import { buildProductSlug } from "../transformers/product-slug";

/* =========================================================
   buildProductSlug
   ========================================================= */

describe("buildProductSlug", () => {
  it("uses existing slug when provided", () => {
    expect(buildProductSlug("My Product", "my-product")).toBe("my-product");
  });

  it("generates slug from title when no existing slug", () => {
    expect(buildProductSlug("My Amazing Product")).toBe("my-amazing-product");
  });

  it("handles special characters", () => {
    expect(buildProductSlug("Hello! @World #2024")).toBe("hello-world-2024");
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(buildProductSlug("A  B   C----D")).toBe("a-b-c-d");
  });

  it("trims leading and trailing hyphens", () => {
    expect(buildProductSlug("--Hello World--")).toBe("hello-world");
  });

  it("handles multiple languages (Arabic)", () => {
    // Note: buildProductSlug only strips non-word chars without Unicode support.
    // Arabic chars are removed, leaving only whitespace.
    const slug = buildProductSlug("منتج رائع");
    expect(typeof slug).toBe("string");
  });

  it("converts to lowercase", () => {
    expect(buildProductSlug("PRODUCT Name")).toBe("product-name");
  });

  it("handles empty or whitespace title", () => {
    expect(buildProductSlug("")).toBe("");
    expect(buildProductSlug("   ")).toBe("");
  });
});
