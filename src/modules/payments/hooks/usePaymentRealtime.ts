"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { paymentKeys } from "../constants/payments.keys";
import type { PaymentRealtimeEvent, RealtimeEventCallback } from "../types/payments.types";
import type { NormalizedPaymentError } from "../types/payments.types";

/* ─── Realtime Adapter Contract ─── */

export interface PaymentRealtimeAdapter {
  subscribe(
    userId: string,
    onEvent: (event: PaymentRealtimeEvent) => void,
  ): () => void;
  isAvailable(): boolean;
}

/* ─── Optional Adapter Holder ─── */

let activeAdapter: PaymentRealtimeAdapter | null = null;

export function setPaymentRealtimeAdapter(adapter: PaymentRealtimeAdapter): void {
  activeAdapter = adapter;
}

export function getPaymentRealtimeAdapter(): PaymentRealtimeAdapter | null {
  return activeAdapter;
}

export function clearPaymentRealtimeAdapter(): void {
  activeAdapter = null;
}

/* ─── Hook ─── */

export function usePaymentRealtime(
  userId: string | undefined,
  onEvent?: RealtimeEventCallback,
): { isAvailable: boolean } {
  const queryClient = useQueryClient();
  const callbackRef = useRef<RealtimeEventCallback | undefined>(onEvent);
  callbackRef.current = onEvent;

  const handleEvent = useCallback(
    (event: PaymentRealtimeEvent) => {
      // Invalidate relevant queries so the UI re-renders
      queryClient.invalidateQueries({
        queryKey: paymentKeys.detail(event.paymentId, userId),
      });
      if (event.orderId) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.checkoutSession(event.orderId, userId),
        });
      }

      // Call host-supplied callback
      callbackRef.current?.(event);
    },
    [queryClient, userId],
  );

  useEffect(() => {
    if (!userId) return;
    if (!activeAdapter || !activeAdapter.isAvailable()) return;

    const unsubscribe = activeAdapter.subscribe(userId, handleEvent);
    return () => {
      unsubscribe();
    };
  }, [userId, handleEvent]);

  return {
    isAvailable: activeAdapter?.isAvailable() ?? false,
  };
}
