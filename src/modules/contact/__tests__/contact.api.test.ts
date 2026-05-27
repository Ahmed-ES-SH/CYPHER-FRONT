import { describe, it, expect } from "vitest";
import {
  validateContactDraft,
  sanitizeContactDraft,
  normalizeSortField,
  normalizeOrder,
  buildContactQueryParams,
  normalizeContactError,
  parseValidationErrors,
  toContactMessage,
  contactKeys,
} from "../contact.api";
import type { CreateContactMessageDto } from "../contact.types";

/* =========================================================
   sanitizeContactDraft
   ========================================================= */

describe("sanitizeContactDraft", () => {
  it("trims whitespace from all fields", () => {
    const input: CreateContactMessageDto = {
      fullName: "  John  Doe  ",
      email: "  john@test.com  ",
      subject: "  Hello  ",
      message: "  Test message  ",
    };
    const result = sanitizeContactDraft(input);
    expect(result.fullName).toBe("John  Doe");
    expect(result.email).toBe("john@test.com");
    expect(result.subject).toBe("Hello");
    expect(result.message).toBe("Test message");
  });

  it("preserves internal line breaks in message", () => {
    const input: CreateContactMessageDto = {
      fullName: "John",
      email: "john@test.com",
      subject: "Test",
      message: "Line1\n\nLine3\n  indented",
    };
    const result = sanitizeContactDraft(input);
    expect(result.message).toBe("Line1\n\nLine3\n  indented");
  });

  it("does not fail on already-clean input", () => {
    const input: CreateContactMessageDto = {
      fullName: "John",
      email: "john@test.com",
      subject: "Test",
      message: "Hello world",
    };
    expect(sanitizeContactDraft(input)).toEqual(input);
  });
});

/* =========================================================
   validateContactDraft
   ========================================================= */

describe("validateContactDraft", () => {
  const valid: CreateContactMessageDto = {
    fullName: "John Doe",
    email: "john@test.com",
    subject: "Test Subject",
    message: "This is a test message with enough length",
  };

  it("returns empty errors for valid input", () => {
    expect(validateContactDraft(valid)).toEqual({});
  });

  it("requires fullName", () => {
    const errs = validateContactDraft({ ...valid, fullName: "" });
    expect(errs.fullName).toBeDefined();
  });

  it("rejects fullName exceeding 100 chars", () => {
    const errs = validateContactDraft({
      ...valid,
      fullName: "A".repeat(101),
    });
    expect(errs.fullName).toContain("100");
  });

  it("requires email", () => {
    const errs = validateContactDraft({ ...valid, email: "" });
    expect(errs.email).toBeDefined();
  });

  it("rejects invalid email format", () => {
    const errs = validateContactDraft({ ...valid, email: "not-an-email" });
    expect(errs.email).toContain("Invalid email");
  });

  it("rejects email exceeding 255 chars", () => {
    const errs = validateContactDraft({
      ...valid,
      email: "a@b" + "c".repeat(255),
    });
    expect(errs.email).toContain("255");
  });

  it("requires subject", () => {
    const errs = validateContactDraft({ ...valid, subject: "" });
    expect(errs.subject).toBeDefined();
  });

  it("rejects subject exceeding 200 chars", () => {
    const errs = validateContactDraft({
      ...valid,
      subject: "A".repeat(201),
    });
    expect(errs.subject).toContain("200");
  });

  it("requires message", () => {
    const errs = validateContactDraft({ ...valid, message: "" });
    expect(errs.message).toBeDefined();
  });

  it("rejects message shorter than 10 chars", () => {
    const errs = validateContactDraft({ ...valid, message: "Short" });
    expect(errs.message).toContain("10");
  });

  it("rejects message exceeding 5000 chars", () => {
    const errs = validateContactDraft({
      ...valid,
      message: "A".repeat(5001),
    });
    expect(errs.message).toContain("5000");
  });

  it("returns multiple validation errors at once", () => {
    const errs = validateContactDraft({
      fullName: "",
      email: "",
      subject: "",
      message: "",
    });
    expect(Object.keys(errs)).toHaveLength(4);
  });

  it("trims before validating", () => {
    const errs = validateContactDraft({ ...valid, fullName: "   " });
    expect(errs.fullName).toBeDefined();
  });

  it("accepts message with exactly 10 chars after trim", () => {
    const errs = validateContactDraft({
      ...valid,
      message: "ExactlyTen",
    });
    expect(errs.message).toBeUndefined();
  });
});

/* =========================================================
   normalizeSortField
   ========================================================= */

describe("normalizeSortField", () => {
  it("passes valid sort fields through", () => {
    expect(normalizeSortField("createdAt")).toBe("createdAt");
    expect(normalizeSortField("updatedAt")).toBe("updatedAt");
    expect(normalizeSortField("fullName")).toBe("fullName");
    expect(normalizeSortField("email")).toBe("email");
    expect(normalizeSortField("subject")).toBe("subject");
    expect(normalizeSortField("isRead")).toBe("isRead");
  });

  it("falls back to createdAt for unknown fields", () => {
    expect(normalizeSortField("invalid")).toBe("createdAt");
  });

  it("falls back to createdAt for undefined", () => {
    expect(normalizeSortField(undefined)).toBe("createdAt");
  });
});

/* =========================================================
   normalizeOrder
   ========================================================= */

describe("normalizeOrder", () => {
  it("passes ASC through", () => {
    expect(normalizeOrder("ASC")).toBe("ASC");
  });

  it("falls back to DESC for anything else", () => {
    expect(normalizeOrder("DESC")).toBe("DESC");
    expect(normalizeOrder("asc")).toBe("DESC");
    expect(normalizeOrder("")).toBe("DESC");
    expect(normalizeOrder(undefined)).toBe("DESC");
  });
});

/* =========================================================
   buildContactQueryParams
   ========================================================= */

describe("buildContactQueryParams", () => {
  it("returns default params when given empty object", () => {
    const qs = buildContactQueryParams({});
    expect(qs).toContain("page=1");
    expect(qs).toContain("limit=20");
    expect(qs).toContain("sortBy=createdAt");
    expect(qs).toContain("order=DESC");
  });

  it("clamps page to minimum 1", () => {
    const qs = buildContactQueryParams({ page: 0 });
    expect(qs).toContain("page=1");
  });

  it("clamps limit between 1 and 100", () => {
    const qs1 = buildContactQueryParams({ limit: 0 });
    expect(qs1).toContain("limit=1");

    const qs2 = buildContactQueryParams({ limit: 999 });
    expect(qs2).toContain("limit=100");
  });

  it("includes isRead filter when provided", () => {
    const qs = buildContactQueryParams({ isRead: true });
    expect(qs).toContain("isRead=true");
  });

  it("omits isRead filter when undefined", () => {
    const qs = buildContactQueryParams({});
    expect(qs).not.toContain("isRead");
  });

  it("includes all custom params", () => {
    const qs = buildContactQueryParams({
      page: 2,
      limit: 10,
      sortBy: "email",
      order: "ASC",
      isRead: false,
    });
    expect(qs).toContain("page=2");
    expect(qs).toContain("limit=10");
    expect(qs).toContain("sortBy=email");
    expect(qs).toContain("order=ASC");
    expect(qs).toContain("isRead=false");
  });
});

/* =========================================================
   normalizeContactError
   ========================================================= */

describe("normalizeContactError", () => {
  it("extracts message and status from structured error", () => {
    const result = normalizeContactError({
      message: "Not found",
      status: 404,
    });
    expect(result).toEqual({ message: "Not found", status: 404 });
  });

  it("extracts nested errors when present", () => {
    const result = normalizeContactError({
      message: "Validation failed",
      status: 422,
      errors: { email: ["Email is required"] },
    });
    expect(result.errors?.email).toEqual(["Email is required"]);
  });

  it("returns defaults for null", () => {
    const result = normalizeContactError(null);
    expect(result).toEqual({
      message: "An unexpected error occurred",
      status: 500,
    });
  });

  it("returns defaults for undefined", () => {
    const result = normalizeContactError(undefined);
    expect(result).toEqual({
      message: "An unexpected error occurred",
      status: 500,
    });
  });

  it("handles Error instances", () => {
    const result = normalizeContactError(new Error("Something broke"));
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
      fullName: ["Full name is required", "Too short"],
      email: ["Invalid email"],
    });
    expect(result).toEqual({
      fullName: "Full name is required",
      email: "Invalid email",
    });
  });

  it("returns empty object when no errors", () => {
    expect(parseValidationErrors(undefined)).toEqual({});
    expect(parseValidationErrors({})).toEqual({});
  });

  it("handles empty arrays with fallback message", () => {
    const result = parseValidationErrors({ message: [] });
    expect(result.message).toBe("Invalid value");
  });
});

/* =========================================================
   toContactMessage
   ========================================================= */

describe("toContactMessage", () => {
  it("maps camelCase API response", () => {
    const raw = {
      id: "msg-1",
      fullName: "John Doe",
      email: "john@test.com",
      subject: "Help",
      message: "Need assistance",
      isRead: false,
      repliedAt: null,
      ipAddress: "127.0.0.1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };
    expect(toContactMessage(raw)).toEqual(raw);
  });

  it("maps snake_case API response", () => {
    const raw = {
      id: "msg-2",
      full_name: "Jane Doe",
      email: "jane@test.com",
      subject: "Bug Report",
      message: "Found a bug",
      is_read: true,
      replied_at: "2026-01-03T00:00:00.000Z",
      ip_address: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    };
    const result = toContactMessage(raw);
    expect(result.fullName).toBe("Jane Doe");
    expect(result.isRead).toBe(true);
    expect(result.repliedAt).toBe("2026-01-03T00:00:00.000Z");
    expect(result.ipAddress).toBeNull();
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("defaults missing optional fields", () => {
    const raw = {
      id: "msg-3",
      email: "test@test.com",
      subject: "Test",
      message: "Hello",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const result = toContactMessage(raw);
    expect(result.fullName).toBe("");
    expect(result.isRead).toBe(false);
    expect(result.repliedAt).toBeNull();
    expect(result.ipAddress).toBeNull();
  });
});

/* =========================================================
   contactKeys (determinism)
   ========================================================= */

describe("contactKeys", () => {
  it("produces stable list keys for same params", () => {
    const params = { page: 1, limit: 20, isRead: false, sortBy: "createdAt" as const, order: "DESC" as const };
    const key1 = contactKeys.list(params);
    const key2 = contactKeys.list({ ...params });
    expect(key1).toEqual(key2);
  });

  it("produces all, list, and detail prefixes", () => {
    expect(contactKeys.all).toEqual(["contact"]);
    expect(contactKeys.lists()).toEqual(["contact", "list"]);
    expect(contactKeys.details()).toEqual(["contact", "detail"]);
    expect(contactKeys.mutations()).toEqual(["contact", "mutations"]);
  });

  it("includes normalized params in list keys", () => {
    const key = contactKeys.list({ page: 1, limit: 20 });
    expect(key[0]).toBe("contact");
    expect(key[1]).toBe("list");
    expect(typeof key[2]).toBe("object");
  });

  it("produces detail key with id", () => {
    expect(contactKeys.detail("msg-1")).toEqual(["contact", "detail", "msg-1"]);
  });
});
