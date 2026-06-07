import { create } from "zustand";
import type { AuthState } from "./auth.types";

const initialState: Omit<AuthState, "setUser" | "setLoading" | "setInitialized" | "reset" | "clearUser"> = {
  user: null,
  isAuthenticated: false,
  isLoading: {
    session: false,
    login: false,
    logout: false,
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

  clearUser: () =>
    set((state) => ({
      user: null,
      isAuthenticated: false,
      isLoading: {
        session: false,
        login: false,
        logout: false,
      },
      isInitialized: state.isInitialized,
    })),
}));

