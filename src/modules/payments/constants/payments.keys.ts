import type { PaymentQueryParams } from "../types/payments.types";

export const paymentKeys = {
  all: ["payments"] as const,
  lists: (userId?: string) =>
    userId
      ? ([...paymentKeys.all, "list", userId] as const)
      : ([...paymentKeys.all, "list"] as const),
  list: (params?: PaymentQueryParams, userId?: string) => {
    const normalized = params ? normalizeQueryParams(params) : undefined;
    const base = userId
      ? ([...paymentKeys.all, "list", userId] as const)
      : ([...paymentKeys.all, "list"] as const);
    return normalized ? [...base, normalized] : base;
  },
  details: (userId?: string) =>
    userId
      ? ([...paymentKeys.all, "detail", userId] as const)
      : ([...paymentKeys.all, "detail"] as const),
  detail: (id: string, userId?: string) => {
    const base = userId
      ? ([...paymentKeys.all, "detail", userId] as const)
      : ([...paymentKeys.all, "detail"] as const);
    return [...base, id] as const;
  },
  config: () => [...paymentKeys.all, "config"] as const,
  methods: () => [...paymentKeys.all, "methods"] as const,
  intent: (orderId: string, userId?: string) => {
    const base = userId
      ? ([...paymentKeys.all, "intent", userId] as const)
      : ([...paymentKeys.all, "intent"] as const);
    return [...base, orderId] as const;
  },
  checkoutSession: (orderId: string, userId?: string) => {
    const base = userId
      ? ([...paymentKeys.all, "checkout", userId] as const)
      : ([...paymentKeys.all, "checkout"] as const);
    return [...base, orderId] as const;
  },
};

function normalizeQueryParams(params: PaymentQueryParams): Record<string, string> {
  const query: Record<string, string> = {
    page: String(Math.max(params.page ?? 1, 1)),
    limit: String(Math.min(Math.max(params.limit ?? 20, 1), 100)),
    sortBy: params.sortBy ?? "createdAt",
    order: params.order ?? "DESC",
  };
  if (params.status) query.status = params.status;
  if (params.method) query.method = params.method;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;
  return query;
}
