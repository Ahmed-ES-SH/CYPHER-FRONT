import { create } from "zustand";

export interface CategoriesSelectionState {
  selectedCategoryId: string | null;
  expandedCategoryIds: string[];
  filterDraft: string;

  setSelectedCategoryId: (id: string | null) => void;
  setExpandedCategoryIds: (ids: string[]) => void;
  toggleExpandedCategoryId: (id: string) => void;
  setFilterDraft: (draft: string) => void;
  reset: () => void;
}

const initialState = {
  selectedCategoryId: null as string | null,
  expandedCategoryIds: [] as string[],
  filterDraft: "",
};

export const useCategoriesSelectionStore = create<CategoriesSelectionState>()(
  (set) => ({
    ...initialState,

    setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

    setExpandedCategoryIds: (ids) => set({ expandedCategoryIds: ids }),

    toggleExpandedCategoryId: (id) =>
      set((state) => ({
        expandedCategoryIds: state.expandedCategoryIds.includes(id)
          ? state.expandedCategoryIds.filter((eid) => eid !== id)
          : [...state.expandedCategoryIds, id],
      })),

    setFilterDraft: (draft) => set({ filterDraft: draft }),

    reset: () => set({ ...initialState }),
  }),
);
