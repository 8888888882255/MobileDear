import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  GiaoDien,
  GiaoDienCreate,
  GiaoDienEdit,
  Media,
  MediaCreate,
  SETTING_TYPES,
} from '@/types';
import { AuthService } from './authService';

/**
 * Service for managing GiaoDien (Settings) - Logo, Banner, Slider
 */
export class SettingsService {
  private static getApiUrl(): string {
    const configUrl = Constants.expoConfig?.extra?.apiUrl;
    if (configUrl) {
      return configUrl.endsWith('/api') ? configUrl : `${configUrl}/api`;
    }
    console.warn('No apiUrl found in app.json, using localhost:5083');
    return 'https://fasion-a-b9cvdggjhudzbfe8.southeastasia-01.azurewebsites.net/api';
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.getApiUrl()}${endpoint}`;
    console.log('SettingsService - Making request to:', url);

    const authHeaders = await AuthService.getAuthHeaders();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP Error ${response.status}`
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error('SettingsService - Request failed:', error);
      throw error;
    }
  }

  // ============ GiaoDien CRUD ============

  /**
   * Get all GiaoDien settings
   */
  static async getAll(): Promise<GiaoDien[]> {
    return this.request<GiaoDien[]>('/GiaoDien');
  }

  /**
   * Get GiaoDien by ID
   */
  static async getById(id: number): Promise<GiaoDien> {
    return this.request<GiaoDien>(`/GiaoDien/${id}`);
  }

  /**
   * Get GiaoDien by type (1=Logo, 2=Banner, 3=Slider)
   */
  static async getByType(type: number): Promise<GiaoDien[]> {
    return this.request<GiaoDien[]>(`/GiaoDien/type/${type}`);
  }

  /**
   * Get active GiaoDien (trangThai = 1)
   */
  static async getActive(): Promise<GiaoDien[]> {
    return this.request<GiaoDien[]>('/GiaoDien/active');
  }

  /**
   * Get active logos
   */
  static async getActiveLogos(): Promise<GiaoDien[]> {
    const all = await this.getActive();
    return all.filter((g) => g.loaiGiaoDien === SETTING_TYPES.LOGO);
  }

  /**
   * Get active banners
   */
  static async getActiveBanners(): Promise<GiaoDien[]> {
    const all = await this.getActive();
    return all.filter((g) => g.loaiGiaoDien === SETTING_TYPES.BANNER);
  }

  /**
   * Get active sliders
   */
  static async getActiveSliders(): Promise<GiaoDien[]> {
    const all = await this.getActive();
    return all.filter((g) => g.loaiGiaoDien === SETTING_TYPES.SLIDER);
  }

  /**
   * Search GiaoDien by keyword
   */
  static async search(keyword: string): Promise<GiaoDien[]> {
    return this.request<GiaoDien[]>(
      `/GiaoDien/search/${encodeURIComponent(keyword)}`
    );
  }

  /**
   * Filter GiaoDien by status
   */
  static async filterByStatus(status: number): Promise<GiaoDien[]> {
    return this.request<GiaoDien[]>(`/GiaoDien/status/${status}`);
  }

  /**
   * Create new GiaoDien
   */
  static async create(data: GiaoDienCreate): Promise<GiaoDien> {
    return this.request<GiaoDien>('/GiaoDien', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update GiaoDien
   */
  static async update(id: number, data: GiaoDienEdit): Promise<GiaoDien> {
    return this.request<GiaoDien>(`/GiaoDien/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete GiaoDien
   */
  static async delete(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/GiaoDien/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Media Management ============

  /**
   * Get media list for a GiaoDien
   */
  static async getMedia(giaoDienId: number): Promise<Media[]> {
    return this.request<Media[]>(`/GiaoDien/${giaoDienId}/media`);
  }

  /**
   * Add media to GiaoDien
   */
  static async addMedia(
    giaoDienId: number,
    media: MediaCreate
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/GiaoDien/${giaoDienId}/media`, {
      method: 'POST',
      body: JSON.stringify(media),
    });
  }

  /**
   * Remove media from GiaoDien
   */
  static async removeMedia(
    giaoDienId: number,
    mediaId: number
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/GiaoDien/${giaoDienId}/media/${mediaId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Upload media file to GiaoDien
   */
  static async uploadMedia(
    giaoDienId: number,
    file: any,
    options?: { altText?: string; link?: string }
  ): Promise<Media> {
    const url = `${this.getApiUrl()}/GiaoDien/${giaoDienId}/upload-media`;
    console.log('Upload URL:', url);
    console.log('File object received:', file);

    // Create FormData for [FromForm] binding
    const formData = new FormData();

    // Handle file upload with platform-specific logic
    if (file && typeof file === 'object' && 'uri' in file) {
      if (Platform.OS === 'web') {
        // For web: convert to blob for proper FormData handling
        try {
          console.log('Web platform detected, converting to blob');
          const response = await fetch(file.uri);
          const blob = await response.blob();
          const fileName = file.name || file.fileName || `upload_${Date.now()}.jpg`;
          console.log('Uploading file as blob:', fileName, blob.size, 'bytes');
          // @ts-ignore
          formData.append('file', blob, fileName);
        } catch (error) {
          console.error('Failed to convert file to blob on web:', error);
          // Fallback to direct file append
          formData.append('file', file);
        }
      } else {
        // For native platforms: use {uri, name, type} format
        console.log('Native platform detected, using uri/name/type format');
        const fileData = {
          uri: file.uri,
          name: file.name || file.fileName || `upload_${Date.now()}.jpg`,
          type: file.type || file.mimeType || 'image/jpeg',
        };

        console.log('Prepared file data for upload:', fileData);

        // @ts-ignore - React Native FormData accepts this format
        formData.append('file', fileData);
      }
    } else {
      console.log('Invalid file object, using fallback');
      formData.append('file', file);
    }

    // Add optional fields
    if (options?.altText) formData.append('altText', options.altText);
    if (options?.link) formData.append('link', options.link);

    const authHeaders = await AuthService.getAuthHeaders();
    console.log('Auth headers:', authHeaders);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeaders,
        // Don't set Content-Type for FormData - browser/native will set it with boundary
      },
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Upload error response:', errorData);
      throw new Error(errorData.message || errorData.title || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Upload success:', result);
    return result;
  }

  // ============ Helper Methods ============

  /**
   * Get setting type label in Vietnamese
   */
  static getTypeLabel(type: number): string {
    switch (type) {
      case SETTING_TYPES.LOGO:
        return 'Logo';
      case SETTING_TYPES.BANNER:
        return 'Banner';
      case SETTING_TYPES.SLIDER:
        return 'Slider';
      default:
        return 'Khác';
    }
  }

  /**
   * Build full image URL from path
   */
  static getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;

    const configUrl = Constants.expoConfig?.extra?.apiUrl || 'https://fasion-a-b9cvdggjhudzbfe8.southeastasia-01.azurewebsites.net';
    const baseUrl = configUrl.replace('/api', '');
    return `${baseUrl}${path}`;
  }
}
