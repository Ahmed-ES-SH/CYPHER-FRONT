import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/app/_components/_website/_products/ProductPage";
import { getSharedMetadata } from "@/app/helpers/getSharedMetadata";
import { fetchProduct, type Product } from "@/src/modules/products";
import { globalRequest } from "@/app/helpers/globalRequest";

interface ProductRouteParams {
  productTitle: string;
}

interface ProductPageSearchParams {
  productId?: string | string[];
  id?: string | string[];
}

interface ProductPageProps {
  params: Promise<ProductRouteParams>;
  searchParams: Promise<ProductPageSearchParams>;
}

/**
 * Normalize a search-param value (which can be `string | string[] | undefined`)
 * into a trimmed string id, or `undefined` when missing.
 */
function resolveProductId(
  raw: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(raw)) {
    return raw[0]?.trim() || undefined;
  }
  return raw?.trim() || undefined;
}

/**
 * Extract the product id from the URL search params.
 *
 * The storefront links append `?productId=<id>` to the product page, so the
 * id is the canonical identifier. Falls back to the path slug only when the
 * search param is missing, so direct visits to `/products/<slug>` keep
 * working while the data fetch uses id-based logic everywhere else.
 */
function pickProductId(
  search: ProductPageSearchParams,
  fallbackSlug: string,
): string {
  return (
    resolveProductId(search.productId) ??
    resolveProductId(search.id) ??
    fallbackSlug.trim()
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const [{ productTitle }, search] = await Promise.all([params, searchParams]);
  const productId = pickProductId(search, productTitle);
  const res = await globalRequest({
    endpoint: `/api/products/${productId}`,
  });

  const product: Product | null = res?.data?.data ?? null;

  if (!product) {
    return getSharedMetadata(
      "CYPHER - Product Not Found",
      "The product you're looking for doesn't exist or has been removed.",
    );
  }

  const title = `CYPHER - ${product.title}`;
  const description =
    product.shortDescription ??
    (product.description ? product.description.slice(0, 160) : null) ??
    "Discover this product on CYPHER.";

  return getSharedMetadata(title, description);
}

export default async function Page({ params, searchParams }: ProductPageProps) {
  const { productId } = await searchParams;
  const res = await globalRequest({
    endpoint: `/api/products/${productId}`,
  });

  const product: Product | null = res?.data?.data ?? null;

  if (!product) {
    notFound();
  }

  return <ProductPage product={product} />;
}
