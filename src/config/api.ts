import Constants from 'expo-constants';

const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://192.168.1.11:5083';

export const api = {
  baseUrl: API_URL,
  products: {
    filter: `${API_URL}/api/SanPham/filter`,
    newest: `${API_URL}/api/SanPham/newest`,
    hotSale: `${API_URL}/api/SanPham/hot-sale`,
    detail: (id: number) => `${API_URL}/api/SanPham/${id}`,
  },
};