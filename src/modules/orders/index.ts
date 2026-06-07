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
  useUserOrdersAdmin,
} from "./hooks/useOrders.hook";

export {
  useOrderFilterStore,
} from "./store/orders.store";

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
} from "./contracts/order.types";

export {
  OrderStatus,
  PaymentStatus,
} from "./contracts/order-status";

export type { OrderFilterState } from "./store/orders.store";

export {
  ORDER_LIMITS,
  ORDER_SORT_FIELDS,
  orderKeys,
  validateCreateOrderDto,
  normalizeSortField,
  normalizeOrder,
  buildOrderQueryParams,
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
} from "./api/orders.api";

export {
  ORDER_ENDPOINTS,
  setOrderTransport,
  getOrderTransport,
} from "./api";

export {
  toOrder,
  toOrderItem,
  toShippingAddress,
  toMoney,
} from "./utils/normalize-order";

export {
  normalizeOrderError,
  parseValidationErrors,
} from "./utils/normalize-error";

export {
  canTransitionStatus,
  isTerminalStatus,
  shouldPoll,
} from "./utils/status-guards";

export {
  formatMoney,
  getCurrencyDivisor,
  centsToUnits,
  unitsToCents,
  isZeroMoney,
  addMoney,
  multiplyMoney,
} from "./utils/money";

export { OrderError } from "./utils/error";
