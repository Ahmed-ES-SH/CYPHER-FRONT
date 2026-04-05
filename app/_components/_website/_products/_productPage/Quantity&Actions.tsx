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
import { useCartStore } from "@/app/store/CartStore";
import { useWishlistStore } from "@/app/store/WishlistStoreStore";
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
  const { addToCart, increaseQuantity, decreaseQuantity, cartItems } =
    useCartStore();
  const { addToWishlist, wishlistItems } = useWishlistStore();

  const handleAddToWishList = (product: ProductType) => {
    const isInWishlist = wishlistItems.find((item) => item.id == product.id);
    if (!isInWishlist) {
      addToWishlist(product);
      setIsWishlisted(true);
    }
  };

  const productQuantity = useMemo(() => {
    return cartItems.find((item) => item.id === product?.id)?.quantity || 1;
  }, [cartItems, product?.id]);

  const handleQuantityChange = useCallback(
    (action: string, product: ProductType) => {
      if (action === "increase") {
        increaseQuantity(product);
      } else if (action === "decrease" && productQuantity > 1) {
        decreaseQuantity(product?.id);
      }
    },
    [increaseQuantity, decreaseQuantity, productQuantity],
  );

  const isInCart = useMemo(() => {
    return cartItems.find((item) => item.id === product?.id);
  }, [cartItems, product?.id]);

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
            onClick={() => handleQuantityChange("decrease", product)}
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
            onClick={() => handleQuantityChange("increase", product)}
            className="p-3 hover:bg-gray-100 transition-colors"
          >
            <FaPlus className="text-gray-600" />
          </motion.button>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          disabled={isInCart ? true : false}
          onClick={() => addToCart(product)}
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
