"use client";

import { createContext, useContext, useRef, useEffect, useCallback, useState, type ReactNode } from "react";
import { getPusherClient, isPusherConfigured } from "../notifications.client";
import { getPusherConfigFromEnv } from "../notifications.config";
import { PusherEvent } from "../notifications.types";
import type { PusherEventHandler } from "../notifications.client";

/* ─── Context Shape ─── */

interface EventBusContextValue {
  subscribe: (eventName: string, handler: PusherEventHandler) => () => void;
  isConnected: boolean;
}

const EventBusContext = createContext<EventBusContextValue | null>(null);

/* ─── Constants ─── */

const MAX_SEEN_EVENTS = 500;

/* ─── Provider ─── */

interface NotificationsProviderProps {
  children: ReactNode;
  userId?: string;
  enabled?: boolean;
}

export function NotificationsProvider({ children, userId, enabled = true }: NotificationsProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<Map<string, Set<PusherEventHandler>>>(new Map());
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const unsubscribeFnsRef = useRef<Array<() => void>>([]);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  /* ─── Deduplication ─── */

  const isDuplicate = useCallback((eventId: string): boolean => {
    if (seenEventIdsRef.current.has(eventId)) return true;
    seenEventIdsRef.current.add(eventId);
    if (seenEventIdsRef.current.size > MAX_SEEN_EVENTS) {
      const iterator = seenEventIdsRef.current.values();
      const first = iterator.next();
      if (first.value !== undefined) seenEventIdsRef.current.delete(first.value);
    }
    return false;
  }, []);

  /* ─── Subscribe Registration ─── */

  const subscribe = useCallback((eventName: string, handler: PusherEventHandler): (() => void) => {
    if (!handlersRef.current.has(eventName)) {
      handlersRef.current.set(eventName, new Set());
    }
    handlersRef.current.get(eventName)!.add(handler);

    return () => {
      const handlers = handlersRef.current.get(eventName);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) handlersRef.current.delete(eventName);
      }
    };
  }, []);

  /* ─── Connection Lifecycle ─── */

  useEffect(() => {
    if (!enabled || !userId) return;
    if (!isPusherConfigured()) return;

    const client = getPusherClient();
    if (!client) return;

    setIsConnected(client.isConnected);
    const pusherConfig = getPusherConfigFromEnv();

    /* Subscribe to all Pusher events and dispatch to registered handlers */
    const events = Object.values(PusherEvent);

    const unsubs = events.map((event) =>
      client.subscribe(pusherConfig.channel, event, (data: unknown) => {
        /* Dedup by eventId if present */
        const payload = data as Record<string, unknown> | undefined;
        if (payload?.eventId && typeof payload.eventId === "string") {
          if (isDuplicate(payload.eventId)) return;
        }

        /* Dispatch to all handlers registered for this event */
        const handlers = handlersRef.current.get(event);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }

        /* Also dispatch to wildcard "*" handlers */
        const wildcardHandlers = handlersRef.current.get("*");
        if (wildcardHandlers) {
          wildcardHandlers.forEach((handler) => handler(data));
        }
      }),
    );

    unsubscribeFnsRef.current = unsubs;

    /* Check connection state periodically */
    const interval = setInterval(() => {
      const c = getPusherClient();
      setIsConnected(c?.isConnected ?? false);
    }, 5000);

    return () => {
      unsubs.forEach((fn) => fn());
      clearInterval(interval);
      handlersRef.current.clear();
    };
  }, [userId, enabled, isDuplicate]);

  const value: EventBusContextValue = { subscribe, isConnected };

  return <EventBusContext.Provider value={value}>{children}</EventBusContext.Provider>;
}

/* ─── Consumer Hook ─── */

export function useEventBus(): EventBusContextValue {
  const ctx = useContext(EventBusContext);
  if (!ctx) {
    throw new Error("useEventBus must be used within a <NotificationsProvider>");
  }
  return ctx;
}
