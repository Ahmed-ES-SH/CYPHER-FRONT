"use client";

import { useEffect, useRef, useCallback, useState } from "react";
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

/* ─── Reactive Adapter Holder ─── */

type Listener = (adapter: PaymentRealtimeAdapter | null) => void;

let activeAdapter: PaymentRealtimeAdapter | null = null;
let listeners: Set<Listener> = new Set();

export function setPaymentRealtimeAdapter(adapter: PaymentRealtimeAdapter): void {
  activeAdapter = adapter;
  listeners.forEach((fn) => { try { fn(adapter); } catch { /* noop */ } });
}

export function getPaymentRealtimeAdapter(): PaymentRealtimeAdapter | null {
  return activeAdapter;
}

export function clearPaymentRealtimeAdapter(): void {
  activeAdapter = null;
  listeners.forEach((fn) => { try { fn(null); } catch { /* noop */ } });
}

function onAdapterChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/* ─── Hook ─── */

export function usePaymentRealtime(
  userId: string | undefined,
  onEvent?: RealtimeEventCallback,
): { isAvailable: boolean } {
  const queryClient = useQueryClient();
  const callbackRef = useRef<RealtimeEventCallback | undefined>(onEvent);
  callbackRef.current = onEvent;
  const [adapter, setAdapter] = useState<PaymentRealtimeAdapter | null>(() => activeAdapter);

  useEffect(() => {
    const unsub = onAdapterChange(setAdapter);
    return unsub;
  }, []);

  const handleEvent = useCallback(
    (event: PaymentRealtimeEvent) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.detail(event.paymentId, userId),
      });
      if (event.orderId) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.checkoutSession(event.orderId, userId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: paymentKeys.lists(userId),
      });
      callbackRef.current?.(event);
    },
    [queryClient, userId],
  );

  useEffect(() => {
    if (!userId) return;
    if (!adapter || !adapter.isAvailable()) return;

    const unsubscribe = adapter.subscribe(userId, handleEvent);
    return () => {
      unsubscribe();
    };
  }, [userId, handleEvent, adapter]);

  return {
    isAvailable: adapter?.isAvailable() ?? false,
  };
}
