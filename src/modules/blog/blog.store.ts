import { create } from "zustand";

export interface BlogUIState {
  selectedArticleId: string | null;
  filterDraft: string;
  activeCategorySlug: string | null;

  setSelectedArticleId: (id: string | null) => void;
  setFilterDraft: (draft: string) => void;
  setActiveCategorySlug: (slug: string | null) => void;
  reset: () => void;
}

const initialState = {
  selectedArticleId: null as string | null,
  filterDraft: "",
  activeCategorySlug: null as string | null,
};

export const useBlogUIStore = create<BlogUIState>()((set) => ({
  ...initialState,

  setSelectedArticleId: (id) => set({ selectedArticleId: id }),

  setFilterDraft: (draft) => set({ filterDraft: draft }),

  setActiveCategorySlug: (slug) => set({ activeCategorySlug: slug }),

  reset: () => set({ ...initialState }),
}));
