import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types';

interface WishlistItem {
  id: string;
  likedAt: string;
}

interface WishlistState {
  items: Product[];
  // Add method to save just IDs to AsyncStorage
  saveWishlistIds: () => Promise<void>;
  // Add method to load IDs from AsyncStorage and sync
  loadWishlistIds: () => Promise<void>;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      // Save only product IDs and timestamps to AsyncStorage
      saveWishlistIds: async () => {
        const items = get().items;
        const wishlistIds: WishlistItem[] = items.map(item => ({
          id: item.id,
          likedAt: new Date().toISOString(),
        }));
        try {
          await AsyncStorage.setItem('wishlist', JSON.stringify(wishlistIds));
          console.log('💾 Wishlist IDs saved:', wishlistIds.length);
        } catch (error) {
          console.error('❌ Failed to save wishlist IDs:', error);
        }
      },

      // Load IDs from AsyncStorage (full products still in items)
      loadWishlistIds: async () => {
        try {
          const raw = await AsyncStorage.getItem('wishlist');
          if (raw) {
            const ids = JSON.parse(raw) as WishlistItem[];
            console.log('📂 Loaded wishlist IDs from storage:', ids.length);
          }
        } catch (error) {
          console.error('❌ Failed to load wishlist IDs:', error);
        }
      },
      
      addItem: (product) => {
        set((state) => {
          if (state.items.some(item => item.id === product.id)) {
            return state;
          }
          const newItems = [product, ...state.items]; // Add to front
          // Save IDs to storage after adding
          get().saveWishlistIds();
          return { items: newItems };
        });
      },
      
      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== productId);
          // Save IDs to storage after removing
          get().saveWishlistIds();
          return { items: newItems };
        });
      },
      
      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId);
      },
      
      clearWishlist: () => {
        set({ items: [] });
        get().saveWishlistIds();
      }
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);