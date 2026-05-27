export const PAYMENT_LIMITS = {
  PAGE_MIN: 1,
  LIMIT_MIN: 1,
  LIMIT_MAX: 100,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MIN_AMOUNT: 50,
  MAX_AMOUNT: 99999999,
  CURRENCY_DEFAULT: "usd",
} as const;

export const PAYMENT_SORT_FIELDS = [
  "createdAt",
  "amount",
  "status",
  "method",
] as const;

export const PAYMENT_ENDPOINTS = {
  CREATE_INTENT: "/api/payments/create-intent",
  CREATE_CHECKOUT_SESSION: "/api/payments/checkout",
  CONFIRM: "/api/payments/confirm",
  HISTORY: "/api/payments/history",
  TRANSACTION: (id: string) => `/api/payments/transactions/${id}`,
  METHODS: "/api/payments/methods",
  CONFIG: "/api/payments/config",
  ADMIN_HISTORY: "/api/admin/payments",
  ADMIN_TRANSACTION: (id: string) => `/api/admin/payments/${id}`,
  REFUND: (id: string) => `/api/admin/payments/${id}/refund`,
} as const;

export const PAYMENT_REQUEST_TIMEOUT = 15_000;

export const PAYMENT_DEFAULTS = {
  STALE_TIME: 30 * 1000,
  GC_TIME: 5 * 60 * 1000,
  RETRY_COUNT: 1,
} as const;
