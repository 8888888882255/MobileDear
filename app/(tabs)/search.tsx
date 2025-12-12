import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams } from 'expo-router';
import { Search as SearchIcon, Grid, List, Filter } from 'lucide-react-native';
import Constants from 'expo-constants';
import { Input } from '@/components/ui/Input';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import colors from '@/constants/colors';
import { useWindowDimensions } from 'react-native';

type LayoutMode = 'grid' | 'list';

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
}

interface PaginatedResponse {
  items: ApiProduct[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface ProductFilterParams {
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

// API Configuration
const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'https://fasion-a-b9cvdggjhudzbfe8.southeastasia-01.azurewebsites.net';

const api = {
  baseUrl: API_URL,
  products: {
    filter: `${API_URL}/api/SanPham/filter`,
    newest: `${API_URL}/api/SanPham/newest`,
    hotSale: `${API_URL}/api/SanPham/hot-sale`,
    detail: (id: number) => `${API_URL}/api/SanPham/${id}`,
  },
};

// Product API Functions
const filterProducts = async (params: ProductFilterParams = {}) => {
  try {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const url = `${api.products.filter}?${searchParams}`;
    console.log('🔍 Calling API:', url);
    
    const res = await fetch(url);
    
    console.log('📡 Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API Error: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ API Data received:', data);
    
    return data;
  } catch (error) {
    console.error('🚨 Fetch Error:', error);
    throw error;
  }
};

// const { width } = Dimensions.get('window'); // Removed static width
const GAP = 16;
export default function SearchScreen() {
  const params = useLocalSearchParams();
  const { width: windowWidth } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [filteredProducts, setFilteredProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Calculate dynamic columns
  const getNumColumns = () => {
    if (layoutMode === 'list') {
      return windowWidth > 768 ? 2 : 1;
    }
    if (windowWidth > 1024) return 4;
    if (windowWidth > 768) return 3;
    return 2;
  };
  const numColumns = getNumColumns();
  
  // Determine max width based on layout mode
  const contentMaxWidth = 1200;

  // Calculate card width
  const getCardWidth = () => {
    const effectiveContainerWidth = Math.min(windowWidth, contentMaxWidth);

    // Padding horizontal (GAP) is usually applied on container or column wrapper
    // For List Mode with > 1 column, we treat it similarly to Grid but with different aspect ratio in ProductCard
    if (layoutMode === 'list') {
       if (numColumns === 1) {
          return effectiveContainerWidth - (GAP * 2); 
       }
       // 2 columns list mode -> treat like grid calculation
       return (effectiveContainerWidth - 48) / numColumns; 
    }
    
    // Grid mode logic
    // We strictly use (effectiveWidth - 48) / numColumns to ensure it fits in the centered container
    return (effectiveContainerWidth - 48) / numColumns; 
  };
  
  const itemWidth = getCardWidth();
  const finalCardWidth = itemWidth;

  const containerStyle = windowWidth > contentMaxWidth 
    ? { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' } 
    : { width: '100%' };

  // Sync search bar with content
  const searchContentStyle = windowWidth > contentMaxWidth 
    ? { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' } 
    : { width: '100%' };

  // Tải sản phẩm từ API
  const loadProducts = useCallback(async (query = '', page = 1) => {
    setIsLoading(true);
    try {
      console.log('📦 Loading products - Query:', query, 'Page:', page);
      
      const response = await filterProducts({
        keyword: query || undefined,
        page,
        pageSize: 12,
        sortBy: 'newest',
      });

      console.log('📊 Response type:', Array.isArray(response) ? 'Array' : 'Object');
      console.log('📊 Response:', response);

      // API returns array directly: [{...}, {...}]
      let products: ApiProduct[] = [];
      
      if (Array.isArray(response)) {
        // Direct array response
        products = response;
        console.log('✨ Setting products (array):', products.length, 'items');
        setFilteredProducts(products);
        setCurrentPage(1);
        setTotalPages(1);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Object with data property
        products = response.data;
        console.log('✨ Setting products (data):', products.length, 'items');
        setFilteredProducts(products);
        
        if (response.pagination) {
          setCurrentPage(response.pagination.currentPage || 1);
          setTotalPages(response.pagination.totalPages || 1);
        }
      } else {
        console.warn('⚠️ Response invalid structure:', response);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('❌ Load products error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: `Không thể tải danh sách sản phẩm: ${error}`,
      });
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load sản phẩm ban đầu hoặc theo category
  useEffect(() => {
    if (params.category) {
      // Tìm kiếm theo category
      loadProducts(String(params.category), 1);
    } else {
      // Load tất cả sản phẩm
      loadProducts('', 1);
    }
  }, [params.category, loadProducts]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setCurrentPage(1);
      
      // Debounce tìm kiếm
      const timer = setTimeout(() => {
        loadProducts(text, 1);
      }, 500);

      return () => clearTimeout(timer);
    },
    [loadProducts]
  );

  const toggleLayoutMode = () => {
    setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid');
  };

  // Xử lý load thêm trang
  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      loadProducts(searchQuery, currentPage + 1);
    }
  };

  // Render 1 item sản phẩm
  const renderProductItem = ({ item }: { item: ApiProduct }) => {
    // Convert API product format to ProductCard format
    const displayProduct = {
      id: String(item.maSanPham),
      name: item.tenSanPham,
      description: item.moTa || '',
      price: item.giaBan,
      // `giaSauSale` is the final price after sale; map to `discountPrice`
      discountPrice: item.giaSauSale ?? item.giaSale ?? undefined,
      // map sale percent from API (phanTramSale) so ProductCard can display it
      salePercent: (item as any).phanTramSale ?? undefined,
      images: item.medias?.map(m => {
        const path = m.duongDan || '';
        // If path already absolute, use it. Otherwise prefix with API base url.
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return `${api.baseUrl}${path}`;
      }) || [],
      category: item.tenLoai || 'Khác',
      rating: item.danhGiaTrungBinh || 0,
      reviewCount: item.soLuongDanhGia || 0,
      stock: item.soLuong,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sizes: [],
      colors: [],
      tags: [],
    };

    const isList = layoutMode === 'list';
    // If list mode has > 1 column, we treat it visually like a grid but with "list" variant cards.
    // So container width should be finalCardWidth.
    // Only if it is strictly single column list do we use 100%.
    const containerWidth = (isList && numColumns === 1) ? '100%' : finalCardWidth;
    
    return (
      <View style={{ 
        width: containerWidth, 
        marginBottom: GAP,
      }}>
        <ProductCard 
          product={displayProduct} 
          width={finalCardWidth} 
          variant={layoutMode}
        />
      </View>
    );
  };

  // Render footer với loading
  const renderFooter = () => {
    if (!isLoading || currentPage === 1) return null;
    return (
      <View style={styles.footerLoadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderSkeletons = () => (
    <View style={styles.productsGrid}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <ProductCardSkeleton key={i} width={finalCardWidth} />
      ))}
    </View>
  );

  const renderListHeader = () => (
    <Text style={styles.resultsText}>
      Đã tìm thấy {filteredProducts.length} sản phẩm
    </Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.searchContainer, searchContentStyle as any]}>
        <Input
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon={<SearchIcon size={20} color={colors.textLight} />}
          containerStyle={styles.searchInputContainer}
        />

        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Sản phẩm</Text>
            <Filter size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.layoutButton} onPress={toggleLayoutMode}>
            {layoutMode === 'grid' ? (
              <Grid size={20} color={colors.primary} />
            ) : (
              <List size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
           {renderSkeletons()}
        </View>
      ) : (
        <>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => String(item.maSanPham)}
            numColumns={numColumns}
            key={layoutMode + numColumns} // Force re-render on layout/column change
            contentContainerStyle={[styles.listContent, containerStyle as any]}
            columnWrapperStyle={
              numColumns > 1
                ? styles.column
                : undefined
            }
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
                <Text style={styles.emptySubtext}>Hãy thử từ khóa khác</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card, padding: 16 },
  searchContainer: { marginBottom: 16 },
  searchInputContainer: { marginBottom: 12 },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonText: { marginRight: 8, color: colors.primary, fontWeight: '500' },
  layoutButton: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultsText: { marginBottom: 16, fontSize: 14, color: colors.textLight },

  // ⭐⭐ Layout đều 4 cạnh ⭐⭐
  listContent: {
    paddingHorizontal: GAP,
    paddingBottom: 20,
  },

  // ⭐⭐ Giãn đều 2 cột trái/phải ⭐⭐
  column: {
    justifyContent: 'space-between',
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textLight, fontSize: 16 },

  footerLoadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptySubtext: { fontSize: 14, color: colors.textLight },
});
