"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import type {
  Order,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderListResponse,
  OrderStats,
  OrderQueryParams,
} from "./orders.types";
import {
  createOrderApi,
  getUserOrdersApi,
  getOrderByIdApi,
  cancelOrderApi,
  getAdminOrdersApi,
  getAdminOrderByIdApi,
  updateOrderStatusApi,
  getOrderStatsApi,
  orderKeys,
  invalidateOrderLists,
  invalidateOrderDetail,
  removeOrderDetail,
  invalidateOrderStats,
} from "./orders.api";

const ORDER_STALE_TIME = 30 * 1000;
const ORDER_GC_TIME = 5 * 60 * 1000;
const ORDER_RETRY = 1;
const POLL_INTERVAL = 10 * 1000;

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, CreateOrderDto>({
    mutationFn: (dto) => createOrderApi(dto),
    onSuccess: () => {
      invalidateOrderLists(queryClient);
    },
  });
}

export function useUserOrders(params: OrderQueryParams = {}) {
  return useQuery<OrderListResponse>({
    queryKey: orderKeys.list(params),
    queryFn: () => getUserOrdersApi(params),
    staleTime: ORDER_STALE_TIME,
    gcTime: ORDER_GC_TIME,
    retry: ORDER_RETRY,
  });
}

export function useOrderDetail(id: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery<Order>({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => getOrderByIdApi(id!),
    enabled: !!id,
    staleTime: ORDER_STALE_TIME,
    gcTime: ORDER_GC_TIME,
    retry: ORDER_RETRY,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, string>({
    mutationFn: (id) => cancelOrderApi(id),
    onSuccess: (_data, id) => {
      invalidateOrderDetail(queryClient, id);
      invalidateOrderLists(queryClient);
    },
  });
}

export function useAdminOrders(params: OrderQueryParams = {}) {
  return useQuery<OrderListResponse>({
    queryKey: [...orderKeys.lists(), "admin", params],
    queryFn: () => getAdminOrdersApi(params),
    staleTime: ORDER_STALE_TIME,
    gcTime: ORDER_GC_TIME,
    retry: ORDER_RETRY,
  });
}

export function useAdminOrderDetail(id: string | undefined) {
  return useQuery<Order>({
    queryKey: [...orderKeys.details(), "admin", id ?? ""],
    queryFn: () => getAdminOrderByIdApi(id!),
    enabled: !!id,
    staleTime: ORDER_STALE_TIME,
    gcTime: ORDER_GC_TIME,
    retry: ORDER_RETRY,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, { id: string; dto: UpdateOrderStatusDto }>({
    mutationFn: ({ id, dto }) => updateOrderStatusApi(id, dto),
    onSuccess: (_data, { id }) => {
      invalidateOrderDetail(queryClient, id);
      invalidateOrderLists(queryClient);
      invalidateOrderStats(queryClient);
    },
  });
}

export function useOrderStats() {
  return useQuery<OrderStats>({
    queryKey: orderKeys.stats(),
    queryFn: () => getOrderStatsApi(),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: ORDER_RETRY,
  });
}

export function useOrderPolling(id: string | undefined, enabled = false) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const startPolling = useCallback(() => {
    if (!id || !enabled) return;
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
    }, POLL_INTERVAL);
  }, [id, enabled, queryClient]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (enabled && id) {
      startPolling();
    }
    return stopPolling;
  }, [enabled, id, startPolling, stopPolling]);

  return { startPolling, stopPolling };
}

export function useUserOrdersAdmin(params: OrderQueryParams = {}) {
  const list = useUserOrders(params);
  return {
    orders: list.data?.data ?? [],
    meta: list.data?.meta,
    isLoading: list.isPending,
    isError: list.isError,
    error: list.error,
    refetch: list.refetch,
  };
}
