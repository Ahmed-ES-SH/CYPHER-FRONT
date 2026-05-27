/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductPage from "@/app/_components/_website/_products/ProductPage";
import { getSharedMetadata } from "@/app/helpers/getSharedMetadata";
import { fetchProduct } from "@/src/modules/products";
import { configureProducts } from "@/src/modules/products";
import { productToLegacy } from "@/src/modules/products";

// Configure the backend URL for server-side requests
configureProducts({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000",
});

export async function generateMetadata({ searchParams }: any) {
  const { productId } = await searchParams;

  try {
    const product = await fetchProduct(productId);
    const legacyProduct = productToLegacy(product);

    const title = `CYPHER - Products – ${legacyProduct.title ?? "Product"}`;
    const description = `CYPHER - Products – ${
      legacyProduct.description ?? "Check our Popular Products."
    }`;

    const sharedMetadata = getSharedMetadata(title, description);
    return sharedMetadata;
  } catch {
    const sharedMetadata = getSharedMetadata(
      "CYPHER - Products",
      "Check our Popular Products.",
    );
    return sharedMetadata;
  }
}

export default async function page({ searchParams }: any) {
  const { productId } = await searchParams;

  try {
    const product = await fetchProduct(productId);
    const legacyProduct = productToLegacy(product);
    return <ProductPage product={legacyProduct} />;
  } catch {
    // Return an empty shell; ProductPage handles missing products with an error message
    return (
      <div className="min-h-screen">
        <ProductPage
          product={
            {
              id: 0,
              title: "Product not found",
              description: "",
              price: 0,
              discountPercentage: 0,
              rating: 0,
              stock: 0,
              brand: "",
              sku: "",
              tags: [],
              images: [],
              thumbnail: "",
              reviews: [],
              category: "",
              dimensions: { width: 0, height: 0, depth: 0 },
              weight: 0,
              minimumOrderQuantity: 0,
              availabilityStatus: "",
              quantity: 1,
              meta: { createdAt: "", updatedAt: "" },
              returnPolicy: "",
              shippingInformation: "",
              warrantyInformation: "",
            } as any
          }
        />
      </div>
    );
  }
}
