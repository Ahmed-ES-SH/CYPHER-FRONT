"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentMethodsApi } from "../api/payments.api";
import { paymentKeys } from "../constants/payments.keys";
import type { PaymentMethodOption } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

const METHODS_STALE_TIME = 5 * 60 * 1000;
const METHODS_GC_TIME = 30 * 60 * 1000;
const METHODS_RETRY = 1;

export function usePaymentMethods() {
  return useQuery<PaymentMethodOption[], NormalizedPaymentError>({
    queryKey: paymentKeys.methods(),
    queryFn: () => getPaymentMethodsApi(),
    staleTime: METHODS_STALE_TIME,
    gcTime: METHODS_GC_TIME,
    retry: METHODS_RETRY,
  });
}
