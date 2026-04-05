import { create } from "zustand";

export interface userType {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
}

interface AuthState {
  user: userType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: userType | null) => void;
  setLoading: (status: boolean) => void;
  logout: () => void;
  role: "user" | "admin";
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: "user",

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (status) => set({ isLoading: status }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
