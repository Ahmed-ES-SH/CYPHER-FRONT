"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "./cart.store";
import { cartKeys } from "./cart.keys";
import { getCartApi, addItemApi, updateItemApi, removeItemApi, clearCartApi, prepareAndCheckout, syncGuestCart } from "./cart.service";
import { invalidateCart, invalidateCartDetail, invalidateCartCount } from "./cart-invalidation";
import { selectCartSummary, selectCartItemCount, selectGuestCartSummary, selectGuestItemCount } from "./cart-selectors";
import { getActiveRedirectAdapter } from "./cart.transport";
import type { Cart, AddItemDto, UpdateItemDto, CheckoutRequestDto, CheckoutResult, ClearCartResponseDto, CartApiError, SyncResult, CheckoutValidation } from "./cart.types";

/* =========================================================
   useCart
   ========================================================= */

export function useCart(enabled = true) {
  return useQuery<Cart, CartApiError>({
    queryKey: cartKeys.detail(),
    queryFn: () => getCartApi(),
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

  if (serverCart) {
    return {
      summary: selectCartSummary(serverCart),
      isLoading: false,
      error: null,
    };
  }

  if (isLoading) {
    return {
      summary: selectGuestCartSummary(guestItems),
      isLoading: true,
      error: null,
    };
  }

  return {
    summary: selectGuestCartSummary(guestItems),
    isLoading: false,
    error: error ?? null,
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
  const clearGuestItems = useCartStore((s) => s.clearGuestItems);

  const addMutation = useMutation<Cart, CartApiError, AddItemDto>({
    mutationFn: (dto) => addItemApi(dto),
    onSuccess: () => {
      invalidateCartDetail(queryClient);
    },
  });

  const updateMutation = useMutation<
    Cart,
    CartApiError,
    { itemId: string; dto: UpdateItemDto }
  >({
    mutationFn: ({ itemId, dto }) => updateItemApi(itemId, dto),
    onSuccess: () => {
      invalidateCartDetail(queryClient);
    },
  });

  const removeMutation = useMutation<Cart, CartApiError, string>({
    mutationFn: (itemId) => removeItemApi(itemId),
    onSuccess: () => {
      invalidateCartDetail(queryClient);
    },
  });

  const clearMutation = useMutation<ClearCartResponseDto, CartApiError>({
    mutationFn: () => clearCartApi(),
    onSuccess: () => {
      clearGuestItems();
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
      const guestItems = useCartStore.getState().guestItems;
      return prepareAndCheckout(dto, { cart, guestItems });
    },
    onSuccess: (data) => {
      if (data.result) {
        invalidateCart(queryClient);
        if (data.result.url) {
          getActiveRedirectAdapter().to(data.result.url);
        }
      }
    },
  });

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
    checkout: {
      mutate: checkoutMutation.mutate,
      mutateAsync: checkoutMutation.mutateAsync,
      isLoading: checkoutMutation.isPending,
      error: checkoutMutation.error,
      validation: checkoutMutation.data?.validation,
    },
  };
}

/* =========================================================
   useSyncGuestCart
   ========================================================= */

export function useSyncGuestCart() {
  const queryClient = useQueryClient();

  return useMutation<SyncResult, CartApiError, void>({
    mutationFn: () => {
      const guestItems = useCartStore.getState().guestItems;
      const serverCart = queryClient.getQueryData<Cart>(cartKeys.detail());
      return syncGuestCart(guestItems, { serverCart });
    },
    onSuccess: (result) => {
      if (result.success && result.cart) {
        useCartStore.getState().clearGuestItems();
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
  const { guestItems, isHydrated } = useCartStore(
    useShallow((s) => ({ guestItems: s.guestItems, isHydrated: s.isHydrated })),
  );

  const addGuestItem = useCartStore((s) => s.addGuestItem);
  const removeGuestItem = useCartStore((s) => s.removeGuestItem);
  const updateGuestItemQuantity = useCartStore((s) => s.updateGuestItemQuantity);
  const clearGuestItems = useCartStore((s) => s.clearGuestItems);

  const summary = useMemo(() => selectGuestCartSummary(guestItems), [guestItems]);
  const itemCount = useMemo(() => selectGuestItemCount(guestItems), [guestItems]);

  return {
    items: guestItems,
    isHydrated,
    addItem: addGuestItem,
    removeItem: removeGuestItem,
    updateQuantity: updateGuestItemQuantity,
    clearItems: clearGuestItems,
    summary,
    itemCount,
  };
}
