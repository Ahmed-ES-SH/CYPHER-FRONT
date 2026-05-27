import { PaymentErrorCode } from "../types/payments.types";

export interface ErrorCodeInfo {
  code: PaymentErrorCode;
  message: string;
  retryable: boolean;
  httpStatus: number;
}

export const ERROR_CODE_MAP: Record<number, ErrorCodeInfo> = {
  400: {
    code: PaymentErrorCode.INVALID_INPUT,
    message: "The request contains invalid data.",
    retryable: false,
    httpStatus: 400,
  },
  401: {
    code: PaymentErrorCode.AUTH_REQUIRED,
    message: "Authentication is required to process this payment.",
    retryable: false,
    httpStatus: 401,
  },
  403: {
    code: PaymentErrorCode.AUTH_REQUIRED,
    message: "You do not have permission to perform this action.",
    retryable: false,
    httpStatus: 403,
  },
  404: {
    code: PaymentErrorCode.NOT_FOUND,
    message: "The requested payment resource was not found.",
    retryable: false,
    httpStatus: 404,
  },
  409: {
    code: PaymentErrorCode.ALREADY_IN_PROGRESS,
    message: "A payment is already in progress for this order.",
    retryable: false,
    httpStatus: 409,
  },
  429: {
    code: PaymentErrorCode.RATE_LIMITED,
    message: "Too many requests. Please wait before trying again.",
    retryable: true,
    httpStatus: 429,
  },
};

export const TRANSPORT_ERROR: ErrorCodeInfo = {
  code: PaymentErrorCode.NETWORK_ERROR,
  message: "A network error occurred. Please check your connection and try again.",
  retryable: true,
  httpStatus: 0,
};

export const CONFIG_ERROR: ErrorCodeInfo = {
  code: PaymentErrorCode.CONFIG_MISSING,
  message: "Payment module configuration is missing or invalid.",
  retryable: false,
  httpStatus: 500,
};

export const STRIPE_ERROR: ErrorCodeInfo = {
  code: PaymentErrorCode.STRIPE_ERROR,
  message: "A payment processing error occurred. Please try again.",
  retryable: true,
  httpStatus: 502,
};

export const UNKNOWN_ERROR: ErrorCodeInfo = {
  code: PaymentErrorCode.UNKNOWN_ERROR,
  message: "An unexpected error occurred. Please try again.",
  retryable: true,
  httpStatus: 500,
};
