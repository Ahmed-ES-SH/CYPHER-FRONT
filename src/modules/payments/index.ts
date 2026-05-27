/* ─── Types ─── */

export type {
  PaymentTransaction,
  PaymentHistoryItem,
  PaymentHistoryResponse,
  PaginationMeta,
  PaymentIntentRequest,
  PaymentIntentResponse,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  ConfirmPaymentRequest,
  PaymentMethodOption,
  PaymentConfig,
  PaymentQueryParams,
  PaymentSortField,
  SortOrder,
  Money,
  PaymentApiError,
  NormalizedPaymentError,
  ValidationErrorMap,
  PaymentStatusEvent,
  PaymentRealtimeEvent,
  RealtimeEventCallback,
  PaymentsModuleConfig,
} from "./types/payments.types";

export {
  PaymentMethod,
  PaymentStatus,
  PaymentErrorCode,
} from "./types/payments.types";

/* ─── Config ─── */

export {
  getPaymentsConfig,
  resetPaymentsConfig,
} from "./config/payments.config";

export type { PaymentsConfig } from "./config/payments.config";

/* ─── Constants ─── */

export {
  PAYMENT_LIMITS,
  PAYMENT_SORT_FIELDS,
  PAYMENT_ENDPOINTS,
  PAYMENT_REQUEST_TIMEOUT,
  PAYMENT_DEFAULTS,
} from "./constants/payments.constants";

export type { ErrorCodeInfo } from "./constants/payments.errors";

export { ERROR_CODE_MAP } from "./constants/payments.errors";

export { paymentKeys } from "./constants/payments.keys";

/* ─── API ─── */

export {
  validatePaymentConfig,
  normalizeSortField,
  normalizeOrder,
  buildPaymentQueryParams,
  parseValidationErrors,
  toPaymentTransaction,
  toPaymentHistoryItem,
  createPaymentIntentApi,
  createCheckoutSessionApi,
  confirmPaymentApi,
  getPaymentHistoryApi,
  getPaymentTransactionApi,
  getPaymentMethodsApi,
  getPaymentConfigApi,
  getAdminPaymentHistoryApi,
  getAdminPaymentTransactionApi,
  refundPaymentApi,
  invalidatePaymentLists,
  invalidatePaymentDetail,
} from "./api/payments.api";

export {
  getPaymentsClient,
  resetPaymentsClient,
} from "./api/payments.client";

/* ─── Utils ─── */

export { normalizePaymentError } from "./utils/normalizePaymentError";

export {
  isMoney,
  isPaymentMethod,
  isPaymentStatus,
  isPaymentErrorCode,
  isPaymentTransaction,
  isPaymentHistoryItem,
  isPaymentIntentResponse,
  isCheckoutSessionResponse,
  isNormalizedPaymentError,
  isValidSortField,
} from "./utils/paymentGuards";

/* ─── Hooks ─── */

export { useCreatePaymentIntent } from "./hooks/useCreatePaymentIntent";
export { useCheckoutSession } from "./hooks/useCheckoutSession";
export { usePaymentHistory, usePaymentTransaction } from "./hooks/usePaymentHistory";
export { useConfirmPayment } from "./hooks/useConfirmPayment";
export { usePaymentMethods } from "./hooks/usePaymentMethods";
export { usePaymentConfig } from "./hooks/usePaymentConfig";
export { useAdminPaymentHistory } from "./hooks/useAdminPaymentHistory";
export { useAdminPaymentTransaction } from "./hooks/useAdminPaymentTransaction";
export { useRefundPayment } from "./hooks/useRefundPayment";

/* ─── Realtime (optional) ─── */

export {
  usePaymentRealtime,
  setPaymentRealtimeAdapter,
  getPaymentRealtimeAdapter,
  clearPaymentRealtimeAdapter,
} from "./hooks/usePaymentRealtime";

export type { PaymentRealtimeAdapter } from "./hooks/usePaymentRealtime";

/* ─── Services ─── */

export {
  requestPaymentIntent,
  requestCheckoutSession,
  confirmPayment,
  fetchPaymentHistory,
  fetchPaymentTransaction,
  isRetryableError,
  isAuthError,
  isRateLimited,
  isInProgress,
} from "./services/payments.service";

export type { PaymentServiceResult } from "./services/payments.service";

/* ─── Store ─── */

export { usePaymentFilterStore } from "./store/payments.store";
export type { PaymentFilterState } from "./store/payments.store";
