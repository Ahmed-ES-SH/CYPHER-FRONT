import ShopProducts from "@/app/_components/_website/_shop/ShopProducts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CYPHER – Electronics Store ECommerce - Shop",
  description:
    "Discover the latest in electronics with CYPHER – your trusted online store for smartphones, laptops, accessories, and more. Shop top brands and enjoy fast delivery and great prices.",
};

export default function ShopPage() {
  return <ShopProducts />;
}
