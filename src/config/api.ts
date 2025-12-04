import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getApiUrl(): string {
  // Get from app.json config first
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configUrl) {
    return configUrl;
  }
  
  // Auto-detect based on platform for development
  const LOCAL_IP = '192.168.1.11'; // Thay bằng IP WiFi của bạn
  const PORT = '5083';
  
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}`;
  } else if (Platform.OS === 'android') {
    // Android Emulator uses 10.0.2.2 for localhost
    if (__DEV__ && !Constants.isDevice) {
      return `http://10.0.2.2:${PORT}`;
    }
    return `http://${LOCAL_IP}:${PORT}`;
  } else {
    // iOS
    if (__DEV__ && !Constants.isDevice) {
      return `http://localhost:${PORT}`;
    }
    return `http://${LOCAL_IP}:${PORT}`;
  }
}

const API_URL = getApiUrl();
// const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://192.168.1.11:5083';

export const api = {
  baseUrl: API_URL,
  products: {
    filter: `${API_URL}/api/SanPham/filter`,
    newest: `${API_URL}/api/SanPham/newest`,
    hotSale: `${API_URL}/api/SanPham/hot-sale`,
    detail: (id: number) => `${API_URL}/api/SanPham/${id}`,
  },
};