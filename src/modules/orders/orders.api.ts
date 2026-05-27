/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalRequest } from "@/app/helpers/globalRequest";
import type {
  Order,
  OrderListResponse,
  OrderStats,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryParams,
  OrderSortField,
  SortOrder,
  OrderApiError,
  ValidationErrorMap,
  OrderItem,
  ShippingAddress,
} from "./orders.types";
import { OrderStatus, PaymentStatus } from "./orders.types";

export const ORDER_LIMITS = {
  PAGE_MIN: 1,
  LIMIT_MIN: 1,
  LIMIT_MAX: 100,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  NOTES_MAX: 1000,
} as const;

export const ORDER_SORT_FIELDS: readonly OrderSortField[] = [
  "createdAt",
  "updatedAt",
  "total",
  "status",
  "orderNumber",
] as const;

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export function canTransitionStatus(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

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

export function validateCreateOrderDto(dto: CreateOrderDto): ValidationErrorMap {
  const errors: ValidationErrorMap = {};

  if (!dto.items || dto.items.length === 0) {
    errors.items = "At least one item is required";
  } else {
    dto.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`items.${index}.productId`] = "Product ID is required";
      }
      if (!item.quantity || item.quantity < 1) {
        errors[`items.${index}.quantity`] = "Quantity must be at least 1";
      }
    });
  }

  if (!dto.shippingAddress) {
    errors.shippingAddress = "Shipping address is required";
  } else {
    const addr = dto.shippingAddress;
    if (!addr.fullName) errors["shippingAddress.fullName"] = "Full name is required";
    if (!addr.addressLine1) errors["shippingAddress.addressLine1"] = "Address is required";
    if (!addr.city) errors["shippingAddress.city"] = "City is required";
    if (!addr.postalCode) errors["shippingAddress.postalCode"] = "Postal code is required";
    if (!addr.country) errors["shippingAddress.country"] = "Country is required";
  }

  if (dto.notes && dto.notes.length > ORDER_LIMITS.NOTES_MAX) {
    errors.notes = `Notes must be at most ${ORDER_LIMITS.NOTES_MAX} characters`;
  }

  return errors;
}

export function normalizeSortField(field: string | undefined): OrderSortField {
  if (field && (ORDER_SORT_FIELDS as readonly string[]).includes(field)) {
    return field as OrderSortField;
  }
  return "createdAt";
}

export function normalizeOrder(order: string | undefined): SortOrder {
  return order === "ASC" ? "ASC" : "DESC";
}

export function buildOrderQueryParams(params: OrderQueryParams): string {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(Math.max(params.page ?? ORDER_LIMITS.DEFAULT_PAGE, ORDER_LIMITS.PAGE_MIN)));
  searchParams.set("limit", String(Math.min(Math.max(params.limit ?? ORDER_LIMITS.DEFAULT_LIMIT, ORDER_LIMITS.LIMIT_MIN), ORDER_LIMITS.LIMIT_MAX)));
  searchParams.set("sortBy", normalizeSortField(params.sortBy));
  searchParams.set("order", normalizeOrder(params.order));

  if (params.status) searchParams.set("status", params.status);
  if (params.paymentStatus) searchParams.set("paymentStatus", params.paymentStatus);
  if (params.search) searchParams.set("search", params.search);
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);

  return searchParams.toString();
}

export function normalizeOrderError(error: unknown): OrderApiError {
  if (error && typeof error === "object" && "message" in error) {
    return {
      message: (error as any).message ?? "An unexpected error occurred",
      status: (error as any).status ?? 500,
      errors: (error as any).errors,
    };
  }
  return { message: "An unexpected error occurred", status: 500 };
}

export function parseValidationErrors(errors?: Record<string, string[]>): ValidationErrorMap {
  if (!errors) return {};
  const map: ValidationErrorMap = {};
  for (const [field, messages] of Object.entries(errors)) {
    map[field] = messages[0] ?? "Invalid value";
  }
  return map;
}

interface Transport {
  get<T = any>(endpoint: string): Promise<T>;
  post<T = any>(endpoint: string, body?: unknown): Promise<T>;
  patch<T = any>(endpoint: string, body?: unknown): Promise<T>;
  delete<T = any>(endpoint: string): Promise<T>;
}

async function transportRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    throw { message: res.message, status: res.statusCode ?? 500 } satisfies OrderApiError;
  }
  return res.data as TResult;
}

const defaultTransport: Transport = {
  get: <T>(endpoint: string) => transportRequest<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) => transportRequest<T>(endpoint, "POST", body),
  patch: <T>(endpoint: string, body?: unknown) => transportRequest<T>(endpoint, "PATCH", body),
  delete: <T>(endpoint: string) => transportRequest<T>(endpoint, "DELETE"),
};

let activeTransport: Transport = defaultTransport;

export function setOrderTransport(transport: Transport) {
  activeTransport = transport;
}

export function getOrderTransport(): Transport {
  return activeTransport;
}

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params?: OrderQueryParams) => {
    const normalized = params ? normalizeQueryParams(params) : undefined;
    return [...orderKeys.lists(), normalized].filter((v) => v !== undefined);
  },
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, "stats"] as const,
  userOrders: (userId: string) => [...orderKeys.all, "user", userId] as const,
};

function normalizeQueryParams(params: OrderQueryParams): Record<string, string> {
  const query: Record<string, string> = {
    page: String(Math.max(params.page ?? ORDER_LIMITS.DEFAULT_PAGE, ORDER_LIMITS.PAGE_MIN)),
    limit: String(Math.min(Math.max(params.limit ?? ORDER_LIMITS.DEFAULT_LIMIT, ORDER_LIMITS.LIMIT_MIN), ORDER_LIMITS.LIMIT_MAX)),
    sortBy: normalizeSortField(params.sortBy),
    order: normalizeOrder(params.order),
  };
  if (params.status) query.status = params.status;
  if (params.paymentStatus) query.paymentStatus = params.paymentStatus;
  if (params.search) query.search = params.search;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;
  return query;
}

export function toOrderItem(raw: any): OrderItem {
  return {
    id: raw.id,
    productId: raw.productId ?? raw.product_id ?? "",
    productName: raw.productName ?? raw.product_name ?? "",
    productSlug: raw.productSlug ?? raw.product_slug ?? "",
    productImage: raw.productImage ?? raw.product_image ?? "",
    unitPrice: {
      amount: raw.unitPrice?.amount ?? raw.unit_price?.amount ?? raw.price ?? 0,
      currency: raw.unitPrice?.currency ?? raw.unit_price?.currency ?? "usd",
    },
    quantity: raw.quantity ?? 1,
    subtotal: {
      amount: raw.subtotal?.amount ?? raw.subtotal ?? 0,
      currency: raw.subtotal?.currency ?? raw.unitPrice?.currency ?? "usd",
    },
  };
}

export function toShippingAddress(raw: any): ShippingAddress {
  return {
    fullName: raw.fullName ?? raw.full_name ?? "",
    addressLine1: raw.addressLine1 ?? raw.address_line1 ?? "",
    addressLine2: raw.addressLine2 ?? raw.address_line2 ?? undefined,
    city: raw.city ?? "",
    state: raw.state ?? undefined,
    postalCode: raw.postalCode ?? raw.postal_code ?? "",
    country: raw.country ?? "",
    phone: raw.phone ?? undefined,
  };
}

export function toOrder(raw: any): Order {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber ?? raw.order_number ?? raw.id,
    userId: raw.userId ?? raw.user_id ?? "",
    items: (raw.items ?? []).map(toOrderItem),
    subtotal: {
      amount: raw.subtotal?.amount ?? raw.subtotal ?? 0,
      currency: raw.subtotal?.currency ?? "usd",
    },
    shippingCost: {
      amount: raw.shippingCost?.amount ?? raw.shipping_cost?.amount ?? raw.shippingCost ?? 0,
      currency: raw.shippingCost?.currency ?? raw.shipping_cost?.currency ?? "usd",
    },
    tax: {
      amount: raw.tax?.amount ?? raw.tax ?? 0,
      currency: raw.tax?.currency ?? "usd",
    },
    total: {
      amount: raw.total?.amount ?? raw.total ?? 0,
      currency: raw.total?.currency ?? "usd",
    },
    currency: raw.currency ?? "usd",
    status: raw.status ?? "pending",
    paymentStatus: raw.paymentStatus ?? raw.payment_status ?? PaymentStatus.PENDING,
    shippingAddress: toShippingAddress(raw.shippingAddress ?? raw.shipping_address ?? {}),
    notes: raw.notes ?? undefined,
    couponCode: raw.couponCode ?? raw.coupon_code ?? undefined,
    discountAmount: raw.discountAmount ?? raw.discount_amount
      ? {
          amount: raw.discountAmount?.amount ?? raw.discount_amount?.amount ?? raw.discountAmount ?? raw.discount_amount ?? 0,
          currency: raw.discountAmount?.currency ?? raw.discount_amount?.currency ?? "usd",
        }
      : undefined,
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}

export async function createOrderApi(
  dto: CreateOrderDto,
  transport?: Transport,
): Promise<Order> {
  const t = transport ?? activeTransport;
  const raw = await t.post<any>(ORDER_ENDPOINTS.CREATE, dto);
  return toOrder(raw);
}

export async function getUserOrdersApi(
  params: OrderQueryParams = {},
  transport?: Transport,
): Promise<OrderListResponse> {
  const t = transport ?? activeTransport;
  const qs = buildOrderQueryParams(params);
  const endpoint = `${ORDER_ENDPOINTS.USER_LIST}?${qs}`;
  const raw = await t.get<any>(endpoint);
  return {
    data: (raw.data ?? []).map(toOrder),
    meta: raw.meta ?? {
      page: params.page ?? ORDER_LIMITS.DEFAULT_PAGE,
      limit: params.limit ?? ORDER_LIMITS.DEFAULT_LIMIT,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getOrderByIdApi(
  id: string,
  transport?: Transport,
): Promise<Order> {
  const t = transport ?? activeTransport;
  const raw = await t.get(ORDER_ENDPOINTS.DETAIL(id));
  return toOrder(raw);
}

export async function cancelOrderApi(
  id: string,
  transport?: Transport,
): Promise<Order> {
  const t = transport ?? activeTransport;
  const raw = await t.post(ORDER_ENDPOINTS.CANCEL(id));
  return toOrder(raw);
}

export async function getAdminOrdersApi(
  params: OrderQueryParams = {},
  transport?: Transport,
): Promise<OrderListResponse> {
  const t = transport ?? activeTransport;
  const qs = buildOrderQueryParams(params);
  const endpoint = `${ORDER_ENDPOINTS.ADMIN_LIST}?${qs}`;
  const raw = await t.get<any>(endpoint);
  return {
    data: (raw.data ?? []).map(toOrder),
    meta: raw.meta ?? {
      page: params.page ?? ORDER_LIMITS.DEFAULT_PAGE,
      limit: params.limit ?? ORDER_LIMITS.DEFAULT_LIMIT,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getAdminOrderByIdApi(
  id: string,
  transport?: Transport,
): Promise<Order> {
  const t = transport ?? activeTransport;
  const raw = await t.get(ORDER_ENDPOINTS.ADMIN_DETAIL(id));
  return toOrder(raw);
}

export async function updateOrderStatusApi(
  id: string,
  dto: UpdateOrderStatusDto,
  transport?: Transport,
): Promise<Order> {
  const t = transport ?? activeTransport;
  const raw = await t.patch(ORDER_ENDPOINTS.ADMIN_UPDATE_STATUS(id), dto);
  return toOrder(raw);
}

export async function getOrderStatsApi(
  transport?: Transport,
): Promise<OrderStats> {
  const t = transport ?? activeTransport;
  const raw = await t.get(ORDER_ENDPOINTS.ADMIN_STATS);
  return {
    totalOrders: raw.totalOrders ?? raw.total_orders ?? 0,
    totalRevenue: {
      amount: raw.totalRevenue?.amount ?? raw.total_revenue?.amount ?? raw.totalRevenue ?? 0,
      currency: raw.totalRevenue?.currency ?? raw.total_revenue?.currency ?? "usd",
    },
    pendingOrders: raw.pendingOrders ?? raw.pending_orders ?? 0,
    processingOrders: raw.processingOrders ?? raw.processing_orders ?? 0,
    shippedOrders: raw.shippedOrders ?? raw.shipped_orders ?? 0,
    cancelledOrders: raw.cancelledOrders ?? raw.cancelled_orders ?? 0,
    refundedOrders: raw.refundedOrders ?? raw.refunded_orders ?? 0,
    averageOrderValue: {
      amount: raw.averageOrderValue?.amount ?? raw.average_order_value?.amount ?? raw.averageOrderValue ?? 0,
      currency: raw.averageOrderValue?.currency ?? raw.average_order_value?.currency ?? "usd",
    },
  };
}

import type { QueryClient } from "@tanstack/react-query";

export function invalidateOrderLists(queryClient: QueryClient, params?: OrderQueryParams) {
  if (params) {
    queryClient.invalidateQueries({ queryKey: orderKeys.list(params) });
    return;
  }
  queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
}

export function invalidateOrderDetail(queryClient: QueryClient, id: string) {
  queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
}

export function removeOrderDetail(queryClient: QueryClient, id: string) {
  queryClient.removeQueries({ queryKey: orderKeys.detail(id) });
}

export function invalidateOrderStats(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
}
