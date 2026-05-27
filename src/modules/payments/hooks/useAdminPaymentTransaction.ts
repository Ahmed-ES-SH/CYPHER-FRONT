"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminPaymentTransactionApi } from "../api/payments.api";
import { paymentKeys } from "../constants/payments.keys";
import { PAYMENT_DEFAULTS } from "../constants/payments.constants";
import type { PaymentTransaction } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

export function useAdminPaymentTransaction(id: string | undefined) {
  return useQuery<PaymentTransaction, NormalizedPaymentError>({
    queryKey: [...paymentKeys.details(), "admin", id ?? ""] as const,
    queryFn: () => getAdminPaymentTransactionApi(id!),
    enabled: !!id,
    staleTime: PAYMENT_DEFAULTS.STALE_TIME,
    gcTime: PAYMENT_DEFAULTS.GC_TIME,
    retry: PAYMENT_DEFAULTS.RETRY_COUNT,
  });
}
