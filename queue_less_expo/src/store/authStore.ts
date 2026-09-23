import { create } from 'zustand';
import { saveToken, removeToken } from '../services/tokenStorage';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => Promise<void>;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: async (token) => {
    // State'ni darhol yangilaymiz, shunda Home sahifaga o'tganda token allaqachon xotirada bo'ladi
    set({ token });
    if (token) {
      await saveToken(token);
    } else {
      await removeToken();
    }
  },
  isLoading: true,
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    set({ token: null });
    await removeToken();
  }
}));
