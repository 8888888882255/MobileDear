import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import Constants from 'expo-constants';
import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { banners as mockBanners } from '@/mocks/banners';
import colors from '@/constants/colors';
import { Category, Banner, GiaoDien, SETTING_TYPES } from '@/types';
import { SettingsService } from '@/src/services/settingsService';

interface ApiProduct {
  maSanPham: number;
  tenSanPham: string;
  moTa?: string;
  giaBan: number;
  giaSale?: number;
  giaSauSale: number;
  soLuong: number;
  danhGiaTrungBinh?: number;
  soLuongDanhGia?: number;
  medias: Array<{ duongDan: string }>;
  tenLoai?: string;
  tenThuongHieu?: string;
  phanTramSale?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  salePercent?: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  sizes: string[];
  colors: string[];
  tags: string[];
}

interface DanhMuc {
  maDanhMuc: number;
  tenDanhMuc: string;
  loaiDanhMuc: number;
  hinhAnh?: string;
  ngayTao: string;
  trangThai: number;
}

const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://192.168.1.11:5083';

const mapApiProductToProduct = (item: ApiProduct): Product => {
  return {
    id: String(item.maSanPham),
    name: item.tenSanPham,
    description: item.moTa || '',
    price: item.giaBan,
    discountPrice: item.giaSauSale ?? item.giaSale ?? undefined,
    salePercent: item.phanTramSale ?? undefined,
    images: (item.medias || []).map(m => {
      const path = m.duongDan || '';
      if (path.startsWith('http') || path.startsWith('data:')) return path;
      return `${API_URL}${path}`;
    }),
    category: item.tenLoai || 'Khác',
    rating: item.danhGiaTrungBinh ?? 0,
    reviewCount: item.soLuongDanhGia ?? 0,
    stock: item.soLuong,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sizes: [],
    colors: [],
    tags: [],
  };
};

const mapApiCategoryToCategory = (item: DanhMuc): Category => {
  const loai = item.loaiDanhMuc;
  const typeLabel = loai === 1 ? 'Loại Sản Phẩm' : loai === 2 ? 'Thương Hiệu' : 'Khác';

  return {
    id: String(item.maDanhMuc),
    name: item.tenDanhMuc,
    image: item.hinhAnh && (item.hinhAnh.startsWith('http') || item.hinhAnh.startsWith('data:')) 
      ? item.hinhAnh 
      : `${API_URL}${item.hinhAnh || ''}`,
    productCount: 0,
    typeLabel,
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [hotSaleProducts, setHotSaleProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>(mockBanners);
  const [promoBanner, setPromoBanner] = useState<Banner | null>(null);
  const [isLoadingNewest, setIsLoadingNewest] = useState(false);
  const [isLoadingHotSale, setIsLoadingHotSale] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);

  // Map GiaoDien to Banner format
  const mapGiaoDienToBanner = (item: GiaoDien): Banner | null => {
    const media = item.medias?.[0];
    if (!media) return null;
    
    const imagePath = media.duongDan;
    const imageUrl = imagePath.startsWith('http') || imagePath.startsWith('data:')
      ? imagePath
      : `${API_URL}${imagePath}`;
    
    return {
      id: String(item.maGiaoDien),
      image: imageUrl,
      title: item.tenGiaoDien,
      subtitle: item.moTa || undefined,
      buttonText: media.linkMedia ? 'Xem ngay' : undefined,
      link: media.linkMedia || '/search',
    };
  };

  // Load sliders from API (only sliders, not banners)
  const loadBanners = useCallback(async () => {
    setIsLoadingBanners(true);
    try {
      console.log('🎨 Loading sliders from API...');
      const sliders = await SettingsService.getActiveSliders();
      
      const mappedBanners = sliders
        .map(mapGiaoDienToBanner)
        .filter((b): b is Banner => b !== null);
      
      if (mappedBanners.length > 0) {
        setBanners(mappedBanners);
        console.log('✅ Sliders loaded from API:', mappedBanners.length);
      } else {
        console.log('ℹ️ No API sliders, using mock data');
        setBanners(mockBanners);
      }
    } catch (error) {
      console.error('❌ Error loading sliders:', error);
      setBanners(mockBanners); // Fallback to mock data
    } finally {
      setIsLoadingBanners(false);
    }
  }, []);

  // Load active promo banner
  const loadPromoBanner = useCallback(async () => {
    try {
      console.log('🖼️ Loading promo banner...');
      const activeBanners = await SettingsService.getActiveBanners();
      
      if (activeBanners.length > 0) {
        // Take the first active banner
        const banner = mapGiaoDienToBanner(activeBanners[0]);
        setPromoBanner(banner);
        console.log('✅ Promo banner loaded:', banner?.title);
      } else {
        setPromoBanner(null);
      }
    } catch (error) {
      console.error('❌ Error loading promo banner:', error);
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      // Fetch both product categories (type=1) and brands (type=2) so brands appear
      const endpoints = [
        `${API_URL}/api/DanhMuc/filter/type/1`,
        `${API_URL}/api/DanhMuc/filter/type/2`,
      ];

      const responses = await Promise.all(endpoints.map(e => fetch(e)));
      const jsons = await Promise.all(responses.map(r => r.json()));

      const lists: DanhMuc[] = [];
      jsons.forEach((d) => {
        const arr = Array.isArray(d) ? d : (d.data || []);
        if (Array.isArray(arr)) lists.push(...arr);
      });

      // Deduplicate by maDanhMuc just in case
      const byId = new Map<number, DanhMuc>();
      lists.forEach((it) => byId.set(it.maDanhMuc, it));
      const merged = Array.from(byId.values());

      const mapped = merged.map(mapApiCategoryToCategory);
      setCategories(mapped);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Load newest products
  const loadNewestProducts = useCallback(async () => {
    setIsLoadingNewest(true);
    try {
      console.log('📦 Loading newest products...');
      const res = await fetch(`${API_URL}/api/SanPham/newest?page=1&pageSize=20`);
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      const products = Array.isArray(data) ? data : (data.data || []);
      const mapped = products.map((item: ApiProduct) => mapApiProductToProduct(item));
      
      setNewestProducts(mapped);
      console.log('✅ Newest products loaded:', mapped.length);
    } catch (err) {
      console.error('❌ Load newest products error:', err);
    } finally {
      setIsLoadingNewest(false);
    }
  }, []);

  // Load hot sale products
  const loadHotSaleProducts = useCallback(async () => {
    setIsLoadingHotSale(true);
    try {
      console.log('🔥 Loading hot sale products...');
      const res = await fetch(`${API_URL}/api/SanPham/hot-sale?page=1&pageSize=20`);
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      const products = Array.isArray(data) ? data : (data.data || []);
      const mapped = products.map((item: ApiProduct) => mapApiProductToProduct(item));
      
      setHotSaleProducts(mapped);
      console.log('✅ Hot sale products loaded:', mapped.length);
    } catch (err) {
      console.error('❌ Load hot sale products error:', err);
    } finally {
      setIsLoadingHotSale(false);
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    loadBanners();
    loadPromoBanner();
    loadCategories();
    loadNewestProducts();
    loadHotSaleProducts();
  }, [loadBanners, loadPromoBanner, loadCategories, loadNewestProducts, loadHotSaleProducts]);

  // Refresh products when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadBanners();
      loadPromoBanner();
      loadCategories();
      loadNewestProducts();
      loadHotSaleProducts();
    }, [loadBanners, loadPromoBanner, loadCategories, loadNewestProducts, loadHotSaleProducts])
  );

  const navigateToAllProducts = () => {
    router.push('/search');
  };

  const navigateToAllCategories = () => {
    router.push('/search?view=categories');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.storeName}>DearMent</Text>
          <Text style={styles.storeTagline}>Thời Trang & Phong Cách</Text>
        </View>

        <BannerCarousel banners={banners} />

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh Mục</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={navigateToAllCategories}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>

        {/* Active Promo Banner */}
        {promoBanner && (
          <View style={styles.promoBannerContainer}>
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => {
                if (promoBanner.link) {
                  router.push(promoBanner.link as any);
                }
              }}
            >
              <Image 
                source={{ uri: promoBanner.image }} 
                style={styles.promoBannerImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản Phẩm Nổi Bật</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={navigateToAllProducts}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {isLoadingNewest ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : newestProducts.length > 0 ? (
            <View style={styles.productsGrid}>
              {newestProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có sản phẩm nổi bật</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hàng Mới Về</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={navigateToAllProducts}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {isLoadingHotSale ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : hotSaleProducts.length > 0 ? (
            <View style={styles.productsGrid}>
              {hotSaleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có sản phẩm mới về</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  storeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  storeTagline: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  promoBannerContainer: {
    marginBottom: 24,
  },
  promoBannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
});
