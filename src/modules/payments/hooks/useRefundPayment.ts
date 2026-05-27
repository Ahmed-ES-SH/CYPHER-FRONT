"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refundPaymentApi, invalidatePaymentDetail, invalidatePaymentLists } from "../api/payments.api";
import type { PaymentTransaction } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentTransaction, NormalizedPaymentError, string>({
    mutationFn: (id) => refundPaymentApi(id),
    onSuccess: (_data, id) => {
      invalidatePaymentDetail(queryClient, id);
      invalidatePaymentLists(queryClient);
    },
  });
}
