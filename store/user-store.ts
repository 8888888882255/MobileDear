import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Address } from '@/types';
import { AuthService } from '@/src/services/authService';
import { NguoiDungView } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  addAddress: (address: Address) => void;
  updateAddress: (addressId: string, updates: Partial<Address>) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  checkAuthStatus: () => Promise<void>;
  refreshUserProfile: () => Promise<boolean>;
  updateUserProfile: (updates: any) => Promise<boolean>;
}

export const useUserStore = create<UserState>()(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      
      try {
        const response = await AuthService.login({
          taiKhoan: email,
          matKhau: password
        });

        // Store token
        await AuthService.storeToken(response.token);

        // Map API response to frontend User type
        const user: User = {
          id: response.user.maNguoiDung.toString(),
          name: response.user.hoTen,
          email: response.user.email,
          isAdmin: response.user.vaiTro === 1,
          addresses: []
        };

        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        set({ isLoading: false });
        return false;
      }
    },

    logout: async () => {
      try {
        await AuthService.removeToken();
      } catch (error) {
        console.error('Failed to remove token:', error);
      }
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
    },

    checkAuthStatus: async () => {
      try {
        const token = await AuthService.getStoredToken();
        if (token) {
          // You could verify token validity here by making a test request
          set({ isAuthenticated: true });
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
      }
    },

    refreshUserProfile: async () => {
      const currentUser = get().user;
      if (!currentUser) return false;

      try {
        set({ isLoading: true });
        const userData = await AuthService.getUserProfile(parseInt(currentUser.id));
        
        // Map API response to frontend User type
        const updatedUser: User = {
          id: userData.maNguoiDung.toString(),
          name: userData.hoTen,
          email: userData.email,
          isAdmin: userData.vaiTro === 1,
          addresses: currentUser.addresses // Keep existing addresses
        };

        set({ user: updatedUser, isLoading: false });
        return true;
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
        set({ isLoading: false });
        return false;
      }
    },

    updateUserProfile: async (updates: any) => {
      const currentUser = get().user;
      if (!currentUser) return false;

      try {
        set({ isLoading: true });
        
        // Convert frontend format to backend format
        const updateData = {
          maNguoiDung: parseInt(currentUser.id),
          hoTen: updates.name,
          email: updates.email,
          sdt: updates.phone,
          vaiTro: updates.isAdmin ? 1 : 2,
          trangThai: 1,
          tieuSu: updates.bio || '',
          gioiTinh: updates.gender || 0,
          ngaySinh: updates.birthDate
        };

        const result = await AuthService.updateUserProfile(parseInt(currentUser.id), updateData);
        
        // Update local user data
        const updatedUser: User = {
          ...currentUser,
          name: result.hoTen,
          email: result.email,
          // Note: phone, bio, gender, birthDate would need to be added to User type
        };

        set({ user: updatedUser, isLoading: false });
        return true;
      } catch (error) {
        console.error('Failed to update user profile:', error);
        set({ isLoading: false });
        return false;
      }
    }
  })
);
