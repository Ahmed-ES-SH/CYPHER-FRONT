"use client";

import { useEffect, useRef } from "react";
import { useEventBus } from "../context/NotificationsProvider";
import type { PusherEventHandler } from "../notifications.client";

/**
 * Subscribe to a specific Pusher event via the central NotificationsProvider event bus.
 *
 * @param eventName - The Pusher event name to listen for (e.g., "new-notification").
 *                    Pass null or undefined to skip subscription.
 * @param callback  - The handler to invoke when the event fires.
 * @param enabled   - Optional flag to conditionally enable the subscription.
 *
 * The hook handles cleanup on unmount and when dependencies change.
 */
export function usePusherEvent(
  eventName: string | null | undefined,
  callback: PusherEventHandler,
  enabled = true,
) {
  const { subscribe } = useEventBus();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!eventName || !enabled) return;

    const unsubscribe = subscribe(eventName, (data: unknown) => {
      callbackRef.current(data);
    });

    return unsubscribe;
  }, [eventName, subscribe, enabled]);
}
