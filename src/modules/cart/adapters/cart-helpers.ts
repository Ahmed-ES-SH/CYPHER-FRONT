import type { GuestCartItem } from "../cart.types";
import type { ProductType } from "@/app/types/productType";

/**
 * Converts a ProductType (from external sources like wishlist, search results)
 * to a GuestCartItem for use with the cart module's useGuestCart hook.
 */
export function productToGuestCartItem(product: ProductType): GuestCartItem {
  const productImage =
    (product.images?.[0]) ??
    product.thumbnail ??
    "";

  return {
    productId: String(product.id),
    productName: product.title,
    productSlug: product.title.toLowerCase().replace(/\s+/g, "-"),
    productImage,
    unitPrice: {
      amount: product.price,
      currency: "usd",
    },
    quantity: product.quantity ?? 1,
    stock: product.stock,
    minimumQuantity: product.minimumOrderQuantity ?? 1,
    maximumQuantity: 99,
  };
}

/**
 * Returns true if a GuestCartItem matches the given ProductType by productId.
 */
export function isProductInCart(
  items: GuestCartItem[],
  product: ProductType,
): boolean {
  return items.some((item) => item.productId === String(product.id));
}

/**
 * Finds a GuestCartItem matching the given ProductType.
 */
export function findCartItem(
  items: GuestCartItem[],
  product: ProductType,
): GuestCartItem | undefined {
  return items.find((item) => item.productId === String(product.id));
}
