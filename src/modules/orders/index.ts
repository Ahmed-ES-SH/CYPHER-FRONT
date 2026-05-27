export { OrdersPage } from "./components/pages/OrdersPage";
export { OrderDetailPage } from "./components/pages/OrderDetailPage";

export {
  useCreateOrder,
  useUserOrders,
  useOrderDetail,
  useCancelOrder,
  useAdminOrders,
  useAdminOrderDetail,
  useUpdateOrderStatus,
  useOrderStats,
  useOrderPolling,
  useUserOrdersAdmin,
} from "./orders.hooks";

export {
  useOrderFilterStore,
} from "./orders.store";

export type {
  Order,
  OrderItem,
  OrderSummary,
  OrderListResponse,
  PaginationMeta,
  OrderStats,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryParams,
  OrderSortField,
  SortOrder,
  ShippingAddress,
  Money,
  OrderApiError,
  ValidationErrorMap,
} from "./orders.types";

export {
  OrderStatus,
  PaymentStatus,
} from "./orders.types";

export type { OrderFilterState } from "./orders.store";

export {
  ORDER_LIMITS,
  ORDER_SORT_FIELDS,
  ORDER_ENDPOINTS,
  VALID_STATUS_TRANSITIONS,
  orderKeys,
  setOrderTransport,
  getOrderTransport,
  validateCreateOrderDto,
  canTransitionStatus,
  normalizeOrderError,
  parseValidationErrors,
  normalizeSortField,
  normalizeOrder,
  buildOrderQueryParams,
  toOrder,
  toOrderItem,
  toShippingAddress,
  createOrderApi,
  getUserOrdersApi,
  getOrderByIdApi,
  cancelOrderApi,
  getAdminOrdersApi,
  getAdminOrderByIdApi,
  updateOrderStatusApi,
  getOrderStatsApi,
  invalidateOrderLists,
  invalidateOrderDetail,
  removeOrderDetail,
  invalidateOrderStats,
} from "./orders.api";
