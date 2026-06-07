import type { Cart, CartItem, CartSummary, GuestCartItem } from "./cart.types";
import { CART_RULES } from "./cart.types";
import { createMoney } from "./cart-utils";

/* =========================================================
   Cart Selectors (Pure Derived State)
   ========================================================= */

export function selectCartSummary(cart: Cart): CartSummary {
  return {
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    total: cart.total,
    currency: cart.currency,
  };
}

export function selectGuestCartSummary(items: GuestCartItem[]): CartSummary {
  if (items.length === 0) {
    return {
      itemCount: 0,
      subtotal: createMoney(0, CART_RULES.DEFAULT_CURRENCY),
      total: createMoney(0, CART_RULES.DEFAULT_CURRENCY),
      currency: CART_RULES.DEFAULT_CURRENCY,
    };
  }

  const currency = items[0].unitPrice.currency;

  const hasMixedCurrencies = items.some((i) => i.unitPrice.currency !== currency);
  if (hasMixedCurrencies) {
    console.warn("[cart] Mixed currencies in guest cart — totals will be inaccurate");
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalAmount = items
    .filter((i) => i.unitPrice.currency === currency)
    .reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);

  return {
    itemCount,
    subtotal: createMoney(subtotalAmount, currency),
    total: createMoney(subtotalAmount, currency),
    currency,
  };
}

export function selectGuestItemCount(items: GuestCartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function selectCartItemCount(cart: Cart): number {
  return cart.itemCount;
}

export function selectItemById(cart: Cart, productId: string): CartItem | undefined {
  return cart.items.find((item) => item.productId === productId);
}

export function selectGuestItemById(
  items: GuestCartItem[],
  productId: string,
): GuestCartItem | undefined {
  return items.find((item) => item.productId === productId);
}

export function selectOutOfStockItems(cart: Cart): CartItem[] {
  return cart.items.filter((item) => item.quantity > item.stock);
}

export function selectIsCartEmpty(cart: Cart): boolean {
  return cart.items.length === 0;
}

export function selectIsGuestCartEmpty(items: GuestCartItem[]): boolean {
  return items.length === 0;
}

export function selectItemStockWarning(item: CartItem | GuestCartItem): string | null {
  const remaining = item.stock - item.quantity;
  if (remaining <= 0) return "Out of stock";
  if (remaining <= 5) return `Only ${remaining} left`;
  return null;
}
