import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { useRouter, useFocusEffect } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { ProductCard } from '@/components/ProductCard';
import colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://192.168.1.11:5083';
// Nếu chạy trên emulator Android thì localhost phải là 10.0.2.2
// Nếu chạy trên iOS simulator hoặc thiết bị thật thì dùng localhost hoặc IP máy

interface WishlistItem {
  id: string;
  likedAt: string;
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
  subcategory?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  likedAt: string;
}

export default function WishlistScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProductById = async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_URL}/api/SanPham/${id}`);
      if (!response.ok) {
        console.warn(`Sản phẩm ID ${id} không tồn tại hoặc lỗi (${response.status})`);
        return null;
      }
      const data = await response.json();

      const baseUrl = API_URL.endsWith('/') ? API_URL : API_URL + '/';

      return {
        id: String(data.maSanPham),
        name: data.tenSanPham || 'Không có tên',
        description: data.moTa || '',
        price: data.giaBan || 0,
        discountPrice: data.giaSauSale > 0 ? data.giaSauSale : (data.giaSale || undefined),
        salePercent: data.phanTramSale || undefined,
        images: (data.medias || [])
          .map((m: any) => {
            const path = m.duongDan || '';
            if (!path) return null;
            return path.startsWith('http') || path.startsWith('data:')
              ? path
              : baseUrl + path.replace(/^\//, '');
          })
          .filter(Boolean),
        category: data.tenLoai || 'Khác',
        subcategory: data.tenThuongHieu || undefined,
        rating: data.danhGiaTrungBinh || 0,
        reviewCount: data.soLuongDanhGia || 0,
        stock: data.soLuong || 0,
        likedAt: new Date().toISOString(), // sẽ được gán lại đúng từ wishlist
      };
    } catch (err) {
      console.warn(`Lỗi khi lấy sản phẩm ID ${id}:`, err);
      return null;
    }
  };

  const loadWishlist = useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem('wishlist');
      const wishlist: WishlistItem[] = raw ? JSON.parse(raw) : [];

      if (wishlist.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      // Lấy dữ liệu từng sản phẩm song song
      const fetchPromises = wishlist.map(async (item) => {
        const product = await fetchProductById(item.id);
        if (product) {
          product.likedAt = item.likedAt; // Gán lại thời gian yêu thích chính xác
          return product;
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);
      const validProducts = results.filter((p): p is Product => p !== null);

      // Sắp xếp theo thời gian yêu thích (mới nhất trước)
      validProducts.sort(
        (a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()
      );

      setProducts(validProducts);
      console.log(`Đã tải ${validProducts.length}/${wishlist.length} sản phẩm yêu thích`);
    } catch (error) {
      console.error('Lỗi tải wishlist:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tải lại khi quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist])
  );

  const clearWishlist = () => {
    Alert.alert(
      'Xóa toàn bộ',
      'Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa hết',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('wishlist');
            setProducts([]);
            Alert.alert('Thành công', 'Đã xóa toàn bộ danh sách yêu thích');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải sản phẩm yêu thích...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Heart size={80} color={colors.textLight} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySubtitle}>
            Nhấn vào biểu tượng trái tim để lưu sản phẩm bạn thích
          </Text>
          <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/')}>
            <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yêu thích ({products.length})</Text>
        {products.length > 0 && (
          <TouchableOpacity onPress={clearWishlist}>
            <Text style={styles.clearText}>Xóa hết</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: colors.textLight },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 19, fontWeight: 'bold', color: colors.text },
  clearText: { fontSize: 15, color: colors.error, fontWeight: '600' },
  listContainer: { padding: 12 },
  gridRow: { justifyContent: 'space-between', marginBottom: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { marginTop: 20, fontSize: 20, fontWeight: 'bold', color: colors.text },
  emptySubtitle: { marginTop: 8, fontSize: 14, color: colors.textLight, textAlign: 'center' },
  exploreButton: { marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8 },
  exploreButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});