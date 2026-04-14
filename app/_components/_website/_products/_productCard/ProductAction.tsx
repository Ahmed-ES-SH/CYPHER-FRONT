"use client";

import { CgShoppingCart } from "react-icons/cg";
import { useCartStore } from "@/app/store/CartStore";
import { ProductType } from "@/app/types/productType";

interface props {
  product: ProductType;
  isHovered: boolean;
}

export default function ProductAction({ product, isHovered }: props) {
  const { addToCart, cartItems } = useCartStore();
  const isInCart =
    !!product && cartItems.some((item) => item.id === product.id);
  return (
    <button
      onClick={() => addToCart(product)}
      disabled={product.stock === 0}
      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 my-3 text-[13px]
    ${
      product.stock === 0
        ? "bg-surface text-text-muted cursor-not-allowed"
        : isInCart
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
        : isInCart
          ? "In Cart"
          : "Add to Cart"}
    </button>
  );
}
