import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartStore, GuestCartItem, CartUiLoading } from "./cart.types";
import { CART_STORAGE_KEY } from "./cart.types";
import { validateQuantity } from "./cart.api";

const initialLoading: CartUiLoading = {
  add: {},
  update: {},
  remove: {},
  checkout: false,
  sync: false,
};

function clampGuestQuantity(
  item: GuestCartItem,
  quantity: number,
): number {
  const { clamped } = validateQuantity(
    quantity,
    item.stock,
    item.minimumQuantity,
    item.maximumQuantity,
  );
  return clamped;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      guestItems: [],
      loading: { ...initialLoading },
      isHydrated: false,

      addGuestItem: (item) =>
        set((state) => {
          const existing = state.guestItems.find(
            (i) => i.productId === item.productId,
          );
          if (existing) {
            const mergedQty = clampGuestQuantity(
              existing,
              existing.quantity + item.quantity,
            );
            return {
              guestItems: state.guestItems.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: mergedQty }
                  : i,
              ),
            };
          }
          return {
            guestItems: [
              ...state.guestItems,
              {
                ...item,
                quantity: clampGuestQuantity(item, item.quantity),
              },
            ],
          };
        }),

      removeGuestItem: (productId) =>
        set((state) => ({
          guestItems: state.guestItems.filter(
            (i) => i.productId !== productId,
          ),
        })),

      updateGuestItemQuantity: (productId, quantity) =>
        set((state) => ({
          guestItems: state.guestItems.map((i) =>
            i.productId === productId
              ? { ...i, quantity: clampGuestQuantity(i, quantity) }
              : i,
          ),
        })),

      clearGuestItems: () => set({ guestItems: [] }),

      replaceGuestItems: (items) => set({ guestItems: items }),

      setLoading: (key, productId, value) =>
        set((state) => ({
          loading: {
            ...state.loading,
            [key]: {
              ...state.loading[key],
              [productId]: value,
            },
          },
        })),

      setCheckoutLoading: (value) =>
        set((state) => ({
          loading: { ...state.loading, checkout: value },
        })),

      setSyncLoading: (value) =>
        set((state) => ({
          loading: { ...state.loading, sync: value },
        })),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        guestItems: state.guestItems,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    },
  ),
);
