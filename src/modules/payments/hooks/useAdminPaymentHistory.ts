"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminPaymentHistoryApi } from "../api/payments.api";
import { paymentKeys } from "../constants/payments.keys";
import { PAYMENT_DEFAULTS } from "../constants/payments.constants";
import type { PaymentQueryParams, PaymentHistoryResponse } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

export function useAdminPaymentHistory(params: PaymentQueryParams = {}) {
  return useQuery<PaymentHistoryResponse, NormalizedPaymentError>({
    queryKey: [...paymentKeys.lists(), "admin", params] as const,
    queryFn: () => getAdminPaymentHistoryApi(params),
    staleTime: PAYMENT_DEFAULTS.STALE_TIME,
    gcTime: PAYMENT_DEFAULTS.GC_TIME,
    retry: PAYMENT_DEFAULTS.RETRY_COUNT,
  });
}
