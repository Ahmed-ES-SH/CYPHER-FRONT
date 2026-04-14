/**
 * @deprecated Use inline checkout logic in CartComponent.tsx instead.
 * This file is kept for interface export only.
 */
import { loadStripe } from "@stripe/stripe-js";

export interface CheckoutLineItem {
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutPayload {
  lineItems: CheckoutLineItem[];
  shippingMethod: string;
  currency: string;
}

export async function handleCheckout(payload: CheckoutPayload) {
  if (!payload.lineItems || payload.lineItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create checkout session");
  }

  const data = await res.json();

  if (data.sessionId) {
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
    await stripe?.redirectToCheckout({ sessionId: data.sessionId });
  } else {
    throw new Error("Failed to create checkout session");
  }
}
