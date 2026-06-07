/* eslint-disable @typescript-eslint/no-explicit-any */
import { ORDER_ENDPOINTS } from "./orders.endpoints";
import { getOrderTransport } from "./orders.transport";
import { toOrder } from "../utils/normalize-order";
import type { Order, OrderListResponse, OrderStats, OrderQueryParams, OrderSortField, SortOrder, CreateOrderDto, UpdateOrderStatusDto } from "../contracts/order.types";
import type { ValidationErrorMap } from "../contracts/order-error.types";

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

export function normalizeSortField(field: string | undefined): OrderSortField {
  if (field && (ORDER_SORT_FIELDS as readonly string[]).includes(field)) {
    return field as OrderSortField;
  }
  return "createdAt";
}

export function normalizeOrder(order: string | undefined): SortOrder {
  return order === "ASC" ? "ASC" : "DESC";
}

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

export async function getUserOrdersApi(
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
  dto: CreateOrderDto,
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
  dto: UpdateOrderStatusDto,
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

export function invalidateOrderLists(queryClient: any, params?: OrderQueryParams) {
  if (params) {
    queryClient.invalidateQueries({ queryKey: orderKeys.list(params) });
    return;
  }
  queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
}

export function invalidateOrderDetail(queryClient: any, id: string) {
  queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
}

export function removeOrderDetail(queryClient: any, id: string) {
  queryClient.removeQueries({ queryKey: orderKeys.detail(id) });
}

export function invalidateOrderStats(queryClient: any) {
  queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
}
