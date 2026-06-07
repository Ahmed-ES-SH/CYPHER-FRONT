import axios from "axios";
import type { NormalizedPaymentError, PaymentApiError } from "../types/payments.types";
import { PaymentErrorCode } from "../types/payments.types";
import {
  ERROR_CODE_MAP,
  TRANSPORT_ERROR,
  CONFIG_ERROR,
  STRIPE_ERROR,
  UNKNOWN_ERROR,
} from "../constants/payments.errors";

export function normalizePaymentError(error: unknown): NormalizedPaymentError {
  // Axios error with response
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    const data = error.response.data as Record<string, unknown> | undefined;

    const mapped = ERROR_CODE_MAP[status];

    if (mapped) {
      return {
        code: mapped.code,
        message: (data?.message as string) ?? mapped.message,
        status,
        retryable: mapped.retryable,
        validationErrors: extractValidationErrors(data?.errors),
      };
    }

    // Unmapped 4xx client errors (e.g. 422) → INVALID_INPUT with validation details
    if (status >= 400 && status < 500) {
      return {
        code: PaymentErrorCode.INVALID_INPUT,
        message: (data?.message as string) ?? "Validation failed.",
        status,
        retryable: false,
        validationErrors: extractValidationErrors(data?.errors ?? data),
      };
    }

    // 5xx or unmapped status → upstream failure
    if (status >= 500 && status < 600) {
      const isStripeError =
        (data?.type as string)?.includes("stripe") ||
        (data?.error as string)?.includes("stripe");

      if (isStripeError) {
        return {
          code: PaymentErrorCode.STRIPE_ERROR,
          message: (data?.message as string) ?? STRIPE_ERROR.message,
          status,
          retryable: STRIPE_ERROR.retryable,
        };
      }

      return {
        code: PaymentErrorCode.UNKNOWN_ERROR,
        message: (data?.message as string) ?? UNKNOWN_ERROR.message,
        status,
        retryable: UNKNOWN_ERROR.retryable,
      };
    }

    return {
      code: PaymentErrorCode.UNKNOWN_ERROR,
      message: (data?.message as string) ?? UNKNOWN_ERROR.message,
      status,
      retryable: UNKNOWN_ERROR.retryable,
    };
  }

  // Axios error without response (network error / timeout)
  if (axios.isAxiosError(error) && !error.response) {
    return {
      code: TRANSPORT_ERROR.code,
      message: error.message ?? TRANSPORT_ERROR.message,
      status: 0,
      retryable: TRANSPORT_ERROR.retryable,
    };
  }

  // Already normalized (from our interceptor or from manual creation)
  if (isNormalizedShape(error)) {
    return error;
  }

  // Raw error shape
  if (error && typeof error === "object" && "message" in error) {
    const raw = error as Record<string, unknown>;
    return {
      code: PaymentErrorCode.UNKNOWN_ERROR,
      message: String(raw.message ?? UNKNOWN_ERROR.message),
      status: (raw.status as number) ?? 500,
      retryable: false,
    };
  }

  // Fallback for non-object, null, or undefined
  return {
    code: PaymentErrorCode.UNKNOWN_ERROR,
    message: UNKNOWN_ERROR.message,
    status: UNKNOWN_ERROR.httpStatus,
    retryable: UNKNOWN_ERROR.retryable,
  };
}

function extractValidationErrors(
  errors?: unknown,
): Record<string, string> | undefined {
  if (!errors || typeof errors !== "object") return undefined;
  const map: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      map[field] = String(messages[0]);
    }
  }
  return Object.keys(map).length > 0 ? map : undefined;
}

function isNormalizedShape(error: unknown): error is NormalizedPaymentError {
  if (!error || typeof error !== "object") return false;
  const e = error as Record<string, unknown>;
  return (
    typeof e.code === "string" &&
    Object.values(PaymentErrorCode).includes(e.code as PaymentErrorCode) &&
    typeof e.retryable === "boolean"
  );
}
