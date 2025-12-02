import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, size: string, color: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity, size, color) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => 
              item.product.id === product.id && 
              item.size === size && 
              item.color === color
          );
          
          if (existingItemIndex !== -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += quantity;
            return { items: updatedItems };
          } else {
            return { 
              items: [...state.items, { product, quantity, size, color }] 
            };
          }
        });
      },
      
      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) => 
              !(item.product.id === productId && 
                item.size === size && 
                item.color === color)
          )
        }));
      },
      
      updateQuantity: (productId, size, color, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (
              item.product.id === productId && 
              item.size === size && 
              item.color === color
            ) {
              return { ...item, quantity };
            }
            return item;
          })
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discountPrice || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);