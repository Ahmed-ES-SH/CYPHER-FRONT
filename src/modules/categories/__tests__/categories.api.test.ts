import { describe, it, expect } from "vitest";
import {
  normalizeSlug,
  buildQueryString,
  parseApiError,
  parseValidationErrors,
  toCategory,
  toCategoryDetails,
} from "../categories.api";

/* =========================================================
   normalizeSlug
   ========================================================= */

describe("normalizeSlug", () => {
  it("lowercases and hyphenates basic strings", () => {
    expect(normalizeSlug("Hello World")).toBe("hello-world");
  });

  it("trims whitespace", () => {
    expect(normalizeSlug("  Hello World  ")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(normalizeSlug("Hello   World---Test")).toBe("hello-world-test");
  });

  it("removes leading and trailing hyphens", () => {
    expect(normalizeSlug("-hello-world-")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(normalizeSlug("hello!@#$%^&*()world")).toBe("helloworld");
  });

  it("preserves Arabic characters", () => {
    expect(normalizeSlug("مرحبا بالعالم")).toBe("مرحبا-بالعالم");
  });

  it("handles empty string", () => {
    expect(normalizeSlug("")).toBe("");
  });

  it("handles single word", () => {
    expect(normalizeSlug("Hello")).toBe("hello");
  });
});

/* =========================================================
   buildQueryString
   ========================================================= */

describe("buildQueryString", () => {
  it("returns empty string when no filters provided", () => {
    expect(buildQueryString({})).toBe("");
  });

  it("builds query string with page and limit", () => {
    expect(buildQueryString({ page: 2, limit: 10 })).toBe("?page=2&limit=10");
  });

  it("includes search param", () => {
    expect(buildQueryString({ search: "test" })).toBe("?search=test");
  });

  it("includes sort params", () => {
    expect(
      buildQueryString({ sortBy: "name", sortOrder: "ASC" }),
    ).toBe("?sortBy=name&sortOrder=ASC");
  });

  it("clamps page to minimum 1", () => {
    expect(buildQueryString({ page: 0 })).toBe("");
  });

  it("clamps limit to valid range", () => {
    expect(buildQueryString({ limit: 0 })).toBe("");
    expect(buildQueryString({ limit: 101 })).toBe("");
  });

  it("includes all params together", () => {
    const qs = buildQueryString({
      page: 1,
      limit: 20,
      search: "electronics",
      sortBy: "createdAt",
      sortOrder: "DESC",
    });
    expect(qs).toBe(
      "?page=1&limit=20&search=electronics&sortBy=createdAt&sortOrder=DESC",
    );
  });
});

/* =========================================================
   parseApiError
   ========================================================= */

describe("parseApiError", () => {
  it("extracts message and status from structured error", () => {
    const result = parseApiError({
      message: "Not found",
      status: 404,
    });
    expect(result).toEqual({ message: "Not found", status: 404 });
  });

  it("extracts nested errors when present", () => {
    const result = parseApiError({
      message: "Validation failed",
      status: 422,
      errors: { name: ["Name is required"] },
    });
    expect(result.errors?.name).toEqual(["Name is required"]);
  });

  it("returns defaults for unknown error shapes", () => {
    const result = parseApiError(null);
    expect(result).toEqual({
      message: "An unexpected error occurred",
      status: 500,
    });
  });

  it("returns defaults for undefined", () => {
    const result = parseApiError(undefined);
    expect(result).toEqual({
      message: "An unexpected error occurred",
      status: 500,
    });
  });

  it("handles Error instances", () => {
    const result = parseApiError(new Error("Something broke"));
    expect(result.message).toBe("Something broke");
    expect(result.status).toBe(500);
  });
});

/* =========================================================
   parseValidationErrors
   ========================================================= */

describe("parseValidationErrors", () => {
  it("converts field arrays to first-message map", () => {
    const result = parseValidationErrors({
      name: ["Name is required", "Name is too short"],
      slug: ["Slug must be unique"],
    });
    expect(result).toEqual({
      name: "Name is required",
      slug: "Slug must be unique",
    });
  });

  it("returns empty object when no errors", () => {
    expect(parseValidationErrors(undefined)).toEqual({});
    expect(parseValidationErrors({})).toEqual({});
  });

  it("handles empty arrays with fallback message", () => {
    const result = parseValidationErrors({ name: [] });
    expect(result.name).toBe("Invalid value");
  });
});

/* =========================================================
   toCategory / toCategoryDetails
   ========================================================= */

describe("toCategory", () => {
  it("maps raw API object to Category", () => {
    const raw = {
      id: "cat-1",
      name: "Electronics",
      slug: "electronics",
      description: "All electronics",
      color: "#ff0000",
      icon: "laptop",
      order: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };
    expect(toCategory(raw)).toEqual(raw);
  });

  it("coerces null description", () => {
    const raw = {
      id: "cat-2",
      name: "No Desc",
      slug: "no-desc",
      description: null,
      color: null,
      icon: null,
      order: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    expect(toCategory(raw)).toEqual(raw);
  });

  it("handles missing optional fields", () => {
    const raw = {
      id: "cat-3",
      name: "Minimal",
      slug: "minimal",
      order: 2,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const result = toCategory(raw);
    expect(result.description).toBeNull();
    expect(result.color).toBeNull();
    expect(result.icon).toBeNull();
  });
});

describe("toCategoryDetails", () => {
  it("maps raw object with parentId and children", () => {
    const raw = {
      id: "cat-1",
      name: "Parent",
      slug: "parent",
      description: null,
      color: null,
      icon: null,
      order: 0,
      parentId: null,
      children: [
        {
          id: "cat-2",
          name: "Child",
          slug: "child",
          description: "A child category",
          color: "#00ff00",
          icon: null,
          order: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const result = toCategoryDetails(raw);
    expect(result.parentId).toBeNull();
    expect(result.children).toHaveLength(1);
    expect(result.children[0].name).toBe("Child");
  });

  it("defaults missing children to empty array", () => {
    const raw = {
      id: "cat-1",
      name: "No Children",
      slug: "no-children",
      description: null,
      color: null,
      icon: null,
      order: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const result = toCategoryDetails(raw);
    expect(result.children).toEqual([]);
  });

  it("handles null or invalid objects gracefully", () => {
    const result = toCategoryDetails(null);
    expect(result.id).toBe("");
    expect(result.name).toBe("Unknown Category");
    expect(result.children).toEqual([]);
  });
});

/* =========================================================
   CategoryApiError
   ========================================================= */

import { CategoryApiError } from "../categories.types";

describe("CategoryApiError", () => {
  it("creates an Error instance with proper properties", () => {
    const err = new CategoryApiError("Conflict", 409, { name: ["Duplicate name"] });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("CategoryApiError");
    expect(err.message).toBe("Conflict");
    expect(err.status).toBe(409);
    expect(err.errors?.name).toEqual(["Duplicate name"]);
  });
});
