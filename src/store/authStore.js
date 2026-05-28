import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, profile: null, loading: false }),
}));

export const selectRole = (s) => s.profile?.rol ?? null;
export const selectIsAdmin = (s) => s.profile?.rol === 'admin';
