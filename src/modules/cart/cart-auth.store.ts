import { create } from "zustand";

/* =========================================================
   Cart Auth Store — Reactive auth state for the cart module

   The transport-level `activeAuthAdapter` is a plain variable
   that doesn't trigger React re-renders. This Zustand store
   provides a reactive source of truth that `useUnifiedCart`
   can subscribe to.
   ========================================================= */

export interface CartAuthState {
  isAuthenticated: boolean;
  userId: string | null;
  setCartAuth: (isAuthenticated: boolean, userId: string | null) => void;
}

export const useCartAuthStore = create<CartAuthState>((set) => ({
  isAuthenticated: false,
  userId: null,
  setCartAuth: (isAuthenticated, userId) => set({ isAuthenticated, userId }),
}));
