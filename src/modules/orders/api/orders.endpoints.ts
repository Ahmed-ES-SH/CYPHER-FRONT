export const ORDER_ENDPOINTS = {
  LIST: "/api/orders",
  CREATE: "/api/orders",
  DETAIL: (id: string) => `/api/orders/${id}`,
  CANCEL: (id: string) => `/api/orders/${id}/cancel`,
  USER_LIST: "/api/orders",
  ADMIN_LIST: "/api/admin/orders",
  ADMIN_DETAIL: (id: string) => `/api/admin/orders/${id}`,
  ADMIN_UPDATE_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
  ADMIN_STATS: "/api/admin/orders/stats",
} as const;

export const CHECKOUT_ENDPOINTS = {
  CREATE_SESSION: "/api/payments/checkout-session",
  SESSION_STATUS: (sessionId: string) => `/api/payments/checkout-session/${sessionId}`,
} as const;
