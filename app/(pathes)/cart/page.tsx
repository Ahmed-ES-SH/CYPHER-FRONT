import CartComponent from "@/app/_components/_website/_cart/CartComponent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "CYPHER – Electronics Store ECommerce - Cart Page",
  description:
    "Review and manage the items in your cart. Securely proceed to checkout and enjoy the best deals on the latest electronics at CYPHER.",
};

export default function CartPage() {
  return <CartComponent />;
}
