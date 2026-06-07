import type { ProductAdapter } from "./cart-helpers";
import type { ProductType } from "@/app/types/productType";
import { CART_RULES } from "../cart.types";

/* =========================================================
   ProductType Adapter for DummyJSON-style products
   =========================================================
   This is a host-app specific adapter. It converts
   ProductType (from DummyJSON) into the cart module's
   GuestCartItem via the generic ProductAdapter interface.
   ========================================================= */

export const productTypeAdapter: ProductAdapter<ProductType> = {
  getId: (product) => String(product.id),
  getName: (product) => product.title,
  getSlug: (product) => product.title.toLowerCase().replace(/\s+/g, "-"),
  getImage: (product) => product.images?.[0] ?? product.thumbnail ?? "",
  getPrice: (product) => ({
    amount: Math.round(product.price * 100),
    currency: "usd",
  }),
  getStock: (product) => product.stock,
  getMinQuantity: (product) => product.minimumOrderQuantity ?? 1,
  getMaxQuantity: () => CART_RULES.MAX_QUANTITY,
};
