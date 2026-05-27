import { create } from "zustand";
import type { NotificationQueryParams } from "./notifications.types";

export interface NotificationState {
  unreadCount: number;
  isDropdownOpen: boolean;
  filters: NotificationQueryParams;

  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  setDropdownOpen: (open: boolean) => void;
  toggleDropdown: () => void;
  setFilter: (key: keyof NotificationQueryParams, value: any) => void;
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
  unreadCount: 0,
  isDropdownOpen: false,
  filters: { ...defaultFilters },
};

export const useNotificationStore = create<NotificationState>()(
  (set) => ({
    ...initialState,

    setUnreadCount: (count) => set({ unreadCount: count }),

    decrementUnread: () =>
      set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

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
