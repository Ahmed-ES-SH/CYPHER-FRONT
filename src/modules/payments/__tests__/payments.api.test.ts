import { describe, it, expect } from "vitest";
import {
  validatePaymentConfig,
  normalizeSortField,
  normalizeOrder,
  buildPaymentQueryParams,
  parseValidationErrors,
  toPaymentTransaction,
  toPaymentHistoryItem,
} from "../api/payments.api";
import { normalizePaymentError } from "../utils/normalizePaymentError";
import { paymentKeys } from "../constants/payments.keys";
import { PaymentMethod, PaymentStatus } from "../types/payments.types";

describe("validatePaymentConfig", () => {
  it("returns empty errors for valid config", () => {
    const errs = validatePaymentConfig({
      publishableKey: "pk_test_123",
      currency: "usd",
      minAmount: 50,
      maxAmount: 99999999,
    });
    expect(errs).toEqual({});
  });

  it("requires publishableKey", () => {
    const errs = validatePaymentConfig({});
    expect(errs.publishableKey).toBeDefined();
  });

  it("rejects invalid currency format", () => {
    const errs = validatePaymentConfig({ publishableKey: "pk", currency: "US Dollars" });
    expect(errs.currency).toContain("3-letter");
  });

  it("rejects minAmount below minimum", () => {
    const errs = validatePaymentConfig({ publishableKey: "pk", minAmount: 1 });
    expect(errs.minAmount).toContain("50");
  });

  it("rejects maxAmount above maximum", () => {
    const errs = validatePaymentConfig({ publishableKey: "pk", maxAmount: 999999999 });
    expect(errs.maxAmount).toContain("99999999");
  });

  it("rejects maxAmount less than minAmount", () => {
    const errs = validatePaymentConfig({
      publishableKey: "pk",
      minAmount: 1000,
      maxAmount: 100,
    });
    expect(errs.maxAmount).toContain("greater than");
  });
});

describe("normalizeSortField", () => {
  it("passes valid sort fields through", () => {
    expect(normalizeSortField("createdAt")).toBe("createdAt");
    expect(normalizeSortField("amount")).toBe("amount");
    expect(normalizeSortField("status")).toBe("status");
    expect(normalizeSortField("method")).toBe("method");
  });

  it("falls back to createdAt for unknown fields", () => {
    expect(normalizeSortField("invalid")).toBe("createdAt");
    expect(normalizeSortField(undefined)).toBe("createdAt");
  });
});

describe("normalizeOrder", () => {
  it("passes ASC through", () => {
    expect(normalizeOrder("ASC")).toBe("ASC");
  });

  it("falls back to DESC", () => {
    expect(normalizeOrder("DESC")).toBe("DESC");
    expect(normalizeOrder("asc")).toBe("DESC");
    expect(normalizeOrder(undefined)).toBe("DESC");
  });
});

describe("buildPaymentQueryParams", () => {
  it("returns default params for empty object", () => {
    const qs = buildPaymentQueryParams({});
    expect(qs).toContain("page=1");
    expect(qs).toContain("limit=20");
    expect(qs).toContain("sortBy=createdAt");
    expect(qs).toContain("order=DESC");
  });

  it("includes optional filters", () => {
    const qs = buildPaymentQueryParams({
      status: PaymentStatus.SUCCEEDED,
      method: PaymentMethod.STRIPE,
      dateFrom: "2026-01-01",
    });
    expect(qs).toContain("status=succeeded");
    expect(qs).toContain("method=stripe");
    expect(qs).toContain("dateFrom=2026-01-01");
  });
});

describe("normalizePaymentError", () => {
  it("extracts message and status from raw error", () => {
    const result = normalizePaymentError({ message: "Failed", status: 402 });
    expect(result).toMatchObject({ message: "Failed", status: 402 });
    expect(result.code).toBeDefined();
    expect(result.retryable).toBeDefined();
  });

  it("returns defaults for null", () => {
    const result = normalizePaymentError(null);
    expect(result.message).toBeDefined();
    expect(result.status).toBe(500);
    expect(result.code).toBeDefined();
  });
});

describe("parseValidationErrors", () => {
  it("converts field arrays to first-message map", () => {
    const result = parseValidationErrors({
      publishableKey: ["Key is required"],
    });
    expect(result).toEqual({ publishableKey: "Key is required" });
  });

  it("returns empty object when no errors", () => {
    expect(parseValidationErrors(undefined)).toEqual({});
  });
});

describe("toPaymentTransaction", () => {
  it("maps camelCase API response", () => {
    const raw = {
      id: "txn-1",
      orderId: "ord-1",
      orderNumber: "ORD-001",
      method: "stripe",
      status: "succeeded",
      amount: { amount: 5000, currency: "usd" },
      fee: { amount: 150, currency: "usd" },
      netAmount: { amount: 4850, currency: "usd" },
      stripePaymentIntentId: "pi_123",
      stripeClientSecret: "secret_123",
      description: "Payment for order ORD-001",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const result = toPaymentTransaction(raw);
    expect(result.orderNumber).toBe("ORD-001");
    expect(result.amount.amount).toBe(5000);
    expect(result.status).toBe("succeeded");
    expect(result.stripePaymentIntentId).toBe("pi_123");
  });

  it("maps snake_case and flat values", () => {
    const raw = {
      id: "txn-2",
      order_id: "ord-2",
      order_number: "ORD-002",
      method: "paypal",
      status: "pending",
      amount: 2500,
      currency: "usd",
      fee: 0,
      net_amount: 2500,
      created_at: "2026-02-01T00:00:00.000Z",
      updated_at: "2026-02-01T00:00:00.000Z",
    };
    const result = toPaymentTransaction(raw);
    expect(result.orderNumber).toBe("ORD-002");
    expect(result.amount.amount).toBe(2500);
    expect(result.netAmount.amount).toBe(2500);
  });
});

describe("toPaymentHistoryItem", () => {
  it("maps API response", () => {
    const raw = {
      id: "hist-1",
      orderId: "ord-1",
      orderNumber: "ORD-001",
      method: "stripe",
      status: "succeeded",
      amount: { amount: 5000, currency: "usd" },
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const result = toPaymentHistoryItem(raw);
    expect(result.orderNumber).toBe("ORD-001");
    expect(result.amount.amount).toBe(5000);
  });
});

describe("paymentKeys", () => {
  it("produces stable list keys", () => {
    const params = { page: 1, limit: 20, sortBy: "createdAt" as const, order: "DESC" as const };
    const key1 = paymentKeys.list(params);
    const key2 = paymentKeys.list({ ...params });
    expect(key1).toEqual(key2);
  });

  it("produces all, list, detail, config, methods prefixes", () => {
    expect(paymentKeys.all).toEqual(["payments"]);
    expect(paymentKeys.lists()).toEqual(["payments", "list"]);
    expect(paymentKeys.details()).toEqual(["payments", "detail"]);
    expect(paymentKeys.config()).toEqual(["payments", "config"]);
    expect(paymentKeys.methods()).toEqual(["payments", "methods"]);
  });

  it("produces detail key with id", () => {
    expect(paymentKeys.detail("txn-1")).toEqual(["payments", "detail", "txn-1"]);
  });
});
