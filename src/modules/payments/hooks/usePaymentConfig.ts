"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentConfigApi } from "../api/payments.api";
import { getPaymentsConfig } from "../config/payments.config";
import { paymentKeys } from "../constants/payments.keys";
import type { PaymentConfig } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

export function usePaymentConfig() {
  const config = getPaymentsConfig();

  return useQuery<PaymentConfig, NormalizedPaymentError>({
    queryKey: paymentKeys.config(),
    queryFn: () => getPaymentConfigApi(),
    staleTime: config.staleTime,
    gcTime: config.gcTime,
    retry: config.retryCount,
  });
}
