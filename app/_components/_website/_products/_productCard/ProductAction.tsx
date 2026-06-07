"use client";

import { CgShoppingCart } from "react-icons/cg";
import { useGuestCart } from "@/src/modules/cart";
import { productToGuestCartItem, isProductInCart } from "@/src/modules/cart/adapters/cart-helpers";
import { productTypeAdapter } from "@/src/modules/cart/adapters/product-type.adapter";
import { ProductType } from "@/app/types/productType";
import { toast } from "sonner";

interface props {
  product: ProductType;
  isHovered: boolean;
}

export default function ProductAction({ product, isHovered }: props) {
  const { items, addItem } = useGuestCart();
  const inCart = isProductInCart(items, product, productTypeAdapter);
  return (
    <button
      onClick={() => {
        addItem(productToGuestCartItem(product, productTypeAdapter));
        toast.success("Added to cart!");
      }}
      disabled={product.stock === 0 || inCart}
      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 my-3 text-[13px]
    ${
      product.stock === 0
        ? "bg-surface text-text-muted cursor-not-allowed"
        : inCart
          ? "bg-primary-blue/10 text-primary-blue border border-primary-blue/20"
          : isHovered
            ? "bg-primary-blue text-white hover:bg-dark-btn"
            : "bg-surface text-text-secondary hover:bg-border-subtle"
    }
  `}
    >
      <CgShoppingCart size={15} />
      {product.stock === 0
        ? "Out of Stock"
        : inCart
          ? "In Cart"
          : "Add to Cart"}
    </button>
  );
}
