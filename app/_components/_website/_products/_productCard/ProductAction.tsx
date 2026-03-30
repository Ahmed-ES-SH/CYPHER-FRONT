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
      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-300 my-3
    ${
      product.stock === 0
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : isInCart
          ? "bg-green-100 text-green-700 border border-green-500"
          : isHovered
            ? "bg-primary text-white hover:bg-primary/80"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }
  `}
    >
      <CgShoppingCart size={16} />
      {product.stock === 0
        ? "Out of Stock"
        : isInCart
          ? "✓ In Cart"
          : "Add to Cart"}
    </button>
  );
}
