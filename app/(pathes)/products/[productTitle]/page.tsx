/* eslint-disable @typescript-eslint/no-explicit-any */
import Loading from "@/app/_components/_global/Loading";
import ProductPage from "@/app/_components/_website/_products/ProductPage";
import FetchData from "@/app/hooks/FetchData";
import React, { Suspense } from "react";

export async function generateMetadata({ searchParams }: any) {
  const { productId } = await searchParams;
  const product = await FetchData(`/products/${productId}`, false);

  return {
    title: `CYPHER - products – ${product?.title ?? "Product"}`,
    description: `CYPHER - products – ${
      product?.description ?? "Check our Popular Products."
    }`,
  };
}

export default function page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductPage />
    </Suspense>
  );
}
