import { getPaymentsClient } from "./payments.client";
import { PAYMENT_LIMITS, PAYMENT_ENDPOINTS, PAYMENT_SORT_FIELDS } from "../constants/payments.constants";
import type {
  PaymentTransaction,
  PaymentHistoryItem,
  PaymentHistoryResponse,
  PaymentIntentRequest,
  PaymentIntentResponse,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  ConfirmPaymentRequest,
  PaymentMethodOption,
  PaymentQueryParams,
  PaymentSortField,
  SortOrder,
  PaymentConfig,
  PaymentApiError,
  ValidationErrorMap,
} from "../types/payments.types";
import { PaymentMethod, PaymentStatus } from "../types/payments.types";

/* ─── Validation ─── */

export function validatePaymentConfig(config: Partial<PaymentConfig>): ValidationErrorMap {
  const errors: ValidationErrorMap = {};

  if (!config.publishableKey) {
    errors.publishableKey = "Publishable key is required";
  }

  if (config.currency && !/^[a-z]{3}$/.test(config.currency)) {
    errors.currency = "Currency must be a 3-letter ISO code";
  }

  if (config.minAmount !== undefined && config.minAmount < PAYMENT_LIMITS.MIN_AMOUNT) {
    errors.minAmount = `Minimum amount must be at least ${PAYMENT_LIMITS.MIN_AMOUNT}`;
  }

  if (config.maxAmount !== undefined && config.maxAmount > PAYMENT_LIMITS.MAX_AMOUNT) {
    errors.maxAmount = `Maximum amount must be at most ${PAYMENT_LIMITS.MAX_AMOUNT}`;
  }

  if (
    config.minAmount !== undefined &&
    config.maxAmount !== undefined &&
    config.minAmount > config.maxAmount
  ) {
    errors.maxAmount = "Maximum amount must be greater than minimum amount";
  }

  return errors;
}

export function normalizeSortField(field: string | undefined): PaymentSortField {
  if (field && (PAYMENT_SORT_FIELDS as readonly string[]).includes(field)) {
    return field as PaymentSortField;
  }
  return "createdAt";
}

export function normalizeOrder(order: string | undefined): SortOrder {
  return order === "ASC" ? "ASC" : "DESC";
}

export function buildPaymentQueryParams(params: PaymentQueryParams): string {
  const searchParams = new URLSearchParams();

  searchParams.set(
    "page",
    String(Math.max(params.page ?? PAYMENT_LIMITS.DEFAULT_PAGE, PAYMENT_LIMITS.PAGE_MIN)),
  );
  searchParams.set(
    "limit",
    String(
      Math.min(
        Math.max(params.limit ?? PAYMENT_LIMITS.DEFAULT_LIMIT, PAYMENT_LIMITS.LIMIT_MIN),
        PAYMENT_LIMITS.LIMIT_MAX,
      ),
    ),
  );
  searchParams.set("sortBy", normalizeSortField(params.sortBy));
  searchParams.set("order", normalizeOrder(params.order));

  if (params.status) searchParams.set("status", params.status);
  if (params.method) searchParams.set("method", params.method);
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);

  return searchParams.toString();
}

export function parseValidationErrors(errors?: Record<string, string[]>): ValidationErrorMap {
  if (!errors) return {};
  const map: ValidationErrorMap = {};
  for (const [field, messages] of Object.entries(errors)) {
    map[field] = messages[0] ?? "Invalid value";
  }
  return map;
}

/* ─── Normalization / Mapping ─── */

function getAmount(raw: any, key: string): number {
  const val = raw[key] ?? raw[snake(key)];
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "object") return val.amount ?? 0;
  return Number(val) || 0;
}

function getCurrency(raw: any, key: string): string {
  const val = raw[key] ?? raw[snake(key)];
  if (val == null) return "usd";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.currency ?? "usd";
  return "usd";
}

function snake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function toPaymentTransaction(raw: any): PaymentTransaction {
  return {
    id: String(raw.id ?? ""),
    orderId: String(raw.orderId ?? raw.order_id ?? ""),
    orderNumber: String(raw.orderNumber ?? raw.order_number ?? ""),
    method: raw.method ?? raw.payment_method ?? PaymentMethod.STRIPE,
    status: raw.status ?? raw.status ?? PaymentStatus.PENDING,
    amount: {
      amount: getAmount(raw, "amount"),
      currency: getCurrency(raw, "amount"),
    },
    fee: {
      amount: getAmount(raw, "fee"),
      currency: getCurrency(raw, "fee"),
    },
    netAmount: {
      amount: getAmount(raw, "netAmount"),
      currency: getCurrency(raw, "netAmount"),
    },
    stripePaymentIntentId: raw.stripePaymentIntentId ?? raw.stripe_payment_intent_id ?? undefined,
    stripeClientSecret: raw.stripeClientSecret ?? raw.stripe_client_secret ?? undefined,
    description: raw.description ?? undefined,
    errorMessage: raw.errorMessage ?? raw.error_message ?? undefined,
    refundedAmount: raw.refundedAmount ?? raw.refunded_amount
      ? {
          amount: getAmount(raw, "refundedAmount"),
          currency: getCurrency(raw, "refundedAmount"),
        }
      : undefined,
    metadata: raw.metadata ?? undefined,
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  };
}

export function toPaymentHistoryItem(raw: any): PaymentHistoryItem {
  return {
    id: String(raw.id ?? ""),
    orderId: String(raw.orderId ?? raw.order_id ?? ""),
    orderNumber: String(raw.orderNumber ?? raw.order_number ?? ""),
    method: raw.method ?? PaymentMethod.STRIPE,
    status: raw.status ?? PaymentStatus.PENDING,
    amount: {
      amount: getAmount(raw, "amount"),
      currency: getCurrency(raw, "amount"),
    },
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
  };
}

/* ─── Raw API Functions ─── */

export async function createPaymentIntentApi(
  request: PaymentIntentRequest,
): Promise<PaymentIntentResponse> {
  const client = getPaymentsClient();
  const res = await client.post(PAYMENT_ENDPOINTS.CREATE_INTENT, request);
  return res.data as PaymentIntentResponse;
}

export async function createCheckoutSessionApi(
  request: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  const client = getPaymentsClient();
  const res = await client.post(PAYMENT_ENDPOINTS.CREATE_CHECKOUT_SESSION, request);
  return res.data as CheckoutSessionResponse;
}

export async function confirmPaymentApi(
  request: ConfirmPaymentRequest,
): Promise<PaymentTransaction> {
  const client = getPaymentsClient();
  const res = await client.post(PAYMENT_ENDPOINTS.CONFIRM, request);
  return toPaymentTransaction(res.data as Record<string, unknown>);
}

export async function getPaymentHistoryApi(
  params: PaymentQueryParams = {},
): Promise<PaymentHistoryResponse> {
  const client = getPaymentsClient();
  const qs = buildPaymentQueryParams(params);
  const endpoint = `${PAYMENT_ENDPOINTS.HISTORY}?${qs}`;
  const res = await client.get(endpoint);
  const data = res.data as Record<string, unknown>;
  return {
    data: ((data.data ?? []) as Record<string, unknown>[]).map(toPaymentHistoryItem),
    meta: (data.meta as PaymentHistoryResponse["meta"]) ?? {
      page: params.page ?? PAYMENT_LIMITS.DEFAULT_PAGE,
      limit: params.limit ?? PAYMENT_LIMITS.DEFAULT_LIMIT,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getPaymentTransactionApi(
  id: string,
): Promise<PaymentTransaction> {
  const client = getPaymentsClient();
  const res = await client.get(PAYMENT_ENDPOINTS.TRANSACTION(id));
  return toPaymentTransaction(res.data as Record<string, unknown>);
}

export async function getPaymentMethodsApi(): Promise<PaymentMethodOption[]> {
  const client = getPaymentsClient();
  const res = await client.get(PAYMENT_ENDPOINTS.METHODS);
  const data = res.data as Record<string, unknown>;
  const items = (data.data ?? data ?? []) as Record<string, unknown>[];
  return items.map((item) => ({
    id: String(item.id),
    type: (item.type ?? item.method ?? PaymentMethod.STRIPE) as PaymentMethod,
    label: String(item.label ?? item.type ?? item.method ?? ""),
    description: String(item.description ?? ""),
    enabled: (item.enabled as boolean) ?? true,
    icon: item.icon as string | undefined,
  }));
}

export async function getPaymentConfigApi(): Promise<PaymentConfig> {
  const client = getPaymentsClient();
  const res = await client.get(PAYMENT_ENDPOINTS.CONFIG);
  const raw = res.data as Record<string, unknown>;
  return {
    publishableKey: String(raw.publishableKey ?? raw.publishable_key ?? ""),
    currency: String(raw.currency ?? "usd"),
    allowedMethods: (raw.allowedMethods ?? raw.allowed_methods ?? []) as PaymentMethod[],
    minAmount: (raw.minAmount ?? raw.min_amount ?? PAYMENT_LIMITS.MIN_AMOUNT) as number,
    maxAmount: (raw.maxAmount ?? raw.max_amount ?? PAYMENT_LIMITS.MAX_AMOUNT) as number,
  };
}

/* ─── Admin API Functions ─── */

export async function getAdminPaymentHistoryApi(
  params: PaymentQueryParams = {},
): Promise<PaymentHistoryResponse> {
  const client = getPaymentsClient();
  const qs = buildPaymentQueryParams(params);
  const endpoint = `${PAYMENT_ENDPOINTS.ADMIN_HISTORY}?${qs}`;
  const res = await client.get(endpoint);
  const data = res.data as Record<string, unknown>;
  return {
    data: ((data.data ?? []) as Record<string, unknown>[]).map(toPaymentHistoryItem),
    meta: (data.meta as PaymentHistoryResponse["meta"]) ?? {
      page: params.page ?? PAYMENT_LIMITS.DEFAULT_PAGE,
      limit: params.limit ?? PAYMENT_LIMITS.DEFAULT_LIMIT,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getAdminPaymentTransactionApi(
  id: string,
): Promise<PaymentTransaction> {
  const client = getPaymentsClient();
  const res = await client.get(PAYMENT_ENDPOINTS.ADMIN_TRANSACTION(id));
  return toPaymentTransaction(res.data as Record<string, unknown>);
}

export async function refundPaymentApi(
  id: string,
): Promise<PaymentTransaction> {
  const client = getPaymentsClient();
  const res = await client.post(PAYMENT_ENDPOINTS.REFUND(id));
  return toPaymentTransaction(res.data as Record<string, unknown>);
}

/* ─── Cache Invalidation Helpers ─── */

import type { QueryClient } from "@tanstack/react-query";
import { paymentKeys } from "../constants/payments.keys";

export function invalidatePaymentLists(queryClient: QueryClient, params?: PaymentQueryParams) {
  if (params) {
    queryClient.invalidateQueries({ queryKey: paymentKeys.list(params) });
    return;
  }
  queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
}

export function invalidatePaymentDetail(queryClient: QueryClient, id: string) {
  queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) });
}
