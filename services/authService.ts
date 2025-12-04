import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LoginRequest, LoginResponse } from '@/types';

export class AuthService {
  private static getApiUrl(): string {
    // Fallback URL for development
    const fallbackUrl = 'http://localhost:5083/api';
    
    // Try to get from app.json config
    const configUrl = Constants.expoConfig?.extra?.apiUrl;
    
    console.log('AuthService - API URL Config:', {
      configUrl,
      fallbackUrl,
      constants: Constants.expoConfig?.extra
    });
    
    return configUrl || fallbackUrl;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.getApiUrl()}${endpoint}`;
    
    console.log('AuthService - Making request to:', url);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/NguoiDung/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async register(userData: any): Promise<any> {
    return this.request<any>('/NguoiDung', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async forgotPassword(email: string): Promise<any> {
    return this.request<any>('/NguoiDung/forgot-password', {
      method: 'POST',
      body: JSON.stringify(email),
    });
  }

  static async resetPassword(resetData: any): Promise<any> {
    return this.request<any>('/NguoiDung/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    });
  }

  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  static async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  static async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
