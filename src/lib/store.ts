import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteComic {
  slug: string;
  title: string;
  image?: string;
  chapter?: string;
  addedAt: string;
}

export interface HistoryItem {
  slug: string;
  chapterSlug: string;
  title: string;
  chapterTitle: string;
  image?: string;
  lastRead: string;
}

interface ComicStore {
  favorites: FavoriteComic[];
  history: HistoryItem[];
  
  // Favorites actions
  addFavorite: (comic: Omit<FavoriteComic, 'addedAt'>) => void;
  removeFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  
  // History actions
  addToHistory: (item: Omit<HistoryItem, 'lastRead'>) => void;
  clearHistory: () => void;
  getHistory: () => HistoryItem[];
}

export const useComicStore = create<ComicStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      history: [],
      
      addFavorite: (comic) => {
        const { favorites } = get();
        const exists = favorites.some((f) => f.slug === comic.slug);
        if (!exists) {
          set({
            favorites: [...favorites, { ...comic, addedAt: new Date().toISOString() }],
          });
        }
      },
      
      removeFavorite: (slug) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.slug !== slug),
        }));
      },
      
      isFavorite: (slug) => {
        return get().favorites.some((f) => f.slug === slug);
      },
      
      addToHistory: (item) => {
        const { history } = get();
        // Remove existing entry for this comic
        const filtered = history.filter((h) => h.slug !== item.slug);
        // Add new entry at the beginning
        set({
          history: [{ ...item, lastRead: new Date().toISOString() }, ...filtered].slice(0, 50), // Keep only last 50
        });
      },
      
      clearHistory: () => {
        set({ history: [] });
      },
      
      getHistory: () => {
        return get().history;
      },
    }),
    {
      name: 'kleereader-storage',
    }
  )
);
