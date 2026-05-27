import type {
  PaymentIntentRequest,
  PaymentIntentResponse,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  ConfirmPaymentRequest,
  PaymentTransaction,
  PaymentQueryParams,
  PaymentHistoryResponse,
} from "../types/payments.types";
import { PaymentErrorCode } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";
import {
  createPaymentIntentApi,
  createCheckoutSessionApi,
  confirmPaymentApi,
  getPaymentHistoryApi,
  getPaymentTransactionApi,
} from "../api/payments.api";

export interface PaymentServiceResult<T> {
  data: T | null;
  error: NormalizedPaymentError | null;
}

function success<T>(data: T): PaymentServiceResult<T> {
  return { data, error: null };
}

function failure<T>(error: NormalizedPaymentError): PaymentServiceResult<T> {
  return { data: null, error };
}

export async function requestPaymentIntent(
  dto: PaymentIntentRequest,
): Promise<PaymentServiceResult<PaymentIntentResponse>> {
  try {
    const result = await createPaymentIntentApi(dto);
    return success(result);
  } catch (err) {
    return failure(err as NormalizedPaymentError);
  }
}

export async function requestCheckoutSession(
  dto: CheckoutSessionRequest,
): Promise<PaymentServiceResult<CheckoutSessionResponse>> {
  try {
    const result = await createCheckoutSessionApi(dto);
    return success(result);
  } catch (err) {
    return failure(err as NormalizedPaymentError);
  }
}

export async function confirmPayment(
  dto: ConfirmPaymentRequest,
): Promise<PaymentServiceResult<PaymentTransaction>> {
  try {
    const result = await confirmPaymentApi(dto);
    return success(result);
  } catch (err) {
    return failure(err as NormalizedPaymentError);
  }
}

export async function fetchPaymentHistory(
  params?: PaymentQueryParams,
): Promise<PaymentServiceResult<PaymentHistoryResponse>> {
  try {
    const result = await getPaymentHistoryApi(params);
    return success(result);
  } catch (err) {
    return failure(err as NormalizedPaymentError);
  }
}

export async function fetchPaymentTransaction(
  id: string,
): Promise<PaymentServiceResult<PaymentTransaction>> {
  try {
    const result = await getPaymentTransactionApi(id);
    return success(result);
  } catch (err) {
    return failure(err as NormalizedPaymentError);
  }
}

export function isRetryableError(error: NormalizedPaymentError): boolean {
  return error.retryable;
}

export function isAuthError(error: NormalizedPaymentError): boolean {
  return error.code === PaymentErrorCode.AUTH_REQUIRED;
}

export function isRateLimited(error: NormalizedPaymentError): boolean {
  return error.code === PaymentErrorCode.RATE_LIMITED;
}

export function isInProgress(error: NormalizedPaymentError): boolean {
  return error.code === PaymentErrorCode.ALREADY_IN_PROGRESS;
}
