import type { RawProductPayload } from "../../src/modules/products/transformers/product.mapper";

/**
 * Raw product payloads matching what the backend API returns.
 * These get processed by normalizeProductPayload in the frontend
 * before reaching UI components.
 */

export const SAMPLE_PRODUCT: RawProductPayload = {
  id: "prod-1",
  title: "Test Wireless Headphones",
  description: "High-quality wireless headphones with noise cancellation.",
  sku: "TWH-001",
  price: 79.99,
  discountPercentage: 15,
  stock: 25,
  minimumOrderQuantity: 1,
  categoryId: "cat-1",
  category: { id: "cat-1", name: "Electronics", slug: "electronics", description: "", color: "", icon: "", order: 0, createdAt: "", updatedAt: "" },
  brand: "TestBrand",
  tags: ["headphones", "wireless", "audio"],
  images: ["https://via.placeholder.com/300x200?text=Headphones"],
  thumbnail: "https://via.placeholder.com/300x200?text=Headphones",
  dimensions: { width: 0, height: 0, depth: 0 },
  weight: 0.5,
  rating: 4.5,
  reviews: [
    { date: "2025-01-01T00:00:00.000Z", rating: 5, comment: "Great!", reviewerName: "Test User", reviewerEmail: "test@test.com" },
  ],
  isPublished: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

export const SAMPLE_PRODUCT_2: RawProductPayload = {
  ...SAMPLE_PRODUCT,
  id: "prod-2",
  title: "Test Smartphone Case",
  description: "Durable protective case for smartphones.",
  price: 19.99,
  discountPercentage: 0,
  stock: 50,
  sku: "TSC-002",
  tags: ["accessories", "phone case"],
  images: ["https://via.placeholder.com/300x200?text=Case"],
  thumbnail: "https://via.placeholder.com/300x200?text=Case",
  rating: 4.0,
  reviews: [],
};

export const LOW_STOCK_PRODUCT: RawProductPayload = {
  ...SAMPLE_PRODUCT,
  id: "prod-3",
  title: "Test Low Stock Item",
  description: "This item has very low stock.",
  price: 9.99,
  discountPercentage: 0,
  stock: 3,
  sku: "TLS-003",
  minimumOrderQuantity: 1,
  rating: 3.5,
  images: ["https://via.placeholder.com/300x200?text=LowStock"],
  thumbnail: "https://via.placeholder.com/300x200?text=LowStock",
  reviews: [],
};

export const OUT_OF_STOCK_PRODUCT: RawProductPayload = {
  ...SAMPLE_PRODUCT,
  id: "prod-4",
  title: "Test Out of Stock Item",
  description: "This item is out of stock.",
  price: 49.99,
  discountPercentage: 10,
  stock: 0,
  sku: "TOS-004",
  minimumOrderQuantity: 1,
  rating: 2.0,
  images: ["https://via.placeholder.com/300x200?text=OutOfStock"],
  thumbnail: "https://via.placeholder.com/300x200?text=OutOfStock",
  reviews: [],
};

export const ALL_PRODUCTS = [SAMPLE_PRODUCT, SAMPLE_PRODUCT_2, LOW_STOCK_PRODUCT, OUT_OF_STOCK_PRODUCT];

export const API_ENDPOINTS = {
  PRODUCTS: "**/api/products*",
  PRODUCT_BY_ID: "**/api/products/*",
  CHECKOUT: "**/api/checkout",
  AUTH_CURRENT_USER: "**/auth/current-user",
  AUTH_LOGIN: "**/auth/login",
};

/**
 * Mock response for the products list API.
 * The globalRequest helper expects { success: true, data: ... } at the top level,
 * but page.route() fulfills with the raw response body that the backend returns.
 * The backend returns { data: [...], pagination: {...} }.
 */
export function mockProductsResponse(products = ALL_PRODUCTS, page = 1, limit = 16) {
  return {
    data: products,
    pagination: {
      page,
      limit,
      total: products.length,
      totalPages: 1,
    },
  };
}

export function createGuestCartState(items: Array<{ productId: string; quantity: number; price?: number; stock?: number }>) {
  const productMap: Record<string, RawProductPayload> = {};
  for (const p of ALL_PRODUCTS) {
    productMap[p.id] = p;
  }
  return {
    state: {
      guestItems: items.map((item) => {
        const product = productMap[item.productId];
        return {
          productId: item.productId,
          productName: product?.title ?? "Unknown",
          productSlug: (product as any)?.slug ?? "unknown",
          productImage: product?.thumbnail ?? "",
          // unitPrice.amount is in dollars (not cents) — matches how the app uses it
          unitPrice: { amount: item.price ?? product?.price ?? 0, currency: "usd" },
          quantity: item.quantity,
          stock: item.stock ?? product?.stock ?? 0,
          minimumQuantity: product?.minimumOrderQuantity ?? 1,
          maximumQuantity: (item.stock ?? product?.stock ?? 10),
        };
      }),
    },
    version: 0,
  };
}

export function mockUnauthenticated() {
  return {
    status: 401,
    contentType: "application/json" as const,
    body: JSON.stringify({ message: "Authentication cookie not found" }),
  };
}
