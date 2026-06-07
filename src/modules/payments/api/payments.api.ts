import { getPaymentsConfig } from "../config/payments.config";
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
import { normalizePaymentError } from "../utils/normalizePaymentError";
import { globalRequest } from "@/app/helpers/globalRequest";

/* ─── Transport Layer ─── */

async function paymentsRequest<TResult = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  if (typeof window !== "undefined") {
    const config = getPaymentsConfig();
    const url = `${config.apiUrl}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw normalizePaymentError({
        isAxiosError: true,
        response: { status: response.status, data },
        message: data?.message ?? `HTTP ${response.status}`,
      });
    }
    return data as TResult;
  }

  const res = await globalRequest<unknown, TResult>({ endpoint, method, body });
  if (!res.success) {
    throw normalizePaymentError({
      isAxiosError: true,
      response: {
        status: res.statusCode ?? 500,
        data: { message: res.message, errors: res.errors },
      },
      message: res.message,
    });
  }
  return res.data as TResult;
}

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

interface RawPaymentTransaction {
  id?: string | number;
  orderId?: string;
  order_id?: string;
  orderNumber?: string;
  order_number?: string;
  method?: string;
  payment_method?: string;
  status?: string;
  amount?: number | { amount: number; currency: string };
  fee?: number | { amount: number; currency: string };
  netAmount?: number | { amount: number; currency: string };
  net_amount?: number | { amount: number; currency: string };
  stripePaymentIntentId?: string;
  stripe_payment_intent_id?: string;
  stripeClientSecret?: string;
  stripe_client_secret?: string;
  description?: string;
  errorMessage?: string;
  error_message?: string;
  refundedAmount?: number | { amount: number; currency: string };
  refunded_amount?: number | { amount: number; currency: string };
  metadata?: Record<string, string>;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

function getAmount(raw: Record<string, unknown>, key: string): number {
  const val = raw[key] ?? raw[snake(key)];
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "object" && val !== null) return (val as { amount?: number }).amount ?? 0;
  return Number(val) || 0;
}

function getCurrency(raw: Record<string, unknown>, key: string): string {
  const val = raw[key] ?? raw[snake(key)];
  if (val == null) return "usd";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) return (val as { currency?: string }).currency ?? "usd";
  return "usd";
}

function snake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function toPaymentTransaction(raw: unknown): PaymentTransaction {
  const data = (raw ?? {}) as RawPaymentTransaction;
  return {
    id: String(data.id ?? ""),
    orderId: String(data.orderId ?? data.order_id ?? ""),
    orderNumber: String(data.orderNumber ?? data.order_number ?? ""),
    method: (data.method ?? data.payment_method ?? PaymentMethod.STRIPE) as PaymentMethod,
    status: (data.status ?? PaymentStatus.PENDING) as PaymentStatus,
    amount: {
      amount: getAmount(data as Record<string, unknown>, "amount"),
      currency: getCurrency(data as Record<string, unknown>, "amount"),
    },
    fee: {
      amount: getAmount(data as Record<string, unknown>, "fee"),
      currency: getCurrency(data as Record<string, unknown>, "fee"),
    },
    netAmount: {
      amount: getAmount(data as Record<string, unknown>, "netAmount"),
      currency: getCurrency(data as Record<string, unknown>, "netAmount"),
    },
    stripePaymentIntentId: data.stripePaymentIntentId ?? data.stripe_payment_intent_id ?? undefined,
    stripeClientSecret: data.stripeClientSecret ?? data.stripe_client_secret ?? undefined,
    description: data.description ?? undefined,
    errorMessage: data.errorMessage ?? data.error_message ?? undefined,
    refundedAmount: data.refundedAmount ?? data.refunded_amount
      ? {
          amount: getAmount(data as Record<string, unknown>, "refundedAmount"),
          currency: getCurrency(data as Record<string, unknown>, "refundedAmount"),
        }
      : undefined,
    metadata: data.metadata ?? undefined,
    createdAt: String(data.createdAt ?? data.created_at ?? ""),
    updatedAt: String(data.updatedAt ?? data.updated_at ?? ""),
  };
}

export function toPaymentHistoryItem(raw: unknown): PaymentHistoryItem {
  const data = (raw ?? {}) as RawPaymentTransaction;
  return {
    id: String(data.id ?? ""),
    orderId: String(data.orderId ?? data.order_id ?? ""),
    orderNumber: String(data.orderNumber ?? data.order_number ?? ""),
    method: (data.method ?? PaymentMethod.STRIPE) as PaymentMethod,
    status: (data.status ?? PaymentStatus.PENDING) as PaymentStatus,
    amount: {
      amount: getAmount(data as Record<string, unknown>, "amount"),
      currency: getCurrency(data as Record<string, unknown>, "amount"),
    },
    createdAt: String(data.createdAt ?? data.created_at ?? ""),
  };
}

/* ─── Raw API Functions ─── */

export async function createPaymentIntentApi(
  request: PaymentIntentRequest,
): Promise<PaymentIntentResponse> {
  return paymentsRequest<PaymentIntentResponse>(PAYMENT_ENDPOINTS.CREATE_INTENT, "POST", request);
}

export async function createCheckoutSessionApi(
  request: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  return paymentsRequest<CheckoutSessionResponse>(PAYMENT_ENDPOINTS.CREATE_CHECKOUT_SESSION, "POST", request);
}

export async function confirmPaymentApi(
  request: ConfirmPaymentRequest,
): Promise<PaymentTransaction> {
  const data = await paymentsRequest<Record<string, unknown>>(PAYMENT_ENDPOINTS.CONFIRM, "POST", request);
  return toPaymentTransaction(data);
}

export async function getPaymentHistoryApi(
  params: PaymentQueryParams = {},
): Promise<PaymentHistoryResponse> {
  const qs = buildPaymentQueryParams(params);
  const endpoint = `${PAYMENT_ENDPOINTS.HISTORY}?${qs}`;
  const data = await paymentsRequest<Record<string, unknown>>(endpoint);
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
  const data = await paymentsRequest<Record<string, unknown>>(PAYMENT_ENDPOINTS.TRANSACTION(id));
  return toPaymentTransaction(data);
}

export async function getPaymentMethodsApi(): Promise<PaymentMethodOption[]> {
  const data = await paymentsRequest<Record<string, unknown>>(PAYMENT_ENDPOINTS.METHODS);
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
  const raw = await paymentsRequest<Record<string, unknown>>(PAYMENT_ENDPOINTS.CONFIG);
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
  const qs = buildPaymentQueryParams(params);
  const endpoint = `${PAYMENT_ENDPOINTS.ADMIN_HISTORY}?${qs}`;
  const data = await paymentsRequest<Record<string, unknown>>(endpoint);
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
  const data = await paymentsRequest<Record<string, unknown>>(PAYMENT_ENDPOINTS.ADMIN_TRANSACTION(id));
  return toPaymentTransaction(data);
}

export async function refundPaymentApi(
  id: string,
): Promise<PaymentTransaction> {
  const data = await paymentsRequest<Record<string, unknown>>(PAYMENT_ENDPOINTS.REFUND(id), "POST");
  return toPaymentTransaction(data);
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
