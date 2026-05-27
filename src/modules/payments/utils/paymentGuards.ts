import { PaymentMethod, PaymentStatus, PaymentErrorCode } from "../types/payments.types";
import type {
  PaymentTransaction,
  PaymentHistoryItem,
  PaymentIntentResponse,
  CheckoutSessionResponse,
  NormalizedPaymentError,
  Money,
} from "../types/payments.types";
import { PAYMENT_SORT_FIELDS } from "../constants/payments.constants";

export function isMoney(value: unknown): value is Money {
  if (!value || typeof value !== "object") return false;
  const m = value as Record<string, unknown>;
  return typeof m.amount === "number" && typeof m.currency === "string";
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return Object.values(PaymentMethod).includes(value as PaymentMethod);
}

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
}

export function isPaymentErrorCode(value: unknown): value is PaymentErrorCode {
  return Object.values(PaymentErrorCode).includes(value as PaymentErrorCode);
}

export function isPaymentTransaction(value: unknown): value is PaymentTransaction {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    isMoney(t.amount) &&
    isPaymentStatus(t.status)
  );
}

export function isPaymentHistoryItem(value: unknown): value is PaymentHistoryItem {
  if (!value || typeof value !== "object") return false;
  const h = value as Record<string, unknown>;
  return typeof h.id === "string" && isMoney(h.amount) && isPaymentStatus(h.status);
}

export function isPaymentIntentResponse(value: unknown): value is PaymentIntentResponse {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.clientSecret === "string" &&
    typeof r.paymentIntentId === "string" &&
    typeof r.amount === "number"
  );
}

export function isCheckoutSessionResponse(value: unknown): value is CheckoutSessionResponse {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.checkoutUrl === "string" &&
    typeof r.sessionId === "string" &&
    typeof r.orderId === "string"
  );
}

export function isNormalizedPaymentError(value: unknown): value is NormalizedPaymentError {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  return (
    isPaymentErrorCode(e.code) &&
    typeof e.message === "string" &&
    typeof e.retryable === "boolean"
  );
}

export function isValidSortField(value: unknown): value is (typeof PAYMENT_SORT_FIELDS)[number] {
  return (PAYMENT_SORT_FIELDS as readonly string[]).includes(value as string);
}
