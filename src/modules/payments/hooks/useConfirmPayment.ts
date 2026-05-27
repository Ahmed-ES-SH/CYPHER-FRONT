"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmPaymentApi } from "../api/payments.api";
import { paymentKeys } from "../constants/payments.keys";
import { invalidatePaymentLists } from "../api/payments.api";
import type { ConfirmPaymentRequest, PaymentTransaction } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

export function useConfirmPayment(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation<PaymentTransaction, NormalizedPaymentError, ConfirmPaymentRequest>({
    mutationFn: (request) => confirmPaymentApi(request),
    onSuccess: () => {
      invalidatePaymentLists(queryClient);
    },
  });
}
