"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentHistoryApi, getPaymentTransactionApi } from "../api/payments.api";
import { paymentKeys } from "../constants/payments.keys";
import { PAYMENT_DEFAULTS } from "../constants/payments.constants";
import type { PaymentQueryParams, PaymentHistoryResponse, PaymentTransaction } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

export function usePaymentHistory(params: PaymentQueryParams = {}, userId?: string) {
  return useQuery<PaymentHistoryResponse, NormalizedPaymentError>({
    queryKey: paymentKeys.list(params, userId),
    queryFn: () => getPaymentHistoryApi(params),
    staleTime: PAYMENT_DEFAULTS.STALE_TIME,
    gcTime: PAYMENT_DEFAULTS.GC_TIME,
    retry: PAYMENT_DEFAULTS.RETRY_COUNT,
  });
}

export function usePaymentTransaction(id: string | undefined, userId?: string) {
  return useQuery<PaymentTransaction, NormalizedPaymentError>({
    queryKey: paymentKeys.detail(id ?? "", userId),
    queryFn: () => getPaymentTransactionApi(id!),
    enabled: !!id,
    staleTime: PAYMENT_DEFAULTS.STALE_TIME,
    gcTime: PAYMENT_DEFAULTS.GC_TIME,
    retry: PAYMENT_DEFAULTS.RETRY_COUNT,
  });
}
