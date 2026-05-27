"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentConfigApi } from "../api/payments.api";
import { paymentKeys } from "../constants/payments.keys";
import type { PaymentConfig } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

const CONFIG_STALE_TIME = 10 * 60 * 1000;
const CONFIG_GC_TIME = 30 * 60 * 1000;
const CONFIG_RETRY = 1;

export function usePaymentConfig() {
  return useQuery<PaymentConfig, NormalizedPaymentError>({
    queryKey: paymentKeys.config(),
    queryFn: () => getPaymentConfigApi(),
    staleTime: CONFIG_STALE_TIME,
    gcTime: CONFIG_GC_TIME,
    retry: CONFIG_RETRY,
  });
}
