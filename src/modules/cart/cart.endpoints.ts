export const CART_ENDPOINTS = {
  GET: "/api/cart",
  ADD_ITEM: "/api/cart/items",
  UPDATE_ITEM: (itemId: string) => `/api/cart/items/${itemId}`,
  REMOVE_ITEM: (itemId: string) => `/api/cart/items/${itemId}`,
  CLEAR: "/api/cart/clear",
  CHECKOUT: "/api/cart/checkout",
  SYNC: "/api/cart/sync",
} as const;
