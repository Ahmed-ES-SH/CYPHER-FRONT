export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export interface Money {
  amount: number;
  currency: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: Money;
  quantity: number;
  subtotal: Money;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: Money;
  shippingCost: Money;
  tax: Money;
  total: Money;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  notes?: string;
  couponCode?: string;
  discountAmount?: Money;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummary {
  orderNumber: string;
  itemCount: number;
  subtotal: Money;
  total: Money;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface CreateOrderDto {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: ShippingAddress;
  notes?: string;
  couponCode?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  reason?: string;
}

export interface OrderListResponse {
  data: Order[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: Money;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  averageOrderValue: Money;
}

export type OrderSortField = "createdAt" | "updatedAt" | "total" | "status" | "orderNumber";

export type SortOrder = "ASC" | "DESC";

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  sortBy?: OrderSortField;
  order?: SortOrder;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export type ValidationErrorMap = Record<string, string>;
