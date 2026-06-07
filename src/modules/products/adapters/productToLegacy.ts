import type { Product } from "../types/product.types";
import type { ProductType } from "@/app/types/productType";

function hashToNumericId(id: string): number {
  const parsedId = Number(id);
  if (!isNaN(parsedId)) return parsedId;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Maps the module's Product (from the real backend) to the legacy ProductType
 * that existing UI components expect. This allows gradual migration without
 * rewriting every component at once.
 */
export function productToLegacy(product: Product): ProductType {
  return {
    id: hashToNumericId(product.id),
    title: product.title,
    description: product.description,
    price: product.price,
    discountPercentage: product.discountPercentage,
    rating: product.rating,
    stock: product.stock,
    brand: product.brand || "",
    sku: product.sku,
    tags: product.tags,
    images: product.media.map((m) => m.url),
    thumbnail: product.thumbnail || product.media[0]?.url || "",
    reviews: product.reviews.map((r) => ({
      rating: r.rating,
      comment: r.comment,
      date: r.date,
      reviewerName: r.userName,
    })),
    category: product.category?.name || "",
    dimensions: product.dimensions,
    weight: product.weight || 0,
    minimumOrderQuantity: product.minimumOrderQuantity,
    availabilityStatus: product.availabilityStatus,
    quantity: 1,
    meta: {
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    },
    returnPolicy: "",
    shippingInformation: "",
    warrantyInformation: "",
  };
}

export type LegacyProduct = ReturnType<typeof productToLegacy>;
