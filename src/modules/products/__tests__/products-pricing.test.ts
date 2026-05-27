import { describe, it, expect } from "vitest";
import {
  roundPrice,
  calculateDiscountedPrice,
  deriveAvailabilityStatus,
} from "../transformers/product-pricing";

/* =========================================================
   roundPrice
   ========================================================= */

describe("roundPrice", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundPrice(10.456)).toBe(10.46);
    expect(roundPrice(10.454)).toBe(10.45);
  });

  it("passes whole numbers through", () => {
    expect(roundPrice(10)).toBe(10);
    expect(roundPrice(0)).toBe(0);
  });

  it("handles negative values", () => {
    expect(roundPrice(-5.678)).toBe(-5.68);
  });
});

/* =========================================================
   calculateDiscountedPrice
   ========================================================= */

describe("calculateDiscountedPrice", () => {
  it("applies discount percentage correctly", () => {
    expect(calculateDiscountedPrice(100, 20)).toBe(80);
    expect(calculateDiscountedPrice(50, 10)).toBe(45);
  });

  it("returns full price when discount is 0", () => {
    expect(calculateDiscountedPrice(100, 0)).toBe(100);
  });

  it("returns full price when discount is negative", () => {
    expect(calculateDiscountedPrice(100, -10)).toBe(100);
  });

  it("handles 100% discount", () => {
    expect(calculateDiscountedPrice(100, 100)).toBe(0);
  });

  it("rounds result to 2 decimal places", () => {
    expect(calculateDiscountedPrice(99.99, 33.33)).toBe(66.66);
  });
});

/* =========================================================
   deriveAvailabilityStatus
   ========================================================= */

describe("deriveAvailabilityStatus", () => {
  it('returns "Out of Stock" for stock <= 0', () => {
    expect(deriveAvailabilityStatus(0)).toBe("Out of Stock");
    expect(deriveAvailabilityStatus(-1)).toBe("Out of Stock");
  });

  it('returns "Low Stock" for stock <= MIN_STOCK_FOR_LOW (5)', () => {
    expect(deriveAvailabilityStatus(1)).toBe("Low Stock");
    expect(deriveAvailabilityStatus(5)).toBe("Low Stock");
  });

  it('returns "In Stock" for stock > 5', () => {
    expect(deriveAvailabilityStatus(6)).toBe("In Stock");
    expect(deriveAvailabilityStatus(100)).toBe("In Stock");
  });
});
