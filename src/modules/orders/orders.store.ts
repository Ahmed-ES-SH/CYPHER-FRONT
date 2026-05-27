import { create } from "zustand";
import type { OrderStatus, OrderQueryParams } from "./orders.types";

export interface OrderFilterState {
  selectedOrderId: string | null;
  filters: OrderQueryParams;

  setSelectedOrderId: (id: string | null) => void;
  setFilter: (key: keyof OrderQueryParams, value: any) => void;
  resetFilters: () => void;
  reset: () => void;
}

const defaultFilters: OrderQueryParams = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  order: "DESC",
};

const initialState = {
  selectedOrderId: null as string | null,
  filters: { ...defaultFilters },
};

export const useOrderFilterStore = create<OrderFilterState>()(
  (set) => ({
    ...initialState,

    setSelectedOrderId: (id) => set({ selectedOrderId: id }),

    setFilter: (key, value) =>
      set((state) => ({
        filters: { ...state.filters, [key]: value },
      })),

    resetFilters: () => set({ filters: { ...defaultFilters } }),

    reset: () => set({ ...initialState }),
  }),
);
