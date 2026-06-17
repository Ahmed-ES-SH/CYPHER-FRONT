import type { Product, ProductMedia } from "../types/product.types";
import { calculateDiscountedPrice, deriveAvailabilityStatus } from "./product-pricing";
import { buildProductSlug } from "./product-slug";

export interface RawProductPayload {
  id: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  discountPercentage?: number;
  discountedPrice?: number;
  stock: number;
  reservedQuantity?: number;
  minimumOrderQuantity?: number;
  categoryId: string;
  category?: Record<string, unknown>;
  brand?: string | null;
  tags?: string[];
  images?: string[];
  media?: ProductMedia[];
  thumbnail?: string;
  dimensions?: { width: number; height: number; depth: number };
  weight?: number;
  rating?: number;
  reviews?: unknown[];
  barcode?: string;
  qrCode?: string;
  isPublished?: boolean;
  availabilityStatus?: string;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export function normalizeProductPayload(raw: RawProductPayload): Product {
  const tags = normalizeTags(raw.tags);
  const images = normalizeImages(raw.images);
  const thumbnail = raw.thumbnail || images[0];
  const price = Math.max(0, Number(raw.price) || 0);
  const discountPercentage = Math.max(
    0,
    Math.min(100, Number(raw.discountPercentage) ?? 0),
  );
  const stock = Math.max(0, Math.floor(raw.stock ?? 0));

  return {
    id: raw.id,
    title: raw.title,
    slug: buildProductSlug(raw.title, raw.slug),
    description: raw.description,
    shortDescription: raw.shortDescription,
    sku: raw.sku,
    price,
    discountPercentage,
    discountedPrice: Number(raw.discountedPrice) ?? calculateDiscountedPrice(price, discountPercentage),
    stock,
    minimumOrderQuantity: Math.max(
      1,
      Math.floor(raw.minimumOrderQuantity ?? 1),
    ),
    categoryId: raw.categoryId,
    category: raw.category as Product["category"] | undefined,
    brand: raw.brand || undefined,
    tags,
    images,
    thumbnail,
    dimensions: raw.dimensions || { width: 0, height: 0, depth: 0 },
    weight: raw.weight != null ? Number(raw.weight) : undefined,
    rating: Math.max(0, Math.min(5, Number(raw.rating) ?? 0)),
    reviews: normalizeReviews(raw.reviews, raw.id),
    isPublished: raw.isPublished ?? true,
    availabilityStatus: raw.availabilityStatus ?? deriveAvailabilityStatus(stock),
    warrantyInformation: raw.warrantyInformation,
    shippingInformation: raw.shippingInformation,
    returnPolicy: raw.returnPolicy,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

function normalizeImages(images?: string[]): string[] {
  if (!images || !Array.isArray(images)) return [];
  return images.filter((img): img is string => typeof img === "string" && img.length > 0);
}

export function normalizeTags(tags?: string[]): string[] {
  if (!tags || !Array.isArray(tags)) return [];
  return [
    ...new Set(
      tags
        .filter(
          (t): t is string => typeof t === "string" && t.trim().length > 0,
        )
        .map((t) => t.trim().toLowerCase()),
    ),
  ];
}

export function normalizeMediaUrls(
  media?: (string | ProductMedia)[] | undefined,
): ProductMedia[] {
  if (!media || !Array.isArray(media)) return [];

  return media.map((item) => {
    if (typeof item === "string") {
      return { url: item };
    }
    return {
      url: item.url,
      alt: item.alt,
      isPrimary: item.isPrimary,
    };
  });
}

function normalizeReviews(
  reviews?: unknown[],
  productId?: string,
): Product["reviews"] {
  if (!reviews || !Array.isArray(reviews)) return [];
  return reviews.map((r, i) => {
    const review = r as Record<string, unknown>;
    return {
      id: (review.id as string) || `${productId}-review-${i}`,
      productId: productId || "",
      userId: (review.userId as string) || "",
      userName:
        (review.userName as string) ||
        (review.reviewerName as string) ||
        "Anonymous",
      rating: Math.max(0, Math.min(5, Number(review.rating) || 0)),
      comment: (review.comment as string) || "",
      date: (review.date as string) || new Date().toISOString(),
    };
  });
}

export function coercePagination(
  raw: Record<string, unknown>,
): { page: number; limit: number; total: number; totalPages: number } {
  return {
    page: Math.max(1, raw?.page != null ? Number(raw.page) : 1),
    limit: Math.max(1, Math.min(100, raw?.limit != null ? Number(raw.limit) : 10)),
    total: Math.max(0, raw?.total != null ? Number(raw.total) : 0),
    totalPages: Math.max(
      1,
      raw?.totalPages != null
        ? Number(raw.totalPages)
        : raw?.lastPage != null
          ? Number(raw.lastPage)
          : 1,
    ),
  };
}
