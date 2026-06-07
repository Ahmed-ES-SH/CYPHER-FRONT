"use client";

import { useUnifiedCart } from "@/src/modules/cart";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiMinus, FiPlus, FiX, FiShoppingBag, FiClock } from "react-icons/fi";
import Img from "../../_global/Img";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function CartItems() {
  const { items, updateQuantity, removeItem, clearItems, isLoading, error } = useUnifiedCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    // Placeholder — replace with actual API call when coupon system is ready
    await new Promise((r) => setTimeout(r, 600));
    setCouponLoading(false);
    toast.info("Coupon codes coming soon!");
    setCouponCode("");
  };

  const handleClearCart = () => {
    clearItems();
    toast.success("Cart cleared");
  };

  if (isLoading) {
    return (
      <div className="min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)]">
            <svg className="h-10 w-10 animate-spin text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
            Loading your cart...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <FiX className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
            Failed to load cart
          </h2>
          <p className="mb-8 text-[var(--text-muted)]">
            {error?.message || "Something went wrong. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)]">
            <FiShoppingBag className="h-10 w-10 text-[var(--text-muted)]" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
            Your cart is empty
          </h2>
          <p className="mb-8 max-w-sm text-[var(--text-muted)]">
            Looks like you haven&rsquo;t added anything to your cart yet.
          </p>
          <Link
            href="/shop"
            className="rounded-md bg-[var(--primary-blue)] px-8 py-3 font-semibold text-white transition-colors hover:bg-[var(--dark-btn)]"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
        {/* Free Shipping Badge */}
        <div className="flex items-center gap-2 bg-[var(--primary-blue)]/10 px-6 py-3">
          <FiCheck className="text-[var(--primary-blue)]" />
          <span className="text-sm font-medium text-[var(--primary-blue)]">
            Your order qualifies for free shipping
          </span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-[var(--border-subtle)] px-6 py-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <div className="col-span-5">Product</div>
          <div className="col-span-2 text-center max-sm:col-span-3">Price</div>
          <div className="col-span-3 text-center">Qty</div>
          <div className="col-span-2 text-center max-sm:hidden">Subtotal</div>
        </div>

        {/* Cart Items List */}
        <AnimatePresence>
          <div className="max-h-[50vh] overflow-y-auto">
            {items.map((item, index) => {
              const itemSubtotal = (item.unitPrice.amount / 100) * item.quantity;
              const isLowStock = item.stock <= 5;
              const isAtMax = item.quantity >= item.maximumQuantity;
              const isAtStock = item.quantity >= item.stock;

              return (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  className="grid grid-cols-12 items-center gap-4 border-b border-[var(--border-subtle)] px-6 py-4 last:border-b-0"
                >
                  {/* Product Info */}
                  <div className="col-span-5 flex items-center gap-4 min-w-0">
                    <Img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-14 w-14 shrink-0 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {item.productName}
                      </h3>
                      {isLowStock && !isAtStock && (
                        <p className="mt-0.5 text-xs text-[var(--primary-yellow)]">
                          Only {item.stock} left
                        </p>
                      )}
                      {isAtStock && (
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                          Max stock reached
                        </p>
                      )}
                      <p className="mt-0.5 text-sm text-[var(--text-muted)] sm:hidden">
                        ${(item.unitPrice.amount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 flex items-center justify-center text-sm text-[var(--text-muted)] max-sm:col-span-3">
                    ${(item.unitPrice.amount / 100).toFixed(2)}
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-3 flex items-center justify-center">
                    <div className="flex items-center rounded-md border border-[var(--border-subtle)]">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.productId, item.quantity - 1);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)]"
                        aria-label={`Decrease quantity of ${item.productName}`}
                      >
                        <FiMinus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={Math.min(item.stock, item.maximumQuantity)}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1) {
                            updateQuantity(item.productId, val);
                          }
                        }}
                        className="w-10 border-x border-[var(--border-subtle)] bg-transparent py-1 text-center text-sm font-medium text-[var(--text-primary)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        aria-label={`Quantity of ${item.productName}`}
                      />
                      <button
                        onClick={() => {
                          if (!isAtMax && !isAtStock) {
                            updateQuantity(item.productId, item.quantity + 1);
                          }
                        }}
                        disabled={isAtMax || isAtStock}
                        className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Increase quantity of ${item.productName}`}
                      >
                        <FiPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + Remove */}
                  <div className="col-span-2 flex items-center justify-center gap-2 max-sm:hidden">
                    <span className="whitespace-nowrap text-sm font-semibold text-[var(--text-primary)]">
                      ${itemSubtotal.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        removeItem(item.productId);
                        toast.info("Removed from cart");
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove ${item.productName} from cart`}
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Remove button for mobile */}
                  <div className="col-span-3 flex items-center justify-end sm:hidden">
                    <button
                      onClick={() => {
                        removeItem(item.productId);
                        toast.info("Removed from cart");
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove ${item.productName} from cart`}
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-[var(--surface)] px-6 py-3">
          <button
            onClick={handleClearCart}
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-red-500"
          >
            <FiX className="h-4 w-4" />
            Clear cart
          </button>
          <button
            disabled
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] opacity-60"
            title="Coming soon"
          >
            <FiClock className="h-4 w-4" />
            Save for later
          </button>
        </div>

        {/* Coupon Section — Coming Soon */}
        <div className="border-t border-[var(--border-subtle)] bg-[var(--surface)] px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Coupon code (coming soon)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={couponLoading}
              className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--primary-blue)] disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              onClick={applyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              className="whitespace-nowrap rounded-md bg-[var(--primary-blue)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--dark-btn)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {couponLoading ? "Applying..." : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
