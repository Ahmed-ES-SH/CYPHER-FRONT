"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiTruck, FiMapPin } from "react-icons/fi";
import { useUnifiedCart } from "@/src/modules/cart";
import CartItems from "./CartItems";
import { useCheckout } from "./useCheckout";

type ShippingMethod = "free_shipping" | "local_pickup";

export default function CartComponent() {
  const { items, clearItems } = useUnifiedCart();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("free_shipping");

  const { isCheckingOut, checkout } = useCheckout({
    items,
    shippingMethod,
    currency: "usd",
    onBeforeRedirect: () => clearItems(),
  });

  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice.amount / 100) * item.quantity,
    0,
  );
  const total = subtotal;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="c-container xl:p-4 p-2 min-h-screen">
      <div className="flex w-full flex-col gap-8 lg:flex-row">
        {/* Cart Items */}
        <CartItems />

        {/* Cart Totals */}
        <div className="lg:w-80">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-6 lg:sticky lg:top-6"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {/* Shipping Selection */}
              <div className="space-y-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="free_shipping"
                    checked={shippingMethod === "free_shipping"}
                    onChange={() => setShippingMethod("free_shipping")}
                    className="h-4 w-4 accent-[var(--primary-blue)]"
                  />
                  <FiTruck className="text-[var(--primary-blue)]" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Free shipping
                    </span>
                    <p className="text-xs text-[var(--text-muted)]">
                      5–7 business days
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--primary-blue)]">
                    Free
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value="local_pickup"
                    checked={shippingMethod === "local_pickup"}
                    onChange={() => setShippingMethod("local_pickup")}
                    className="h-4 w-4 accent-[var(--primary-blue)]"
                  />
                  <FiMapPin className="text-[var(--text-muted)]" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Local pickup
                    </span>
                    <p className="text-xs text-[var(--text-muted)]">
                      Ready in 24 hours
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-muted)]">
                    Free
                  </span>
                </label>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Total
                  </span>
                  <span className="text-xl font-bold text-[var(--text-primary)]">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={checkout}
                disabled={isCheckingOut || items.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary-blue)] py-3.5 text-base font-semibold text-white transition-colors hover:bg-[var(--dark-btn)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingOut ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheck className="h-4 w-4" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Secure checkout · Encrypted payment
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
