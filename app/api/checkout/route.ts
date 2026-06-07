import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      lineItems,
      shippingMethod,
      currency = "usd",
      successUrl,
      cancelUrl,
    } = body;

    // Support both new format (lineItems array) and legacy format (single product fields)
    let items: { name: string; price: number; quantity: number }[];

    if (Array.isArray(lineItems) && lineItems.length > 0) {
      items = lineItems;
    } else if (body.productName && body.amount != null) {
      // Legacy format — wrap in array
      items = [
        {
          name: body.productName,
          price: body.amount,
          quantity: body.quantity || 1,
        },
      ];
    } else {
      return NextResponse.json(
        {
          error:
            "Incomplete payment data. Provide lineItems or productName/amount/quantity.",
        },
        { status: 400 },
      );
    }

    // Build Stripe line items from the array
    const stripeLineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price, // Already in minor units (cents)
      },
      quantity: item.quantity,
    }));

    // Compute total for display on cancel page
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: stripeLineItems,
      success_url:
        successUrl ??
        `${SITE_URL}/paymentsuccess?payment_status=success&session_id={CHECKOUT_SESSION_ID}&amount=${totalAmount}&productLength=${totalItems}`,
      cancel_url:
        cancelUrl ??
        `${SITE_URL}/paymentfaild?amount=${totalAmount}&productLength=${totalItems}`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe Error:", err);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 },
    );
  }
}
