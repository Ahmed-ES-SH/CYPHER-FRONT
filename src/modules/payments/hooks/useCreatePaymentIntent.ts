"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentIntentApi } from "../api/payments.api";
import { paymentKeys } from "../constants/payments.keys";
import type { PaymentIntentRequest, PaymentIntentResponse } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

export function useCreatePaymentIntent(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation<PaymentIntentResponse, NormalizedPaymentError, PaymentIntentRequest>({
    mutationFn: (request) => createPaymentIntentApi(request),
    onSuccess: (_data, request) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.lists(userId),
      });
      queryClient.setQueryData(
        paymentKeys.intent(request.orderId, userId),
        _data,
      );
    },
  });
}
