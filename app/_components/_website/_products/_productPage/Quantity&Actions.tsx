"use client";
import { motion } from "framer-motion";
import {
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaHeart,
  FaCheck,
} from "react-icons/fa";
import { MdCompare } from "react-icons/md";
import { ProductType } from "@/app/types/productType";
import { useGuestCart } from "@/src/modules/cart";
import { productToGuestCartItem, findCartItem } from "@/src/modules/cart/adapters/cart-helpers";
import { useWishlistStore } from "@/app/store/WishlistStoreStore";
import { toast } from "sonner";
import { useCallback, useMemo } from "react";

interface Quantity_ActionsProps {
  product: ProductType;
  setIsWishlisted: (isWishlisted: boolean) => void;
  isWishlisted: boolean;
}

export default function Quantity_Actions({
  product,
  setIsWishlisted,
  isWishlisted,
}: Quantity_ActionsProps) {
  const { items, addItem, updateQuantity } = useGuestCart();
  const { addToWishlist, wishlistItems } = useWishlistStore();

  const handleAddToWishList = (product: ProductType) => {
    const isInWishlist = wishlistItems.find((item) => item.id == product.id);
    if (!isInWishlist) {
      addToWishlist(product);
      setIsWishlisted(true);
    }
  };

  const cartItem = useMemo(() => {
    return findCartItem(items, product);
  }, [items, product]);

  const productQuantity = cartItem?.quantity ?? 1;

  const handleQuantityChange = useCallback(
    (action: string) => {
      if (!cartItem) return;
      if (action === "increase") {
        updateQuantity(cartItem.productId, cartItem.quantity + 1);
      } else if (action === "decrease" && productQuantity > 1) {
        updateQuantity(cartItem.productId, cartItem.quantity - 1);
      }
    },
    [cartItem, updateQuantity, productQuantity],
  );

  const isInCart = !!cartItem;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="space-y-4"
    >
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuantityChange("decrease")}
            className="p-3 hover:bg-gray-100 transition-colors"
          >
            <FaMinus className="text-gray-600" />
          </motion.button>
          <span className="px-4 py-3 font-medium text-lg">
            {productQuantity}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleQuantityChange("increase")}
            className="p-3 hover:bg-gray-100 transition-colors"
          >
            <FaPlus className="text-gray-600" />
          </motion.button>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          disabled={isInCart}
          onClick={() => {
            addItem(productToGuestCartItem(product));
            toast.success("Added to cart!");
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ cursor: isInCart ? "not-allowed" : "pointer" }}
          className={`flex-1 ${isInCart ? "bg-green-600 hover:bg-green-700" : "bg-primary"} text-white py-3 px-6 rounded-lg font-semibold  transition-colors flex items-center justify-center space-x-2`}
        >
          {isInCart ? <FaCheck /> : <FaShoppingCart />}
          <span>{isInCart ? "In Cart" : "Add to cart"}</span>
        </motion.button>
      </div>

      {/* Wishlist & Compare */}
      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleAddToWishList(product)}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
            isWishlisted
              ? "border-red-500 text-red-500 bg-red-50"
              : "border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500"
          }`}
        >
          <FaHeart className={isWishlisted ? "fill-current" : ""} />
          <span>Add to wishlist</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          <MdCompare />
          <span>Compare</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
