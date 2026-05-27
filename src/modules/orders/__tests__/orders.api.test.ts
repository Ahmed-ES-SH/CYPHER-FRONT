import { describe, it, expect } from "vitest";
import {
  validateCreateOrderDto,
  normalizeSortField,
  normalizeOrder,
  buildOrderQueryParams,
  normalizeOrderError,
  parseValidationErrors,
  canTransitionStatus,
  toOrder,
  toOrderItem,
  toShippingAddress,
  orderKeys,
  ORDER_LIMITS,
} from "../orders.api";
import { OrderStatus, PaymentStatus } from "../orders.types";
import type { CreateOrderDto } from "../orders.types";

describe("validateCreateOrderDto", () => {
  const valid: CreateOrderDto = {
    items: [{ productId: "prod-1", quantity: 2 }],
    shippingAddress: {
      fullName: "John Doe",
      addressLine1: "123 Main St",
      city: "New York",
      postalCode: "10001",
      country: "US",
    },
  };

  it("returns empty errors for valid input", () => {
    expect(validateCreateOrderDto(valid)).toEqual({});
  });

  it("requires at least one item", () => {
    const errs = validateCreateOrderDto({ ...valid, items: [] });
    expect(errs.items).toBeDefined();
  });

  it("requires items array", () => {
    const errs = validateCreateOrderDto({ ...valid, items: [] as any });
    expect(errs.items).toBeDefined();
  });

  it("validates each item has productId", () => {
    const errs = validateCreateOrderDto({
      ...valid,
      items: [{ productId: "", quantity: 1 }],
    });
    expect(errs["items.0.productId"]).toBeDefined();
  });

  it("validates each item has quantity >= 1", () => {
    const errs = validateCreateOrderDto({
      ...valid,
      items: [{ productId: "prod-1", quantity: 0 }],
    });
    expect(errs["items.0.quantity"]).toBeDefined();
  });

  it("requires shipping address", () => {
    const errs = validateCreateOrderDto({ ...valid, shippingAddress: null as any });
    expect(errs.shippingAddress).toBeDefined();
  });

  it("validates shipping address fields", () => {
    const errs = validateCreateOrderDto({
      ...valid,
      shippingAddress: { fullName: "", addressLine1: "", city: "", postalCode: "", country: "" },
    });
    expect(errs["shippingAddress.fullName"]).toBeDefined();
    expect(errs["shippingAddress.addressLine1"]).toBeDefined();
    expect(errs["shippingAddress.city"]).toBeDefined();
    expect(errs["shippingAddress.postalCode"]).toBeDefined();
    expect(errs["shippingAddress.country"]).toBeDefined();
  });

  it("validates notes length", () => {
    const errs = validateCreateOrderDto({
      ...valid,
      notes: "A".repeat(ORDER_LIMITS.NOTES_MAX + 1),
    });
    expect(errs.notes).toContain(String(ORDER_LIMITS.NOTES_MAX));
  });
});

describe("canTransitionStatus", () => {
  it("allows pending -> confirmed", () => {
    expect(canTransitionStatus(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true);
  });

  it("allows pending -> cancelled", () => {
    expect(canTransitionStatus(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);
  });

  it("allows confirmed -> processing", () => {
    expect(canTransitionStatus(OrderStatus.CONFIRMED, OrderStatus.PROCESSING)).toBe(true);
  });

  it("allows processing -> shipped", () => {
    expect(canTransitionStatus(OrderStatus.PROCESSING, OrderStatus.SHIPPED)).toBe(true);
  });

  it("allows shipped -> delivered", () => {
    expect(canTransitionStatus(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(true);
  });

  it("allows delivered -> refunded", () => {
    expect(canTransitionStatus(OrderStatus.DELIVERED, OrderStatus.REFUNDED)).toBe(true);
  });

  it("disallows pending -> delivered (skip)", () => {
    expect(canTransitionStatus(OrderStatus.PENDING, OrderStatus.DELIVERED)).toBe(false);
  });

  it("disallows cancelled -> any", () => {
    expect(canTransitionStatus(OrderStatus.CANCELLED, OrderStatus.PENDING)).toBe(false);
    expect(canTransitionStatus(OrderStatus.CANCELLED, OrderStatus.PROCESSING)).toBe(false);
  });

  it("disallows refunded -> any", () => {
    expect(canTransitionStatus(OrderStatus.REFUNDED, OrderStatus.PENDING)).toBe(false);
  });
});

describe("normalizeSortField", () => {
  it("passes valid sort fields through", () => {
    expect(normalizeSortField("createdAt")).toBe("createdAt");
    expect(normalizeSortField("updatedAt")).toBe("updatedAt");
    expect(normalizeSortField("total")).toBe("total");
    expect(normalizeSortField("status")).toBe("status");
    expect(normalizeSortField("orderNumber")).toBe("orderNumber");
  });

  it("falls back to createdAt for unknown fields", () => {
    expect(normalizeSortField("invalid")).toBe("createdAt");
  });

  it("falls back to createdAt for undefined", () => {
    expect(normalizeSortField(undefined)).toBe("createdAt");
  });
});

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

describe("buildOrderQueryParams", () => {
  it("returns default params when given empty object", () => {
    const qs = buildOrderQueryParams({});
    expect(qs).toContain("page=1");
    expect(qs).toContain("limit=20");
    expect(qs).toContain("sortBy=createdAt");
    expect(qs).toContain("order=DESC");
  });

  it("clamps page to minimum 1", () => {
    const qs = buildOrderQueryParams({ page: 0 });
    expect(qs).toContain("page=1");
  });

  it("clamps limit between 1 and 100", () => {
    const qs1 = buildOrderQueryParams({ limit: 0 });
    expect(qs1).toContain("limit=1");

    const qs2 = buildOrderQueryParams({ limit: 999 });
    expect(qs2).toContain("limit=100");
  });

  it("includes optional filters when provided", () => {
    const qs = buildOrderQueryParams({
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAID,
      search: "test",
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
    });
    expect(qs).toContain("status=pending");
    expect(qs).toContain("paymentStatus=paid");
    expect(qs).toContain("search=test");
    expect(qs).toContain("dateFrom=2026-01-01");
    expect(qs).toContain("dateTo=2026-12-31");
  });
});

describe("normalizeOrderError", () => {
  it("extracts message and status from structured error", () => {
    const result = normalizeOrderError({ message: "Not found", status: 404 });
    expect(result).toEqual({ message: "Not found", status: 404 });
  });

  it("extracts nested errors when present", () => {
    const result = normalizeOrderError({
      message: "Validation failed",
      status: 422,
      errors: { items: ["At least one item required"] },
    });
    expect(result.errors?.items).toEqual(["At least one item required"]);
  });

  it("returns defaults for null", () => {
    const result = normalizeOrderError(null);
    expect(result).toEqual({ message: "An unexpected error occurred", status: 500 });
  });

  it("returns defaults for undefined", () => {
    const result = normalizeOrderError(undefined);
    expect(result).toEqual({ message: "An unexpected error occurred", status: 500 });
  });

  it("handles Error instances", () => {
    const result = normalizeOrderError(new Error("Something broke"));
    expect(result.message).toBe("Something broke");
    expect(result.status).toBe(500);
  });
});

describe("parseValidationErrors", () => {
  it("converts field arrays to first-message map", () => {
    const result = parseValidationErrors({
      items: ["At least one item required"],
      "shippingAddress.city": ["City is required"],
    });
    expect(result).toEqual({
      items: "At least one item required",
      "shippingAddress.city": "City is required",
    });
  });

  it("returns empty object when no errors", () => {
    expect(parseValidationErrors(undefined)).toEqual({});
    expect(parseValidationErrors({})).toEqual({});
  });

  it("handles empty arrays with fallback message", () => {
    const result = parseValidationErrors({ items: [] });
    expect(result.items).toBe("Invalid value");
  });
});

describe("toOrderItem", () => {
  it("maps camelCase API response", () => {
    const raw = {
      id: "item-1",
      productId: "prod-1",
      productName: "Test Product",
      productSlug: "test-product",
      productImage: "/images/test.jpg",
      unitPrice: { amount: 2999, currency: "usd" },
      quantity: 2,
      subtotal: { amount: 5998, currency: "usd" },
    };
    const result = toOrderItem(raw);
    expect(result.productName).toBe("Test Product");
    expect(result.unitPrice.amount).toBe(2999);
    expect(result.quantity).toBe(2);
  });

  it("maps snake_case API response", () => {
    const raw = {
      id: "item-2",
      product_id: "prod-2",
      product_name: "Another Product",
      product_slug: "another-product",
      product_image: "/images/another.jpg",
      unit_price: { amount: 1999, currency: "usd" },
      quantity: 1,
      subtotal: { amount: 1999, currency: "usd" },
    };
    const result = toOrderItem(raw);
    expect(result.productName).toBe("Another Product");
    expect(result.unitPrice.amount).toBe(1999);
    expect(result.quantity).toBe(1);
  });

  it("handles flat price/subtotal", () => {
    const raw = {
      id: "item-3",
      productId: "prod-3",
      productName: "Flat",
      productSlug: "flat",
      productImage: "",
      price: 999,
      quantity: 3,
      subtotal: 2997,
    };
    const result = toOrderItem(raw);
    expect(result.unitPrice.amount).toBe(999);
    expect(result.subtotal.amount).toBe(2997);
  });
});

describe("toShippingAddress", () => {
  it("maps camelCase", () => {
    const raw = {
      fullName: "John Doe",
      addressLine1: "123 Main St",
      addressLine2: "Apt 4",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "US",
      phone: "+1234567890",
    };
    const result = toShippingAddress(raw);
    expect(result.fullName).toBe("John Doe");
    expect(result.addressLine2).toBe("Apt 4");
    expect(result.state).toBe("NY");
    expect(result.phone).toBe("+1234567890");
  });

  it("maps snake_case", () => {
    const raw = {
      full_name: "Jane Doe",
      address_line1: "456 Oak Ave",
      city: "Los Angeles",
      postal_code: "90001",
      country: "US",
    };
    const result = toShippingAddress(raw);
    expect(result.fullName).toBe("Jane Doe");
    expect(result.city).toBe("Los Angeles");
  });

  it("defaults missing optional fields", () => {
    const result = toShippingAddress({});
    expect(result.fullName).toBe("");
    expect(result.addressLine2).toBeUndefined();
    expect(result.state).toBeUndefined();
    expect(result.phone).toBeUndefined();
  });
});

describe("toOrder", () => {
  it("maps a full camelCase API response", () => {
    const raw = {
      id: "ord-1",
      orderNumber: "ORD-001",
      userId: "usr-1",
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          productName: "Test",
          productSlug: "test",
          productImage: "",
          unitPrice: { amount: 1000, currency: "usd" },
          quantity: 1,
          subtotal: { amount: 1000, currency: "usd" },
        },
      ],
      subtotal: { amount: 1000, currency: "usd" },
      shippingCost: { amount: 500, currency: "usd" },
      tax: { amount: 100, currency: "usd" },
      total: { amount: 1600, currency: "usd" },
      currency: "usd",
      status: "pending",
      paymentStatus: "pending",
      shippingAddress: { fullName: "John", addressLine1: "123 St", city: "NY", postalCode: "10001", country: "US" },
      notes: "Leave at door",
      couponCode: "SAVE10",
      discountAmount: { amount: 100, currency: "usd" },
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    };
    const result = toOrder(raw);
    expect(result.orderNumber).toBe("ORD-001");
    expect(result.items).toHaveLength(1);
    expect(result.total.amount).toBe(1600);
    expect(result.status).toBe("pending");
    expect(result.paymentStatus).toBe("pending");
    expect(result.notes).toBe("Leave at door");
    expect(result.couponCode).toBe("SAVE10");
    expect(result.discountAmount?.amount).toBe(100);
  });

  it("maps flat total/subtotal", () => {
    const raw = {
      id: "ord-2",
      userId: "usr-2",
      items: [],
      subtotal: 2000,
      shippingCost: 0,
      tax: 0,
      total: 2000,
      currency: "usd",
      status: "confirmed",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const result = toOrder(raw);
    expect(result.subtotal.amount).toBe(2000);
    expect(result.total.amount).toBe(2000);
    expect(result.status).toBe("confirmed");
  });
});

describe("orderKeys", () => {
  it("produces stable list keys for same params", () => {
    const params = { page: 1, limit: 20, sortBy: "createdAt" as const, order: "DESC" as const };
    const key1 = orderKeys.list(params);
    const key2 = orderKeys.list({ ...params });
    expect(key1).toEqual(key2);
  });

  it("produces all, list, detail, and stats prefixes", () => {
    expect(orderKeys.all).toEqual(["orders"]);
    expect(orderKeys.lists()).toEqual(["orders", "list"]);
    expect(orderKeys.details()).toEqual(["orders", "detail"]);
    expect(orderKeys.stats()).toEqual(["orders", "stats"]);
  });

  it("includes normalized params in list keys", () => {
    const key = orderKeys.list({ page: 1, limit: 20 });
    expect(key[0]).toBe("orders");
    expect(key[1]).toBe("list");
    expect(typeof key[2]).toBe("object");
  });

  it("produces detail key with id", () => {
    expect(orderKeys.detail("ord-1")).toEqual(["orders", "detail", "ord-1"]);
  });

  it("produces user orders key", () => {
    expect(orderKeys.userOrders("usr-1")).toEqual(["orders", "user", "usr-1"]);
  });
});
