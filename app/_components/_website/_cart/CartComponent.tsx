"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMinus, FiPlus, FiX, FiCheck } from "react-icons/fi";
import { useCartStore } from "@/app/store/CartStore";
import Img from "../../_global/Img";
import { handleCheckout } from "@/app/helpers/handleCheckout";
import CartItems from "./CartItems";

export default function CartComponent() {
  const { cartItems } = useCartStore();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  return (
    <div className="c-container  xl:p-4 p-2  min-h-screen">
      <div className="flex w-full relative gap-8">
        {/* Cart Items */}
        <CartItems />

        {/* Cart Totals */}
        <div className="flex-1 sticky top-12 left-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 sticky top-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              CART TOTALS
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-gray-700">
                      <input
                        type="radio"
                        name="shipping"
                        className="mr-2 text-blue-600"
                        defaultChecked
                      />
                      Free shipping
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center text-gray-700">
                      <input
                        type="radio"
                        name="shipping"
                        className="mr-2 text-blue-600"
                      />
                      Local pickup
                    </label>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Shipping to <span className="font-medium">NY</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-2xl text-primary font-bold underline">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCheckout(cartItems)}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-110 hover:bg-blue-700 transition-all duration-300"
              >
                Proceed to checkout
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
