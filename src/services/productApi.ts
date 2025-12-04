import { api } from '../config/api';

export interface ProductFilterParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  maLoai?: number;
  maThuongHieu?: number;
  minPrice?: number;
  maxPrice?: number;
  gioiTinh?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

export const productApi = {
  // Tìm kiếm + lọc nâng cao (chính)
  filter: async (params: ProductFilterParams = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const res = await fetch(`${api.products.filter}?${searchParams}`);
    if (!res.ok) throw new Error('Không tải được sản phẩm');
    return res.json();
  },

  // Sản phẩm mới nhất
  newest: async (page = 1, pageSize = 12) => {
    const res = await fetch(`${api.products.newest}?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Lỗi tải sản phẩm mới');
    return res.json();
  },

  // Sản phẩm hot sale
  hotSale: async (page = 1, pageSize = 12) => {
    const res = await fetch(`${api.products.hotSale}?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Lỗi tải sản phẩm hot');
    return res.json();
  },

  // Chi tiết sản phẩm
  getById: async (id: number) => {
    const res = await fetch(api.products.detail(id));
    if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
    return res.json();
  },
};