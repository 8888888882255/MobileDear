import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Address } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  addAddress: (address: Address) => void;
  updateAddress: (addressId: string, updates: Partial<Address>) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
}

const defaultUser: User = {
  id: '1',
  name: 'Nguyễn Văn An',
  email: 'nguyenvanan@example.com',
  isAdmin: false,
  addresses: [
    {
      id: '1',
      name: 'Nhà riêng',
      street: '123 Đường Chính',
      city: 'Hà Nội',
      state: 'Hà Nội',
      zipCode: '100000',
      country: 'Việt Nam',
      isDefault: true
    }
  ]
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: (user) => {
        set({ user, isAuthenticated: true });
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },
      
      addAddress: (address) => {
        set((state) => {
          if (!state.user) return state;
          
          const updatedAddresses = address.isDefault 
            ? state.user.addresses.map(addr => ({ ...addr, isDefault: false }))
            : [...state.user.addresses];
          
          return {
            user: {
              ...state.user,
              addresses: [...updatedAddresses, address]
            }
          };
        });
      },
      
      updateAddress: (addressId, updates) => {
        set((state) => {
          if (!state.user) return state;
          
          let updatedAddresses = [...state.user.addresses];
          
          if (updates.isDefault) {
            updatedAddresses = updatedAddresses.map(addr => ({
              ...addr,
              isDefault: addr.id === addressId
            }));
          } else {
            updatedAddresses = updatedAddresses.map(addr => 
              addr.id === addressId ? { ...addr, ...updates } : addr
            );
          }
          
          return {
            user: {
              ...state.user,
              addresses: updatedAddresses
            }
          };
        });
      },
      
      removeAddress: (addressId) => {
        set((state) => {
          if (!state.user) return state;
          
          const filteredAddresses = state.user.addresses.filter(
            addr => addr.id !== addressId
          );
          
          if (
            state.user.addresses.find(addr => addr.id === addressId)?.isDefault &&
            filteredAddresses.length > 0
          ) {
            filteredAddresses[0].isDefault = true;
          }
          
          return {
            user: {
              ...state.user,
              addresses: filteredAddresses
            }
          };
        });
      },
      
      setDefaultAddress: (addressId) => {
        set((state) => {
          if (!state.user) return state;
          
          return {
            user: {
              ...state.user,
              addresses: state.user.addresses.map(addr => ({
                ...addr,
                isDefault: addr.id === addressId
              }))
            }
          };
        });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);