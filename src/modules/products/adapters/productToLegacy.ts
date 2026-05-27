import type { Product } from "../types/product.types";
import type { ProductType } from "@/app/types/productType";

/**
 * Maps the module's Product (from the real backend) to the legacy ProductType
 * that existing UI components expect. This allows gradual migration without
 * rewriting every component at once.
 */
export function productToLegacy(product: Product): ProductType {
  return {
    id: Number(product.id) || 0,
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
