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
      console.log('UserStore - Starting logout process');
      try {
        await AuthService.removeToken();
        console.log('UserStore - Token removed, clearing state');
      } catch (error) {
        console.error('UserStore - Failed to remove token:', error);
        // Continue anyway to clear state
      }
      set({ user: null, isAuthenticated: false });
      console.log('UserStore - Logout complete, state cleared');
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
      console.log('UserStore - checkAuthStatus called');
      try {
        const token = await AuthService.getStoredToken();
        console.log('UserStore - Token from storage:', token ? 'EXISTS' : 'NULL');
        
        if (!token) {
          console.log('UserStore - No token found, setting unauthenticated');
          set({ isAuthenticated: false, user: null });
          return;
        }
        
        // Verify token by calling API to get user profile
        try {
          console.log('UserStore - Verifying token with API');
          // Decode token to get user ID
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.sub;
          
          // Verify token is still valid by fetching user profile
          const userData = await AuthService.getUserProfile(userId);
          console.log('UserStore - Token valid, user data received');
          
          const user: User = {
            id: userData.maNguoiDung.toString(),
            name: userData.hoTen,
            email: userData.email,
            isAdmin: userData.vaiTro === 1,
            addresses: []
          };
          
          set({ user, isAuthenticated: true });
          console.log('UserStore - User session restored');
        } catch (error) {
          // Token invalid or expired
          console.log('UserStore - Token invalid or expired, clearing auth state');
          await AuthService.removeToken();
          set({ isAuthenticated: false, user: null });
        }
      } catch (error) {
        console.error('UserStore - Failed to check auth status:', error);
        set({ isAuthenticated: false, user: null });
      }
    },

    refreshUserProfile: async () => {
      const currentUser = get().user;
      if (!currentUser) return false;

      try {
        set({ isLoading: true });
        const userData = await AuthService.getUserProfile(parseInt(currentUser.id));
        console.log('UserStore - Refreshed user data:', userData);
        
        // Map API response to frontend User type with all fields
        const updatedUser: User = {
          id: userData.maNguoiDung.toString(),
          name: userData.hoTen,
          email: userData.email,
          phone: userData.sdt || '',
          bio: userData.tieuSu || '',
          gender: userData.gioiTinh || 0,
          birthDate: userData.ngaySinh || '',
          avatar: userData.avt || '',
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
        
        // Convert frontend format to backend format (PascalCase for C# backend)
        const updateData = {
          MaNguoiDung: parseInt(currentUser.id),
          HoTen: updates.name,
          Email: updates.email,
          Sdt: updates.phone || '',
          VaiTro: currentUser.isAdmin ? 1 : 0, // 1: Admin, 0: User
          TrangThai: 1,
          TieuSu: updates.bio || '',
          GioiTinh: updates.gender || 0,
          NgaySinh: updates.birthDate || null
        };

        console.log('UserStore - Sending update data:', updateData);
        const result = await AuthService.updateUserProfile(parseInt(currentUser.id), updateData);
        console.log('UserStore - Update result:', result);
        
        // Update local user data with all fields
        const updatedUser: User = {
          ...currentUser,
          name: result.hoTen || currentUser.name,
          email: result.email || currentUser.email,
          phone: result.sdt || currentUser.phone,
          bio: result.tieuSu || currentUser.bio,
          gender: result.gioiTinh ?? currentUser.gender,
          birthDate: result.ngaySinh || currentUser.birthDate,
          avatar: result.avt || currentUser.avatar
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
