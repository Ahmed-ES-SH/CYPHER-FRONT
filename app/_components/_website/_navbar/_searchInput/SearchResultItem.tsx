"use client";

import { useCartStore } from "@/app/store/CartStore";
import { ProductType } from "@/app/types/productType";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { IoCheckmarkOutline } from "react-icons/io5";
import { MdShoppingCart } from "react-icons/md";
import Img from "../../../_global/Img";
import Link from "next/link";

export default function SearchResultItem({
  product,
}: {
  product: ProductType;
}) {
  const { addToCart, cartItems } = useCartStore();

  const isInCart =
    cartItems && cartItems.some((item) => item.id === product.id);

  return (
    <Link
      href={`/products/${product.title.replace(/\s+/g, "-")}?productId=${product.id}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
        className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
          <Img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {product.title}
          </h3>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-600">
                ${product.price}
              </span>
              <div className="flex items-center gap-1">
                <FaStar className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-gray-600">{product.rating}</span>
              </div>
            </div>

            <motion.button
              onClick={() => addToCart(product)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 ${
                isInCart
                  ? "bg-green-100 hover:bg-green-200"
                  : "bg-blue-100 hover:bg-blue-200"
              } rounded-full transition-colors duration-200`}
            >
              {isInCart ? (
                <IoCheckmarkOutline className="w-4 h-4 text-green-600" />
              ) : (
                <MdShoppingCart className="w-4 h-4 text-blue-600" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
