"use client";

import { useCartStore } from "@/app/store/CartStore";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiMinus, FiPlus, FiX } from "react-icons/fi";
import Img from "../../_global/Img";
import { useState } from "react";
import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import { toast } from "sonner";

export default function CartItems() {
  const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart } =
    useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const applyCoupon = () => {
    if (couponCode.trim()) {
      toast.error("This coupon is not valid");
      setCouponCode("");
    }
  };
  return (
    <div className="flex-1/2 ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6"
            >
              <FiShoppingBag className="w-12 h-12 text-gray-300" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              href="/shop"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-lg shadow-primary/20"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Free Shipping Banner */}
            <div className="bg-primary/60  backdrop-blur-md p-4">
              <div className="flex items-center justify-center text-white">
                <FiCheck className="mr-2" />
                <span className="font-medium">
                  Your order qualifies for free shipping!
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div className="bg-white h-2 rounded-full w-full"></div>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-200 text-sm font-medium text-gray-600 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 max-md:col-span-6 text-center">
                Price
              </div>
              <div className="col-span-2 text-center max-md:hidden">
                Quantity
              </div>
              <div className="col-span-2 text-center max-md:hidden">
                Subtotal
              </div>
            </div>

            {/* Cart Items */}
            <AnimatePresence>
              <div className="w-full max-h-[60vh] min-h-[50vh] overflow-auto custom-scrollbar">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 md:p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Product Info */}
                    <div className="flex items-center space-x-4 w-full md:w-1/2">
                      <Img
                        src={item.images[0]}
                        className="w-16 object-contain"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.title}
                        </h3>
                        {/* Optional: Show price on small screens */}
                        <p className="text-gray-500 text-sm md:hidden mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Price, Quantity, Subtotal */}
                    <div className="flex flex-wrap md:flex-nowrap justify-between md:justify-center items-center gap-4 w-full md:w-1/2">
                      {/* Price (hidden on mobile) */}
                      <div className="hidden md:flex items-center justify-center w-24">
                        <span className="text-gray-600">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => decreaseQuantity(item.id)}
                            className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                          >
                            <FiMinus className="w-4 h-4" />
                          </motion.button>
                          <span className="px-4 py-2 font-medium min-w-12 text-center">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => increaseQuantity(item)}
                            className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                          >
                            <FiPlus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Subtotal + Remove */}
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-semibold text-gray-900 whitespace-nowrap">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiX className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {/* Coupon Section */}
            <div className="p-6 bg-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyCoupon}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Apply coupon
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
