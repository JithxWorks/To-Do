import { create } from 'zustand';
import type { FilterKind, SortKind } from '../types';

interface ViewState {
  filter: FilterKind;
  categoryId: string | null;
  sort: SortKind;
  setFilter: (filter: FilterKind) => void;
  setCategoryId: (categoryId: string | null) => void;
  setSort: (sort: SortKind) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  filter: 'today',
  categoryId: null,
  sort: 'due',
  setFilter: (filter) => set({ filter }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setSort: (sort) => set({ sort }),
}));
