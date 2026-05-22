import { create } from "zustand";
import type { AuthState, AuthLoading } from "./auth.types";

const initialState: Omit<AuthState, "setUser" | "setLoading" | "setInitialized" | "reset"> = {
  user: null,
  isAuthenticated: false,
  isLoading: {
    session: false,
    login: false,
    logout: false,
    resetPassword: false,
  },
  isInitialized: false,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setLoading: (key, value) =>
    set((state) => ({
      isLoading: { ...state.isLoading, [key]: value },
    })),

  setInitialized: () => set({ isInitialized: true }),

  reset: () => set({ ...initialState }),
}));
