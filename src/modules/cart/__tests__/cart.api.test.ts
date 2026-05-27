import { describe, it, expect } from "vitest";
import {
  createMoney,
  addMoney,
  multiplyMoney,
  validateQuantity,
  toCartItem,
  toCart,
  toGuestCartItem,
  parseCartApiError,
  parseCartFieldErrors,
  canAddToCart,
  mergeGuestItemsWithCart,
  cartKeys,
  selectCartSummary,
  selectCartItemCount,
  selectGuestCartSummary,
  selectGuestItemCount,
  selectIsCartEmpty,
  selectIsGuestCartEmpty,
  selectItemStockWarning,
  selectOutOfStockItems,
} from "../cart.api";
import type {
  CartDto,
  CartItemDto,
  Cart,
  CartItem,
  GuestCartItem,
  Money,
} from "../cart.types";

/* =========================================================
   Helpers
   ========================================================= */

function makeCartItemDto(overrides: Partial<CartItemDto> = {}): CartItemDto {
  return {
    id: "item-1",
    productId: "prod-1",
    productName: "Test Product",
    productSlug: "test-product",
    productImage: "/test.jpg",
    price: 1999,
    quantity: 2,
    stock: 10,
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 99,
    ...overrides,
  };
}

function makeCartDto(overrides: Partial<CartDto> = {}): CartDto {
  return {
    id: "cart-1",
    userId: "user-1",
    items: [makeCartItemDto()],
    subtotal: 3998,
    total: 3998,
    currency: "usd",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

/* =========================================================
   Money Utilities
   ========================================================= */

describe("createMoney", () => {
  it("creates a Money object with rounded amount", () => {
    const m = createMoney(1999, "usd");
    expect(m).toEqual({ amount: 1999, currency: "usd" });
  });

  it("rounds fractional amounts", () => {
    expect(createMoney(19.99).amount).toBe(20);
    expect(createMoney(19.49).amount).toBe(19);
  });

  it("defaults to usd currency", () => {
    expect(createMoney(100).currency).toBe("usd");
  });
});

describe("addMoney", () => {
  it("adds two Money amounts with same currency", () => {
    const result = addMoney(
      { amount: 1000, currency: "usd" },
      { amount: 2500, currency: "usd" },
    );
    expect(result).toEqual({ amount: 3500, currency: "usd" });
  });

  it("throws on currency mismatch", () => {
    expect(() =>
      addMoney(
        { amount: 100, currency: "usd" },
        { amount: 100, currency: "eur" },
      ),
    ).toThrow("Currency mismatch");
  });
});

describe("multiplyMoney", () => {
  it("multiplies amount by quantity", () => {
    const result = multiplyMoney({ amount: 1000, currency: "usd" }, 3);
    expect(result).toEqual({ amount: 3000, currency: "usd" });
  });
});

/* =========================================================
   Quantity Validation
   ========================================================= */

describe("validateQuantity", () => {
  it("passes valid quantity through", () => {
    const result = validateQuantity(2, 10, 1, 99);
    expect(result.valid).toBe(true);
    expect(result.clamped).toBe(2);
  });

  it("clamps below minimum", () => {
    const result = validateQuantity(0, 10, 1, 99);
    expect(result.clamped).toBe(1);
    expect(result.valid).toBe(false);
  });

  it("clamps above maximum", () => {
    const result = validateQuantity(100, 200, 1, 50);
    expect(result.clamped).toBe(50);
    expect(result.valid).toBe(false);
  });

  it("clamps above stock", () => {
    const result = validateQuantity(20, 10, 1, 99);
    expect(result.clamped).toBe(10);
    expect(result.valid).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = validateQuantity(-5, 10, 1, 99);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("positive integer");
  });

  it("uses default min/max when not specified", () => {
    expect(validateQuantity(0, 10).clamped).toBe(1);
    expect(validateQuantity(999, 1000).clamped).toBe(99);
  });

  it("provides a reason when clamped", () => {
    const result = validateQuantity(50, 10, 1, 99);
    expect(result.reason).toContain("adjusted");
  });
});

/* =========================================================
   Mappers
   ========================================================= */

describe("toCartItem", () => {
  it("maps a CartItemDto to a CartItem", () => {
    const dto = makeCartItemDto();
    const result = toCartItem(dto, "usd");
    expect(result.id).toBe("item-1");
    expect(result.productId).toBe("prod-1");
    expect(result.unitPrice.amount).toBe(1999);
    expect(result.subtotal.amount).toBe(3998);
    expect(result.quantity).toBe(2);
  });

  it("computes subtotal as unitPrice * quantity", () => {
    const dto = makeCartItemDto({ price: 1000, quantity: 5 });
    const result = toCartItem(dto, "usd");
    expect(result.subtotal.amount).toBe(5000);
  });
});

describe("toCart", () => {
  it("maps a CartDto to a Cart", () => {
    const dto = makeCartDto();
    const result = toCart(dto);
    expect(result.id).toBe("cart-1");
    expect(result.items).toHaveLength(1);
    expect(result.subtotal.amount).toBe(3998);
    expect(result.total.amount).toBe(3998);
  });

  it("computes itemCount from item quantities", () => {
    const dto = makeCartDto({
      items: [
        makeCartItemDto({ id: "a", quantity: 2 }),
        makeCartItemDto({ id: "b", quantity: 3 }),
      ],
    });
    const result = toCart(dto);
    expect(result.itemCount).toBe(5);
  });

  it("handles empty items array", () => {
    const dto = makeCartDto({ items: [], subtotal: 0, total: 0 });
    const result = toCart(dto);
    expect(result.items).toHaveLength(0);
    expect(result.itemCount).toBe(0);
  });
});

describe("toGuestCartItem", () => {
  it("creates a GuestCartItem from raw fields", () => {
    const price: Money = { amount: 1999, currency: "usd" };
    const result = toGuestCartItem(
      "prod-1", "Test", "test", "/img.jpg", price, 2, 10,
    );
    expect(result.productId).toBe("prod-1");
    expect(result.quantity).toBe(2);
    expect(result.stock).toBe(10);
    expect(result.unitPrice).toEqual(price);
  });
});

/* =========================================================
   Selectors
   ========================================================= */

describe("selectCartSummary", () => {
  it("extracts summary from cart", () => {
    const cart: Cart = {
      id: "c", userId: "u", items: [],
      subtotal: { amount: 1000, currency: "usd" },
      total: { amount: 1000, currency: "usd" },
      currency: "usd", itemCount: 5,
      createdAt: "", updatedAt: "",
    };
    const s = selectCartSummary(cart);
    expect(s.itemCount).toBe(5);
    expect(s.subtotal.amount).toBe(1000);
  });
});

describe("selectGuestCartSummary", () => {
  it("computes summary from guest items", () => {
    const items: GuestCartItem[] = [
      {
        productId: "a", productName: "A", productSlug: "a", productImage: "",
        unitPrice: { amount: 1000, currency: "usd" },
        quantity: 2, stock: 10, minimumQuantity: 1, maximumQuantity: 99,
      },
      {
        productId: "b", productName: "B", productSlug: "b", productImage: "",
        unitPrice: { amount: 500, currency: "usd" },
        quantity: 3, stock: 10, minimumQuantity: 1, maximumQuantity: 99,
      },
    ];
    const s = selectGuestCartSummary(items);
    expect(s.itemCount).toBe(5);
    expect(s.subtotal.amount).toBe(3500);
  });

  it("returns zeroed summary for empty items", () => {
    const s = selectGuestCartSummary([]);
    expect(s.itemCount).toBe(0);
    expect(s.subtotal.amount).toBe(0);
  });
});

describe("selectCartItemCount", () => {
  it("returns itemCount from cart", () => {
    const cart = { itemCount: 3 } as Cart;
    expect(selectCartItemCount(cart)).toBe(3);
  });
});

describe("selectGuestItemCount", () => {
  it("sums quantities", () => {
    const items = [
      { quantity: 2 } as GuestCartItem,
      { quantity: 3 } as GuestCartItem,
    ];
    expect(selectGuestItemCount(items)).toBe(5);
  });

  it("returns 0 for empty array", () => {
    expect(selectGuestItemCount([])).toBe(0);
  });
});

describe("selectIsCartEmpty", () => {
  it("returns true when cart has no items", () => {
    expect(selectIsCartEmpty({ items: [] } as Cart)).toBe(true);
  });

  it("returns false when cart has items", () => {
    expect(selectIsCartEmpty({ items: [{}] } as Cart)).toBe(false);
  });
});

describe("selectIsGuestCartEmpty", () => {
  it("returns true when empty", () => {
    expect(selectIsGuestCartEmpty([])).toBe(true);
  });

  it("returns false when not empty", () => {
    expect(selectIsGuestCartEmpty([{} as GuestCartItem])).toBe(false);
  });
});

describe("selectItemStockWarning", () => {
  it("returns null when stock is sufficient", () => {
    const item = { stock: 10, quantity: 3 } as CartItem;
    expect(selectItemStockWarning(item)).toBeNull();
  });

  it("returns low stock warning at 5 or fewer remaining", () => {
    const item = { stock: 7, quantity: 3 } as CartItem;
    expect(selectItemStockWarning(item)).toContain("4 left");
  });

  it("returns out-of-stock when remaining is 0", () => {
    const item = { stock: 5, quantity: 5 } as CartItem;
    expect(selectItemStockWarning(item)).toBe("Out of stock");
  });
});

describe("selectOutOfStockItems", () => {
  it("filters items where quantity exceeds stock", () => {
    const items = [
      { productId: "a", quantity: 5, stock: 10 } as CartItem,
      { productId: "b", quantity: 15, stock: 10 } as CartItem,
    ];
    const cart = { items } as Cart;
    const result = selectOutOfStockItems(cart);
    expect(result).toHaveLength(1);
    expect(result[0].productId).toBe("b");
  });
});

/* =========================================================
   Error Normalization
   ========================================================= */

describe("parseCartApiError", () => {
  it("extracts message and status from structured error", () => {
    const result = parseCartApiError({
      message: "Not found",
      status: 404,
    });
    expect(result.message).toBe("Not found");
    expect(result.status).toBe(404);
  });

  it("returns defaults for null/undefined", () => {
    expect(parseCartApiError(null).status).toBe(500);
    expect(parseCartApiError(undefined).status).toBe(500);
  });

  it("preserves field errors", () => {
    const result = parseCartApiError({
      message: "Validation failed",
      status: 422,
      errors: { quantity: ["Must be at least 1"] },
    });
    expect(result.errors?.quantity).toEqual(["Must be at least 1"]);
  });
});

describe("parseCartFieldErrors", () => {
  it("converts field arrays to first-message map", () => {
    const result = parseCartFieldErrors({
      quantity: ["Quantity is required", "Must be positive"],
      productId: ["Invalid product"],
    });
    expect(result).toEqual({
      quantity: "Quantity is required",
      productId: "Invalid product",
    });
  });

  it("returns empty object for undefined/null", () => {
    expect(parseCartFieldErrors(undefined)).toEqual({});
    expect(parseCartFieldErrors(null as unknown as Record<string, string[]>)).toEqual({});
  });
});

/* =========================================================
   Cart Service
   ========================================================= */

describe("canAddToCart", () => {
  it("allows valid addition", () => {
    expect(canAddToCart(1, 2, 10, 99)).toEqual({ allowed: true });
  });

  it("denies when stock would be exceeded", () => {
    const result = canAddToCart(8, 5, 10, 99);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("units available");
  });

  it("denies when maximum would be exceeded", () => {
    const result = canAddToCart(1, 100, 200, 50);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Maximum");
  });
});

describe("mergeGuestItemsWithCart", () => {
  it("creates AddItemDto array from guest items", () => {
    const guest: GuestCartItem[] = [
      {
        productId: "p1", productName: "P1", productSlug: "p1", productImage: "",
        unitPrice: { amount: 100, currency: "usd" },
        quantity: 2, stock: 10, minimumQuantity: 1, maximumQuantity: 99,
      },
    ];
    const result = mergeGuestItemsWithCart(guest, []);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ productId: "p1", quantity: 2 });
  });

  it("returns empty array for no guest items", () => {
    expect(mergeGuestItemsWithCart([], [])).toEqual([]);
  });
});

/* =========================================================
   Query Keys
   ========================================================= */

describe("cartKeys", () => {
  it("produces stable key prefixes", () => {
    expect(cartKeys.all).toEqual(["cart"]);
    expect(cartKeys.detail()).toEqual(["cart", "detail"]);
    expect(cartKeys.itemCount()).toEqual(["cart", "count"]);
    expect(cartKeys.checkout()).toEqual(["cart", "checkout"]);
    expect(cartKeys.mutations()).toEqual(["cart", "mutations"]);
  });
});
