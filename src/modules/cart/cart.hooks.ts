"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "./cart.store";
import {
  getCartApi,
  addItemApi,
  updateItemApi,
  removeItemApi,
  clearCartApi,
  checkoutApi,
  prepareAndCheckout,
  syncGuestCart,
  cartKeys,
  invalidateCart,
  invalidateCartCount,
  selectCartSummary,
  selectCartItemCount,
  selectGuestCartSummary,
  selectGuestItemCount,
} from "./cart.api";
import type {
  Cart,
  AddItemDto,
  UpdateItemDto,
  CheckoutRequestDto,
  CheckoutResult,
  ClearCartResponseDto,
  CartApiError,
  SyncResult,
  CheckoutValidation,
} from "./cart.types";

/* =========================================================
   useCart
   ========================================================= */

export function useCart(enabled = true) {
  return useQuery<Cart, CartApiError>({
    queryKey: cartKeys.detail(),
    queryFn: getCartApi,
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  });
}

/* =========================================================
   useCartSummary
   ========================================================= */

export function useCartSummary(enabled = true) {
  const guestItems = useCartStore((s) => s.guestItems);
  const { data: serverCart, isLoading, error } = useCart(enabled);

  if (isLoading || error || !serverCart) {
    return {
      summary: selectGuestCartSummary(guestItems),
      isLoading,
      error: error ?? null,
    };
  }

  return {
    summary: selectCartSummary(serverCart),
    isLoading,
    error: null,
  };
}

/* =========================================================
   useCartCount
   ========================================================= */

export function useCartCount(enabled = true) {
  const guestItems = useCartStore((s) => s.guestItems);
  const { data: serverCart, isLoading } = useCart(enabled);

  if (isLoading || !serverCart) {
    return { count: selectGuestItemCount(guestItems), isLoading };
  }

  return { count: selectCartItemCount(serverCart), isLoading };
}

/* =========================================================
   useCartActions
   ========================================================= */

export function useCartActions() {
  const queryClient = useQueryClient();
  const store = useCartStore();

  const addMutation = useMutation<Cart, CartApiError, AddItemDto>({
    mutationFn: (dto) => addItemApi(dto),
    onSuccess: () => {
      invalidateCart(queryClient);
    },
  });

  const updateMutation = useMutation<
    Cart,
    CartApiError,
    { itemId: string; dto: UpdateItemDto }
  >({
    mutationFn: ({ itemId, dto }) => updateItemApi(itemId, dto),
    onSuccess: () => {
      invalidateCart(queryClient);
    },
  });

  const removeMutation = useMutation<Cart, CartApiError, string>({
    mutationFn: (itemId) => removeItemApi(itemId),
    onSuccess: () => {
      invalidateCart(queryClient);
    },
  });

  const clearMutation = useMutation<ClearCartResponseDto, CartApiError>({
    mutationFn: () => clearCartApi(),
    onSuccess: () => {
      store.clearGuestItems();
      invalidateCart(queryClient);
      invalidateCartCount(queryClient);
    },
  });

  const checkoutMutation = useMutation<
    { result?: CheckoutResult; validation?: CheckoutValidation },
    CartApiError,
    CheckoutRequestDto
  >({
    mutationFn: async (dto) => {
      const cart = queryClient.getQueryData<Cart>(cartKeys.detail());
      return prepareAndCheckout(dto, { cart, guestItems: useCartStore.getState().guestItems });
    },
    onSuccess: (data) => {
      if (data.result) {
        invalidateCart(queryClient);
      }
    },
  });

  const checkoutReturn = {
    mutate: checkoutMutation.mutate,
    mutateAsync: checkoutMutation.mutateAsync,
    isLoading: checkoutMutation.isPending,
    error: checkoutMutation.error,
    validation: checkoutMutation.data?.validation,
  };

  return {
    addItem: {
      mutate: addMutation.mutate,
      mutateAsync: addMutation.mutateAsync,
      isLoading: addMutation.isPending,
      error: addMutation.error,
    },
    updateItem: {
      mutate: updateMutation.mutate,
      mutateAsync: updateMutation.mutateAsync,
      isLoading: updateMutation.isPending,
      error: updateMutation.error,
    },
    removeItem: {
      mutate: removeMutation.mutate,
      mutateAsync: removeMutation.mutateAsync,
      isLoading: removeMutation.isPending,
      error: removeMutation.error,
    },
    clearCart: {
      mutate: clearMutation.mutate,
      mutateAsync: clearMutation.mutateAsync,
      isLoading: clearMutation.isPending,
      error: clearMutation.error,
    },
    checkout: checkoutReturn,
  };
}

/* =========================================================
   useSyncGuestCart
   ========================================================= */

export function useSyncGuestCart() {
  const queryClient = useQueryClient();
  const guestItems = useCartStore((s) => s.guestItems);
  const clearGuestItems = useCartStore((s) => s.clearGuestItems);

  return useMutation<SyncResult, CartApiError, void>({
    mutationFn: () => syncGuestCart(guestItems),
    onSuccess: (result) => {
      if (result.success && result.cart) {
        clearGuestItems();
        queryClient.setQueryData(cartKeys.detail(), result.cart);
        invalidateCartCount(queryClient);
      }
    },
  });
}

/* =========================================================
   useGuestCart
   ========================================================= */

export function useGuestCart() {
  const guestItems = useCartStore((s) => s.guestItems);
  const isHydrated = useCartStore((s) => s.isHydrated);
  const addGuestItem = useCartStore((s) => s.addGuestItem);
  const removeGuestItem = useCartStore((s) => s.removeGuestItem);
  const updateGuestItemQuantity = useCartStore((s) => s.updateGuestItemQuantity);
  const clearGuestItems = useCartStore((s) => s.clearGuestItems);

  return {
    items: guestItems,
    isHydrated,
    addItem: addGuestItem,
    removeItem: removeGuestItem,
    updateQuantity: updateGuestItemQuantity,
    clearItems: clearGuestItems,
    summary: selectGuestCartSummary(guestItems),
    itemCount: selectGuestItemCount(guestItems),
  };
}
