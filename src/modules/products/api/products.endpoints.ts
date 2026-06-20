export const PRODUCTS_ENDPOINTS = {
  PUBLIC_LIST: "/api/products",
  PUBLIC_BY_ID: (id: string) => `/api/products/${id}`,
  PUBLIC_BY_CATEGORY: (categorySlug: string) =>
    `/api/products/category/${categorySlug}`,
  FILTER_OPTIONS: "/api/products/filter-options",
  ADMIN_LIST: "/api/admin/products",
  ADMIN_GET: (id: string) => `/api/admin/products/${id}`,
  CREATE: "/api/admin/products",
  UPDATE: (id: string) => `/api/admin/products/${id}`,
  TOGGLE_PUBLISH: (id: string) => `/api/admin/products/${id}/publish`,
  DELETE: (id: string) => `/api/admin/products/${id}`,
} as const;
