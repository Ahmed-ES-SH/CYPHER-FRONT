"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentMethodsApi } from "../api/payments.api";
import { getPaymentsConfig } from "../config/payments.config";
import { paymentKeys } from "../constants/payments.keys";
import type { PaymentMethodOption } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

export function usePaymentMethods() {
  const config = getPaymentsConfig();

  return useQuery<PaymentMethodOption[], NormalizedPaymentError>({
    queryKey: paymentKeys.methods(),
    queryFn: () => getPaymentMethodsApi(),
    staleTime: config.staleTime,
    gcTime: config.gcTime,
    retry: config.retryCount,
  });
}
