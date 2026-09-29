import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteState {
  favorites: number[];
  toggleFavorite: (branchId: number) => void;
  isFavorite: (branchId: number) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (branchId) => {
        const { favorites } = get();
        if (favorites.includes(branchId)) {
          set({ favorites: favorites.filter((id) => id !== branchId) });
        } else {
          set({ favorites: [...favorites, branchId] });
        }
      },
      isFavorite: (branchId) => {
        return get().favorites.includes(branchId);
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
