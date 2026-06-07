import type { GuestCartItem, Money } from "../cart.types";
import { CART_RULES } from "../cart.types";

/* =========================================================
   Generic Product Adapter
   =========================================================
   Host apps implement this interface to convert their product
   types into GuestCartItem for the cart module.
   ========================================================= */

export interface ProductAdapter<T> {
  getId: (product: T) => string;
  getName: (product: T) => string;
  getSlug: (product: T) => string;
  getImage: (product: T) => string;
  getPrice: (product: T) => Money;
  getStock: (product: T) => number;
  getMinQuantity?: (product: T) => number;
  getMaxQuantity?: (product: T) => number;
}

export function createGuestCartItemFromProduct<T>(
  product: T,
  adapter: ProductAdapter<T>,
  quantity = 1,
): GuestCartItem {
  return {
    productId: adapter.getId(product),
    productName: adapter.getName(product),
    productSlug: adapter.getSlug(product),
    productImage: adapter.getImage(product),
    unitPrice: adapter.getPrice(product),
    quantity,
    stock: adapter.getStock(product),
    minimumQuantity: adapter.getMinQuantity?.(product) ?? CART_RULES.MIN_QUANTITY,
    maximumQuantity: adapter.getMaxQuantity?.(product) ?? CART_RULES.MAX_QUANTITY,
  };
}

export function isProductInCart<T>(
  items: GuestCartItem[],
  product: T,
  adapter: ProductAdapter<T>,
): boolean {
  return items.some((item) => item.productId === adapter.getId(product));
}

export function findCartItem<T>(
  items: GuestCartItem[],
  product: T,
  adapter: ProductAdapter<T>,
): GuestCartItem | undefined {
  return items.find((item) => item.productId === adapter.getId(product));
}

/* =========================================================
   Backward-Compatible Convenience Functions
   =========================================================
   These accept a ProductAdapter as second argument for
   portability. Host apps should migrate to the generic API.
   ========================================================= */

export function productToGuestCartItem<T>(
  product: T,
  adapter: ProductAdapter<T>,
  quantity = 1,
): GuestCartItem {
  return createGuestCartItemFromProduct(product, adapter, quantity);
}
