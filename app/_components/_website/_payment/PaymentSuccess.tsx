"use client";
import { useState, useEffect, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiDownload, FiHome, FiMail } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useVariables } from "@/app/context/VariablesContext";
import { useCartStore, cartKeys } from "@/src/modules/cart";

export default function PaymentSuccess() {
  const { width, height } = useVariables();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const paymentStatus = searchParams.get("payment_status");
  const productLength = searchParams.get("productLength");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confettiVisible, setConfettiVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setConfettiVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const defaultOrderDetails = {
    orderNumber: "#ORD-2025-001234",
    amount: amount,
    email: "customer@example.com",
    estimatedDelivery: "June 5-7, 2025",
    items: productLength || 4,
  };

  const [confettiParticles, setConfettiParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => (
      <motion.div
        key={i}
        initial={{
          opacity: 1,
          y: -100,
          x: Math.random() * width || 400,
          rotate: 0,
          scale: Math.random() * 0.5 + 0.5,
        }}
        animate={{
          opacity: 0,
          y: height + 100 || 800,
          rotate: 360 * 3,
          transition: {
            duration: Math.random() * 2 + 2,
            ease: "easeOut",
          },
        }}
        className={`absolute w-3 h-3 ${
          [
            "bg-green-400",
            "bg-blue-400",
            "bg-yellow-400",
            "bg-purple-400",
            "bg-pink-400",
          ][i % 5]
        } rounded-full pointer-events-none`}
        style={{ zIndex: 1000 }}
      />
    ));
    setConfettiParticles(particles);
  }, [height, width]);

  // Clear cart after successful payment (fallback for when webhook hasn't fired yet)
  useEffect(() => {
    if (paymentStatus === "success") {
      // Clear guest cart (local storage)
      useCartStore.getState().clearGuestItems();
      // Invalidate server cart queries so they re-fetch as empty
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    }
  }, [paymentStatus, queryClient]);

  const onDownloadReceipt = () => {
    console.log("onDownloadReceipt", "download done");
  };

  const onContinueShopping = () => {
    router.push("/shop");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      <AnimatePresence>
        {confettiVisible && (
          <div className="fixed inset-0 pointer-events-none">
            {confettiParticles}
          </div>
        )}
      </AnimatePresence>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #10b981 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #059669 2px, transparent 2px)`,
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
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0.4)",
                  "0 0 0 20px rgba(16, 185, 129, 0)",
                  "0 0 0 0 rgba(16, 185, 129, 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
            >
              <FiCheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
            >
              ✨
            </motion.div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your purchase
          </p>
          <p className="text-gray-500">
            Your order has been confirmed and will be shipped soon
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium text-gray-900">
                {defaultOrderDetails.orderNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-green-600 text-lg">
                {defaultOrderDetails.amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items:</span>
              <span className="font-medium text-gray-900">
                {defaultOrderDetails.items} products
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery:</span>
              <span className="font-medium text-gray-900">
                {defaultOrderDetails.estimatedDelivery}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="flex items-center text-sm text-gray-600">
              <FiMail className="w-4 h-4 mr-2" />
              Confirmation sent to {defaultOrderDetails.email}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDownloadReceipt}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FiDownload className="w-5 h-5" />
            <span>Download Receipt</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinueShopping}
            className="flex-1 bg-white border-2 border-green-600 text-green-600 py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-green-50 transition-all duration-300"
          >
            <FiHome className="w-5 h-5" />
            <span>Continue Shopping</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
