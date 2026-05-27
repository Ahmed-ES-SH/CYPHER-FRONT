/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NormalizedOrderError, OrderApiError, ValidationErrorMap } from "../contracts/order-error.types";

export function normalizeOrderError(error: unknown): OrderApiError {
  if (error && typeof error === "object" && "message" in error) {
    return {
      message: (error as any).message ?? "An unexpected error occurred",
      status: (error as any).status ?? 500,
      errors: (error as any).errors,
    };
  }
  return { message: "An unexpected error occurred", status: 500 };
}

export function parseValidationErrors(errors?: Record<string, string[]>): ValidationErrorMap {
  if (!errors) return {};
  const map: ValidationErrorMap = {};
  for (const [field, messages] of Object.entries(errors)) {
    map[field] = messages[0] ?? "Invalid value";
  }
  return map;
}

export function normalizeTransportError(error: unknown): NormalizedOrderError {
  if (!error || typeof error !== "object") {
    return {
      message: "An unexpected error occurred",
      statusCode: 0,
      errors: null,
      path: null,
      timestamp: null,
      retryable: false,
      source: "unknown",
    };
  }

  const err = error as any;
  const statusCode = err.status ?? err.statusCode ?? 0;
  const message = err.message ?? "An unexpected error occurred";

  let source: NormalizedOrderError["source"] = "unknown";
  let retryable = false;

  if (statusCode === 0 || err.name === "NetworkError" || err.name === "TypeError") {
    source = "network";
    retryable = true;
  } else if (statusCode === 401) {
    source = "auth";
    retryable = false;
  } else if (statusCode === 422 || statusCode === 400) {
    source = "validation";
    retryable = false;
  } else if (statusCode >= 500) {
    source = "server";
    retryable = true;
  }

  return {
    message,
    statusCode,
    errors: err.errors ? parseValidationErrors(err.errors) : null,
    path: err.path ?? null,
    timestamp: err.timestamp ?? null,
    retryable,
    source,
  };
}

export function isRetryableError(error: NormalizedOrderError): boolean {
  return error.retryable;
}

export function isAuthError(error: NormalizedOrderError): boolean {
  return error.source === "auth";
}

export function isValidationError(error: NormalizedOrderError): boolean {
  return error.source === "validation";
}

export function isServerError(error: NormalizedOrderError): boolean {
  return error.source === "server";
}

export function isNetworkError(error: NormalizedOrderError): boolean {
  return error.source === "network";
}
