import type { Money, CartItem, GuestCartItem } from "./cart.types";
import { CART_RULES } from "./cart.types";

/* =========================================================
   Money Utilities
   ========================================================= */

export function createMoney(amount: number, currency: string = CART_RULES.DEFAULT_CURRENCY): Money {
  return { amount: Math.round(amount), currency };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
  return createMoney(a.amount + b.amount, a.currency);
}

export function multiplyMoney(price: Money, quantity: number): Money {
  return createMoney(price.amount * quantity, price.currency);
}

/* =========================================================
   Quantity Validation
   ========================================================= */

export interface QuantityValidationResult {
  valid: boolean;
  clamped: number;
  reason?: string;
}

export function validateQuantity(
  quantity: number,
  stock: number,
  minimum = CART_RULES.MIN_QUANTITY,
  maximum = CART_RULES.MAX_QUANTITY,
): QuantityValidationResult {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return {
      valid: false,
      clamped: minimum,
      reason: "Quantity must be a positive integer",
    };
  }

  if (stock === 0) {
    return {
      valid: false,
      clamped: 0,
      reason: "Item is out of stock",
    };
  }

  let clamped = quantity;

  if (clamped < minimum) {
    clamped = minimum;
  }

  if (clamped > maximum) {
    clamped = maximum;
  }

  if (clamped > stock) {
    clamped = stock;
  }

  if (clamped < minimum) {
    clamped = minimum;
  }

  const valid = clamped === quantity;

  return {
    valid,
    clamped,
    reason: valid ? undefined : `Quantity adjusted from ${quantity} to ${clamped}`,
  };
}

/* =========================================================
   Cart Service Helpers
   ========================================================= */

export function canAddToCart(
  currentQuantity: number,
  requestedQuantity: number,
  stock: number,
  maximum: number,
): { allowed: boolean; reason?: string } {
  const total = currentQuantity + requestedQuantity;
  if (total > stock) {
    return { allowed: false, reason: `Only ${stock - currentQuantity} units available` };
  }
  if (total > maximum) {
    return { allowed: false, reason: `Maximum ${maximum} units per order` };
  }
  return { allowed: true };
}

export function mergeGuestItemsWithCart(
  guestItems: GuestCartItem[],
  cartItems: CartItem[],
): { productId: string; quantity: number }[] {
  const cartMap = new Map<string, CartItem>();
  for (const item of cartItems) {
    cartMap.set(item.productId, item);
  }

  const addItems: { productId: string; quantity: number }[] = [];

  for (const guest of guestItems) {
    const existing = cartMap.get(guest.productId);
    const currentQty = existing?.quantity ?? 0;
    const authoritativeStock = existing?.stock ?? guest.stock;
    const { clamped } = validateQuantity(
      currentQty + guest.quantity,
      authoritativeStock,
      guest.minimumQuantity,
      guest.maximumQuantity,
    );
    addItems.push({ productId: guest.productId, quantity: clamped });
  }

  return addItems;
}
