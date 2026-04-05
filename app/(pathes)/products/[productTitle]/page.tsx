/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductPage from "@/app/_components/_website/_products/ProductPage";
import { getSharedMetadata } from "@/app/helpers/getSharedMetadata";
import FetchDummyData from "@/app/hooks/FetchData";

export async function generateMetadata({ searchParams }: any) {
  const { productId } = await searchParams;
  const product = await FetchDummyData(`/products/${productId}`, false);

  const title = `CYPHER - Products – ${product?.title ?? "Product"}`;
  const description = `CYPHER - Products – ${
    product?.description ?? "Check our Popular Products."
  }`;

  const sharedMetadata = getSharedMetadata(title, description);

  return sharedMetadata;
}

export default async function page({ searchParams }: any) {
  const { productId } = await searchParams;
  const product = await FetchDummyData(`/products/${productId}`, false);
  return <ProductPage product={product} />;
}
