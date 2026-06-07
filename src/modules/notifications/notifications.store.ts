import { create } from "zustand";
import type { NotificationQueryParams } from "./notifications.types";

export interface NotificationState {
  isDropdownOpen: boolean;
  filters: NotificationQueryParams;

  setDropdownOpen: (open: boolean) => void;
  toggleDropdown: () => void;
  setFilter: <K extends keyof NotificationQueryParams>(
    key: K,
    value: NotificationQueryParams[K],
  ) => void;
  resetFilters: () => void;
  reset: () => void;
}

const defaultFilters: NotificationQueryParams = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  order: "DESC",
};

const initialState = {
  isDropdownOpen: false,
  filters: { ...defaultFilters },
};

export const useNotificationStore = create<NotificationState>()(
  (set) => ({
    ...initialState,

    setDropdownOpen: (open) => set({ isDropdownOpen: open }),

    toggleDropdown: () =>
      set((state) => ({ isDropdownOpen: !state.isDropdownOpen })),

    setFilter: (key, value) =>
      set((state) => ({
        filters: { ...state.filters, [key]: value },
      })),

    resetFilters: () => set({ filters: { ...defaultFilters } }),

    reset: () => set({ ...initialState }),
  }),
);
