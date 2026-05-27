/* ─── Enums ─── */

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  PAYPAL = "paypal",
  STRIPE = "stripe",
  BANK_TRANSFER = "bank_transfer",
  CRYPTO = "crypto",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
  CANCELLED = "cancelled",
}

/* ─── Domain Error Codes ─── */

export enum PaymentErrorCode {
  INVALID_INPUT = "INVALID_INPUT",
  AUTH_REQUIRED = "AUTH_REQUIRED",
  RATE_LIMITED = "RATE_LIMITED",
  ALREADY_IN_PROGRESS = "ALREADY_IN_PROGRESS",
  NOT_FOUND = "NOT_FOUND",
  CONFIG_MISSING = "CONFIG_MISSING",
  NETWORK_ERROR = "NETWORK_ERROR",
  STRIPE_ERROR = "STRIPE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/* ─── Money & Core Types ─── */

export interface Money {
  amount: number;
  currency: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: Money;
  fee: Money;
  netAmount: Money;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  description?: string;
  errorMessage?: string;
  refundedAmount?: Money;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryItem {
  id: string;
  orderId: string;
  orderNumber: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: Money;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ─── Payment Intent ─── */

export interface PaymentIntentRequest {
  orderId: string;
  currency?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

/* ─── Checkout Session ─── */

export interface CheckoutSessionRequest {
  orderId: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
  orderId: string;
  expiresAt?: string;
}

/* ─── Confirm Payment ─── */

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}

/* ─── Payment History ─── */

export interface PaymentHistoryResponse {
  data: PaymentHistoryItem[];
  meta: PaginationMeta;
}

/* ─── Payment Methods ─── */

export interface PaymentMethodOption {
  id: string;
  type: PaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
  icon?: string;
}

/* ─── Payment Config ─── */

export interface PaymentConfig {
  publishableKey: string;
  currency: string;
  allowedMethods: PaymentMethod[];
  minAmount: number;
  maxAmount: number;
}

/* ─── Query Params ─── */

export type PaymentSortField = "createdAt" | "amount" | "status" | "method";

export type SortOrder = "ASC" | "DESC";

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  sortBy?: PaymentSortField;
  order?: SortOrder;
  dateFrom?: string;
  dateTo?: string;
}

/* ─── Error & Validation Types ─── */

export interface PaymentApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface NormalizedPaymentError {
  code: PaymentErrorCode;
  message: string;
  status: number;
  retryable: boolean;
  validationErrors?: Record<string, string>;
}

export type ValidationErrorMap = Record<string, string>;

/* ─── Realtime Event Payloads ─── */

export interface PaymentStatusEvent {
  type: "payment_status_changed";
  paymentId: string;
  orderId: string;
  previousStatus: PaymentStatus;
  currentStatus: PaymentStatus;
  timestamp: string;
}

export interface PaymentRealtimeEvent {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  message?: string;
  timestamp: string;
}

export type RealtimeEventCallback = (event: PaymentRealtimeEvent) => void;

/* ─── Payment Module Config ─── */

export interface PaymentsModuleConfig {
  apiUrl: string;
  staleTime?: number;
  gcTime?: number;
  retryCount?: number;
  endpointOverrides?: Partial<Record<keyof typeof import("../constants/payments.constants").PAYMENT_ENDPOINTS, string>>;
}
