/* eslint-disable @typescript-eslint/no-explicit-any */
import { ORDER_ENDPOINTS } from "./orders.endpoints";
import { getOrderTransport } from "./orders.transport";
import { toOrder } from "../utils/normalize-order";
import type { Order, OrderListResponse, OrderStats, OrderQueryParams } from "../contracts/order.types";
import type { OrderApiError } from "../contracts/order-error.types";

export const ORDER_LIMITS = {
  PAGE_MIN: 1,
  LIMIT_MIN: 1,
  LIMIT_MAX: 100,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  NOTES_MAX: 1000,
} as const;

export const ORDER_SORT_FIELDS: readonly string[] = [
  "createdAt",
  "updatedAt",
  "total",
  "status",
  "orderNumber",
] as const;

function normalizeSortField(field: string | undefined): string {
  if (field && ORDER_SORT_FIELDS.includes(field)) return field;
  return "createdAt";
}

function normalizeOrder(order: string | undefined): "ASC" | "DESC" {
  return order === "ASC" ? "ASC" : "DESC";
}

function buildOrderQueryParams(params: OrderQueryParams): string {
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

export async function getOrderHistoryApi(
  params: OrderQueryParams = {},
): Promise<OrderListResponse> {
  const transport = getOrderTransport();
  const qs = buildOrderQueryParams(params);
  const endpoint = `${ORDER_ENDPOINTS.USER_LIST}?${qs}`;
  const raw = await transport.get<any>(endpoint);
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

export async function getOrderByIdApi(id: string): Promise<Order> {
  const transport = getOrderTransport();
  const raw = await transport.get(ORDER_ENDPOINTS.DETAIL(id));
  return toOrder(raw);
}

export async function createOrderApi(
  dto: { items: Array<{ productId: string; quantity: number }>; shippingAddress: any; notes?: string; couponCode?: string },
): Promise<Order> {
  const transport = getOrderTransport();
  const raw = await transport.post<any>(ORDER_ENDPOINTS.CREATE, dto);
  return toOrder(raw);
}

export async function cancelOrderApi(id: string): Promise<Order> {
  const transport = getOrderTransport();
  const raw = await transport.post(ORDER_ENDPOINTS.CANCEL(id));
  return toOrder(raw);
}

export async function getAdminOrdersApi(
  params: OrderQueryParams = {},
): Promise<OrderListResponse> {
  const transport = getOrderTransport();
  const qs = buildOrderQueryParams(params);
  const endpoint = `${ORDER_ENDPOINTS.ADMIN_LIST}?${qs}`;
  const raw = await transport.get<any>(endpoint);
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

export async function getAdminOrderByIdApi(id: string): Promise<Order> {
  const transport = getOrderTransport();
  const raw = await transport.get(ORDER_ENDPOINTS.ADMIN_DETAIL(id));
  return toOrder(raw);
}

export async function updateOrderStatusApi(
  id: string,
  dto: { status: string; reason?: string },
): Promise<Order> {
  const transport = getOrderTransport();
  const raw = await transport.patch(ORDER_ENDPOINTS.ADMIN_UPDATE_STATUS(id), dto);
  return toOrder(raw);
}

export async function getOrderStatsApi(): Promise<OrderStats> {
  const transport = getOrderTransport();
  const raw = await transport.get(ORDER_ENDPOINTS.ADMIN_STATS);
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
