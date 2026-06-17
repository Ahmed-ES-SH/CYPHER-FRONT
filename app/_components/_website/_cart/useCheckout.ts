"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import type { UnifiedCartItem } from "@/src/modules/cart";

/* =========================================================
   Checkout Hook
   ========================================================= */

export interface CheckoutLineItem {
  name: string;
  price: number;
  quantity: number;
}

export interface UseCheckoutOptions {
  items: UnifiedCartItem[];
  shippingMethod?: string;
  currency?: string;
}

export interface UseCheckoutReturn {
  /** Whether a checkout is in progress */
  isCheckingOut: boolean;
  /** Error message if checkout failed */
  error: string | null;
  /** Initiate checkout */
  checkout: () => Promise<void>;
}

export function useCheckout(options: UseCheckoutOptions): UseCheckoutReturn {
  const { items, shippingMethod = "free_shipping", currency = "usd" } = options;
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate stock before checkout
    const outOfStock = items.filter((item) => item.quantity > item.stock);
    if (outOfStock.length > 0) {
      const names = outOfStock.map((i) => i.productName).join(", ");
      toast.error(`Some items are out of stock: ${names}`);
      return;
    }

    setIsCheckingOut(true);
    setError(null);

    try {
      const lineItems: CheckoutLineItem[] = items.map((item) => ({
        name: item.productName,
        price: item.unitPrice.amount,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems,
          shippingMethod,
          currency,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error ?? "Failed to create checkout session");
      }

      const data = await res.json();

      if (!data.sessionId) {
        throw new Error("No checkout session returned");
      }

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      );
      const { error: stripeError } = await stripe!.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message ?? "Stripe redirect failed");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Checkout failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsCheckingOut(false);
    }
  }, [items, shippingMethod, currency]);

  return { isCheckingOut, error, checkout };
}
