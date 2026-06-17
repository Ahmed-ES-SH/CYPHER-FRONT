"use client";

import { useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useCartAuthStore } from "./cart-auth.store";
import { useCart, useCartActions, useGuestCart } from "./cart.hooks";
import { selectCartSummary } from "./cart-selectors";
import type { CartItem, GuestCartItem, CartSummary, AddItemDto, CartApiError } from "./cart.types";

/* =========================================================
   UnifiedCartItem — Consistent item shape for UI
   ========================================================= */

export interface UnifiedCartItem {
  /** Cart item ID (server cart item id, or productId for guest) */
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: { amount: number; currency: string };
  quantity: number;
  stock: number;
  minimumQuantity: number;
  maximumQuantity: number;
}

function toUnifiedFromCartItem(item: CartItem): UnifiedCartItem {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    productSlug: item.productSlug,
    productImage: item.productImage,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    stock: item.stock,
    minimumQuantity: item.minimumQuantity,
    maximumQuantity: item.maximumQuantity,
  };
}

function toUnifiedFromGuestItem(item: GuestCartItem): UnifiedCartItem {
  return {
    id: item.productId,
    productId: item.productId,
    productName: item.productName,
    productSlug: item.productSlug,
    productImage: item.productImage,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    stock: item.stock,
    minimumQuantity: item.minimumQuantity,
    maximumQuantity: item.maximumQuantity,
  };
}

/* =========================================================
   useUnifiedCart
   ========================================================= */

export interface UnifiedCart {
  items: UnifiedCartItem[];
  isHydrated: boolean;
  isLoading: boolean;
  error: CartApiError | null;
  addItem: (input: GuestCartItem | AddItemDto) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearItems: () => void;
  summary: CartSummary;
  itemCount: number;
  isAuthenticated: boolean;
  isPending: boolean;
}

export function useUnifiedCart(): UnifiedCart {
  const isAuthenticated = useCartAuthStore((s) => s.isAuthenticated);
  const guestCart = useGuestCart();
  const { data: serverCart, isLoading, error } = useCart(isAuthenticated);
  const cartActions = useCartActions();

  // Build productId → cartItem map for server cart operations
  const productToCartItem = useMemo(() => {
    if (!serverCart) return new Map<string, CartItem>();
    const map = new Map<string, CartItem>();
    for (const item of serverCart.items) {
      map.set(item.productId, item);
    }
    return map;
  }, [serverCart]);

  // Unified items
  const items = useMemo((): UnifiedCartItem[] => {
    if (isAuthenticated && serverCart) {
      return serverCart.items.map(toUnifiedFromCartItem);
    }
    return guestCart.items.map(toUnifiedFromGuestItem);
  }, [isAuthenticated, serverCart, guestCart.items]);

  // Unified summary
  const summary = useMemo((): CartSummary => {
    if (isAuthenticated && serverCart) {
      return selectCartSummary(serverCart);
    }
    return guestCart.summary;
  }, [isAuthenticated, serverCart, guestCart.summary]);

  // Item count
  const itemCount = useMemo((): number => {
    if (isAuthenticated && serverCart) {
      return serverCart.itemCount;
    }
    return guestCart.itemCount;
  }, [isAuthenticated, serverCart, guestCart.itemCount]);

  const addItem = useCallback(
    (input: GuestCartItem | AddItemDto) => {
      if (isAuthenticated) {
        // Normalize to AddItemDto
        const dto: AddItemDto =
          "productId" in input
            ? { productId: input.productId, quantity: input.quantity ?? 1 }
            : input;
        cartActions.addItem.mutate(dto);
      } else {
        guestCart.addItem(input as GuestCartItem);
      }
    },
    [isAuthenticated, cartActions.addItem, guestCart.addItem],
  );

  const removeItem = useCallback(
    (productId: string) => {
      if (isAuthenticated) {
        const cartItem = productToCartItem.get(productId);
        if (cartItem) {
          cartActions.removeItem.mutate(cartItem.id);
        } else {
          console.error(`[cart] Item not found for productId: ${productId}`);
          toast.error("Failed to remove item. Please try again.");
        }
      } else {
        guestCart.removeItem(productId);
      }
    },
    [isAuthenticated, productToCartItem, cartActions.removeItem, guestCart.removeItem],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (isAuthenticated) {
        const cartItem = productToCartItem.get(productId);
        if (cartItem) {
          cartActions.updateItem.mutate({
            itemId: cartItem.id,
            dto: { quantity },
          });
        }
      } else {
        guestCart.updateQuantity(productId, quantity);
      }
    },
    [isAuthenticated, productToCartItem, cartActions.updateItem, guestCart.updateQuantity],
  );

  const clearItems = useCallback(() => {
    if (isAuthenticated) {
      cartActions.clearCart.mutate();
    } else {
      guestCart.clearItems();
    }
  }, [isAuthenticated, cartActions.clearCart, guestCart.clearItems]);

  return {
    items,
    isHydrated: guestCart.isHydrated,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearItems,
    summary,
    itemCount,
    isAuthenticated,
    isPending:
      cartActions.addItem.isLoading ||
      cartActions.removeItem.isLoading ||
      cartActions.updateItem.isLoading ||
      cartActions.clearCart.isLoading,
  };
}
