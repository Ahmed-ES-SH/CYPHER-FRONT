/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductPage from "@/app/_components/_website/_products/ProductPage";
import { getSharedMetadata } from "@/app/helpers/getSharedMetadata";
import { fetchProduct } from "@/src/modules/products";
import { configureProducts } from "@/src/modules/products";

// export async function generateMetadata({ searchParams }: any) {
//   const { slug } = await searchParams;

//   try {
//     const product = await fetchProduct(slug);

//     const title = `CYPHER - Products – ${product.title ?? "Product"}`;
//     const description = `CYPHER - Products – ${
//       product.description ?? "Check our Popular Products."
//     }`;

//     const sharedMetadata = getSharedMetadata(title, description);
//     return sharedMetadata;
//   } catch {
//     const sharedMetadata = getSharedMetadata(
//       "CYPHER - Products",
//       "Check our Popular Products.",
//     );
//     return sharedMetadata;
//   }
// }

export default async function page({ searchParams }: any) {
  const { slug } = await searchParams;
  console.log("Received slug:", slug);
  const product = await fetch(
    `http://localhost:5000/api/products/${slug}`,
  ).then((res) => res.json());
  console.log(
    "Fetched product response:",
    `http://localhost:5000/api/products/${slug}`,
  );
  console.log("Fetched product:", product);
  // return <ProductPage product={product} />;
}
