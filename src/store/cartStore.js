import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  loading: true,
  setItems: (items) => set({ items, loading: false }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ items: [], loading: false }),
}));

export const selectCartTotal = (s) =>
  s.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
export const selectCartCount = (s) =>
  s.items.reduce((acc, i) => acc + i.cantidad, 0);
