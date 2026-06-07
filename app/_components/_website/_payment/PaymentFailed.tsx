/* eslint-disable react/no-unescaped-entities */
"use client";
import { useGuestCart } from "@/src/modules/cart";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiArrowLeft,
  FiCreditCard,
  FiMessageCircle,
  FiPhone,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";
import { useCheckout } from "../_cart/useCheckout";

export default function PaymentFailed() {
  const { items } = useGuestCart();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const router = useRouter();

  const { isCheckingOut, checkout } = useCheckout({
    items,
    shippingMethod: "free_shipping",
    currency: "usd",
  });

  const defaultError = {
    code: "CARD_DECLINED",
    message: "Your card was declined by the bank",
    suggestion: "Please try a different payment method or contact your bank",
    amount: amount,
  };

  const errorReasons = [
    "Insufficient funds",
    "Expired card",
    "Incorrect card details",
    "Bank security restrictions",
    "Network connection issues",
  ];

  const onGoBack = () => {
    router.push("/cart");
  };

  const onContactSupport = () => {
    router.push("/contact");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ef4444 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #dc2626 2px, transparent 2px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full relative z-10"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0 0 rgba(239, 68, 68, 0.4)",
                  "0 0 0 15px rgba(239, 68, 68, 0)",
                  "0 0 0 0 rgba(239, 68, 68, 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <FiXCircle className="w-12 h-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
            >
              ⚠️
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            We couldn't process your payment
          </p>
          <p className="text-gray-500">
            Don't worry, no charges were made to your account
          </p>
        </motion.div>

        {/* Error Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiCreditCard className="w-5 h-5 mr-2 text-red-500" />
            Error Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Error Code:</span>
              <span className="font-mono text-red-600 bg-red-100 px-2 py-1 rounded">
                {defaultError.code}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-gray-900">
                {defaultError.amount}
              </span>
            </div>
            <div className="pt-2 border-t border-red-200">
              <p className="text-red-600 font-medium mb-2">
                {defaultError.message}
              </p>
              <p className="text-gray-600 text-sm">{defaultError.suggestion}</p>
            </div>
          </div>
        </motion.div>

        {/* Common Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gray-50 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Common Issues
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {errorReasons.map((reason, index) => (
              <motion.div
                key={reason}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="flex items-center text-sm text-gray-600"
              >
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0"></div>
                {reason}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={checkout}
              disabled={isCheckingOut}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
            >
              <FiRefreshCw className="w-5 h-5" />
              <span>{isCheckingOut ? "Processing..." : "Try Again"}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoBack}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-gray-50 transition-all duration-300"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </motion.button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContactSupport}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all duration-300"
            >
              <FiMessageCircle className="w-4 h-4" />
              <span>Contact Support</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-green-700 transition-all duration-300"
            >
              <FiPhone className="w-4 h-4" />
              <span>Call Us: 1-800-HELP</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
