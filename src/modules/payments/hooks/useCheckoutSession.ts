"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCheckoutSessionApi } from "../api/payments.api";
import { paymentKeys } from "../constants/payments.keys";
import type { CheckoutSessionRequest, CheckoutSessionResponse } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

export function useCheckoutSession(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation<CheckoutSessionResponse, NormalizedPaymentError, CheckoutSessionRequest>({
    mutationFn: (request) => createCheckoutSessionApi(request),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.lists(userId),
      });
      queryClient.setQueryData(
        paymentKeys.checkoutSession(_data.orderId, userId),
        _data,
      );
    },
  });
}
