import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GuestCartItem, Money } from "./cart.types";
import { CART_STORAGE_KEY } from "./cart.types";
import { validateQuantity } from "./cart-utils";

/* =========================================================
   Store Types
   ========================================================= */

export interface CartStoreState {
  guestItems: GuestCartItem[];
  isHydrated: boolean;
}

export interface CartStoreActions {
  addGuestItem: (item: GuestCartItem) => void;
  removeGuestItem: (productId: string) => void;
  updateGuestItemQuantity: (productId: string, quantity: number) => void;
  clearGuestItems: () => void;
  replaceGuestItems: (items: GuestCartItem[]) => void;
  setHydrated: () => void;
}

export type CartStore = CartStoreState & CartStoreActions;

/* =========================================================
   Helpers
   ========================================================= */

function clampGuestQuantity(item: GuestCartItem, quantity: number): number {
  const { clamped } = validateQuantity(
    quantity,
    item.stock,
    item.minimumQuantity,
    item.maximumQuantity,
  );
  return clamped;
}

/* =========================================================
   Store
   ========================================================= */

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      guestItems: [],
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

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
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

/* =========================================================
   Cross-Tab Sync — Schema validation & safe init
   ========================================================= */

function isValidGuestCartItem(item: unknown): item is GuestCartItem {
  if (!item || typeof item !== "object") return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.productId === "string" &&
    i.productId.length > 0 &&
    typeof i.productName === "string" &&
    typeof i.productSlug === "string" &&
    typeof i.productImage === "string" &&
    typeof i.quantity === "number" &&
    i.quantity >= 0 &&
    typeof i.stock === "number" &&
    typeof i.minimumQuantity === "number" &&
    typeof i.maximumQuantity === "number" &&
    typeof i.unitPrice === "object" &&
    i.unitPrice !== null &&
    typeof (i.unitPrice as Record<string, unknown>).amount === "number" &&
    typeof (i.unitPrice as Record<string, unknown>).currency === "string"
  );
}

export function initCartCrossTabSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as {
          state?: { guestItems?: unknown[] };
        };
        const guestItems = parsed?.state?.guestItems;
        if (Array.isArray(guestItems) && guestItems.every(isValidGuestCartItem)) {
          useCartStore.setState({ guestItems });
        }
      } catch {
        /* ignore malformed storage events */
      }
    }
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
