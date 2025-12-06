export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  gender?: number;
  birthDate?: string;
  isAdmin?: boolean;
  status?: 'active' | 'banned';
  rawData?: any;
  addresses: Address[];
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount?: number;
  subcategories?: string[];
  typeLabel?: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  link: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  images?: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

// API Response interfaces
export interface LoginResponse {
  token: string;
  user: NguoiDungView;
}

export interface NguoiDungView {
  maNguoiDung: number;
  hoTen: string;
  ngaySinh?: string;
  sdt?: string;
  email: string;
  taiKhoan: string;
  vaiTro: number;
  trangThai: number;
  avt?: string;
  tieuSu?: string;
  ngayTao: string;
  timeKhoa?: string;
  gioiTinh: number;
}

// Auth API interfaces
export interface LoginRequest {
  taiKhoan: string;
  matKhau: string;
}

// GiaoDien (Settings) interfaces
export interface GiaoDien {
  maGiaoDien: number;
  tenGiaoDien: string;
  loaiGiaoDien: number; // 1=Logo, 2=Banner, 3=Slider
  moTa?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ngayTao: string;
  trangThai: number;
  medias?: Media[];
}

export interface Media {
  maMedia: number;
  loaiMedia: string;
  duongDan: string;
  altMedia?: string;
  linkMedia?: string;
  ngayTao: string;
  trangThai: number;
  maSanPham?: number;
  tenSanPham?: string;
  maBinhLuan?: number;
}

export interface GiaoDienCreate {
  tenGiaoDien: string;
  loaiGiaoDien: number;
  moTa?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  trangThai?: number;
}

export interface GiaoDienEdit {
  maGiaoDien?: number;
  tenGiaoDien?: string;
  loaiGiaoDien?: number;
  moTa?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  trangThai?: number;
}

export interface MediaCreate {
  loaiMedia: string;
  duongDan: string;
  altMedia?: string;
  linkMedia?: string;
  maGiaoDien?: number;
  trangThai?: number;
}

export const SETTING_TYPES = {
  LOGO: 1,
  BANNER: 2,
  SLIDER: 3,
} as const;

export type SettingType = typeof SETTING_TYPES[keyof typeof SETTING_TYPES];