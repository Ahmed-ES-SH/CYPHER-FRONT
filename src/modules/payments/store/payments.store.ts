import { create } from "zustand";
import type { PaymentQueryParams } from "../types/payments.types";

export interface PaymentFilterState {
  selectedPaymentId: string | null;
  filters: PaymentQueryParams;

  setSelectedPaymentId: (id: string | null) => void;
  setFilter: (key: keyof PaymentQueryParams, value: unknown) => void;
  resetFilters: () => void;
  reset: () => void;
}

const defaultFilters: PaymentQueryParams = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  order: "DESC",
};

const initialState = {
  selectedPaymentId: null as string | null,
  filters: { ...defaultFilters },
};

export const usePaymentFilterStore = create<PaymentFilterState>()(
  (set) => ({
    ...initialState,

    setSelectedPaymentId: (id) => set({ selectedPaymentId: id }),

    setFilter: (key, value) =>
      set((state) => ({
        filters: { ...state.filters, [key]: value },
      })),

    resetFilters: () => set({ filters: { ...defaultFilters } }),

    reset: () => set({ ...initialState }),
  }),
);
