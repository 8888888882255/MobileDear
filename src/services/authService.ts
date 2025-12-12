import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { LoginRequest, LoginResponse } from '@/types';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

export class AuthService {
  private static getApiUrl(): string {
    // Get from app.json config
    const configUrl = Constants.expoConfig?.extra?.apiUrl;
    if (configUrl) {
      // Ensure /api suffix
      return configUrl.endsWith('/api') ? configUrl : `${configUrl}/api`;
    }
    
    // Fallback to localhost if no config
    console.warn('No apiUrl found in app.json, using localhost:5083');
    return 'https://fasion-a-b9cvdggjhudzbfe8.southeastasia-01.azurewebsites.net/api';
  }

  private static async request<T>(
    endpoint: string, 
    options: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.getApiUrl()}${endpoint}`;
    const { timeout = 10000, retries = 1 } = options;
    
    console.log('AuthService - Making request to:', url);
    console.log('Request options:', { 
      ...options, 
      headers: { ...options.headers }
    });
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    return this.executeRequestWithRetry<T>(url, config, retries, timeout);
  }

  private static async executeRequestWithRetry<T>(
    url: string, 
    config: RequestInit, 
    retries: number, 
    timeout: number,
    attempt: number = 1
  ): Promise<T> {
    try {
      // Tạo AbortController cho timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      console.log(`AuthService - Attempt ${attempt}/${retries + 1} to:`, url);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      // Xử lý response theo status code
      if (response.status === 200 || response.status === 201) {
        // Success - parse JSON response
        const data = await response.json();
        console.log('Success response data:', data);
        return data;
      }
      
      // Error responses - parse error details
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Lỗi không xác định từ server' };
      }
      
      // Xử lý các status code cụ thể
      const errorMessage = this.handleHttpError(response.status, errorData);
      throw new Error(errorMessage);
      
    } catch (error: any) {
      console.error(`AuthService - Request failed (attempt ${attempt}):`, error);
      
      // Retry logic cho network errors và server errors
      const shouldRetry = attempt <= retries && (
        error.name === 'AbortError' || // Timeout
        error.message.includes('Không thể kết nối') || // Network error
        error.message.includes('tạm thời không khả dụng') // Server error
      );
      
      if (shouldRetry) {
        console.log(`AuthService - Retrying in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.executeRequestWithRetry(url, config, retries, timeout, attempt + 1);
      }
      
      // Network errors hoặc các lỗi khác
      if (error.name === 'AbortError') {
        console.error('Timeout Error:', error);
        throw new Error('Yêu cầu hết thời gian chờ. Vui lòng thử lại.');
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network Error:', error);
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }
      
      // Nếu không retry được, throw error gốc
      throw error;
    }
  }

  private static handleHttpError(status: number, errorData: any): string {
    switch (status) {
      case 400:
        console.error('Bad Request - Validation Error:', errorData);
        return errorData.message || 'Dữ liệu không hợp lệ';
        
      case 401:
        console.error('Unauthorized - Authentication Error:', errorData);
        return errorData.message || 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
        
      case 403:
        console.error('Forbidden - Authorization Error:', errorData);
        return errorData.message || 'Bạn không có quyền thực hiện hành động này.';
        
      case 404:
        console.error('Not Found - Resource Error:', errorData);
        return errorData.message || 'Không tìm thấy tài nguyên yêu cầu.';
        
      case 409:
        console.error('Conflict - Duplicate Error:', errorData);
        return errorData.message || 'Dữ liệu đã tồn tại.';
        
      case 422:
        console.error('Unprocessable Entity - Validation Error:', errorData);
        return errorData.message || 'Dữ liệu không thể xử lý.';
        
      case 429:
        console.error('Too Many Requests - Rate Limit Error:', errorData);
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
        
      case 500:
        console.error('Internal Server Error:', errorData);
        return 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
        
      case 502:
      case 503:
      case 504:
        console.error('Server Error:', status, errorData);
        return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
        
      default:
        console.error(`HTTP Error ${status}:`, errorData);
        return errorData.message || `Lỗi HTTP ${status}: Không thể xử lý yêu cầu.`;
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
      console.log('AuthService - Removing token from AsyncStorage');
      await AsyncStorage.removeItem('auth_token');
      console.log('AuthService - Token removed successfully');
    } catch (error) {
      console.error('Failed to remove token:', error);
      throw error; // Re-throw to let caller know it failed
    }
  }

  static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get user profile information
  static async getUserProfile(userId: number): Promise<any> {
    const headers = await this.getAuthHeaders();
    return this.request<any>(`/NguoiDung/${userId}`, {
      method: 'GET',
      headers
    });
  }

  // Update user profile information
  // Backend expects [FromForm] so we need to send FormData
  static async updateUserProfile(userId: number, updateData: any): Promise<any> {
    const token = await this.getStoredToken();
    const url = `${this.getApiUrl()}/NguoiDung/${userId}`;
    
    console.log('AuthService - Updating profile with FormData:', updateData);
    
    // Create FormData for [FromForm] binding
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(updateData).forEach(key => {
      const value = updateData[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value.toString());
      }
    });
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData
      });
      
      console.log('AuthService - Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthService - Update error:', errorText);
        throw new Error(errorText || 'Cập nhật thất bại');
      }
      
      const result = await response.json();
      console.log('AuthService - Update result:', result);
      return result;
    } catch (error) {
      console.error('AuthService - Update profile failed:', error);
      throw error;
    }
  }

  // Delete user account (Admin only)
  static async deleteUser(userId: number): Promise<any> {
    const headers = await this.getAuthHeaders();
    return this.request<any>(`/NguoiDung/${userId}`, {
      method: 'DELETE',
      headers
    });
  }

  // Search users (Admin only)
  static async searchUsers(keyword: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    return this.request<any>(`/NguoiDung/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers
    });
  }

  // Filter users by role (Admin only)
  static async getUsersByRole(role: number): Promise<any> {
    const headers = await this.getAuthHeaders();
    return this.request<any>(`/NguoiDung/filter/role/${role}`, {
      method: 'GET',
      headers
    });
  }

  // Get all users (Admin only)
  static async getAllUsers(): Promise<any> {
    const headers = await this.getAuthHeaders();
    return this.request<any>('/NguoiDung', {
      method: 'GET',
      headers
    });
  }
}
