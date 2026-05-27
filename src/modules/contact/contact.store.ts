import { create } from "zustand";

export interface ContactSelectionState {
  selectedContactId: string | null;
  filterDraft: string;

  setSelectedContactId: (id: string | null) => void;
  setFilterDraft: (draft: string) => void;
  reset: () => void;
}

const initialState = {
  selectedContactId: null as string | null,
  filterDraft: "",
};

export const useContactSelectionStore = create<ContactSelectionState>()(
  (set) => ({
    ...initialState,

    setSelectedContactId: (id) => set({ selectedContactId: id }),

    setFilterDraft: (draft) => set({ filterDraft: draft }),

    reset: () => set({ ...initialState }),
  }),
);
