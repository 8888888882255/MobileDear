import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { ProductCard } from '@/components/ProductCard';
import colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function WishlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://192.168.1.11:5083';

  const loadWishlist = async () => {
    setIsLoading(true);
    try {
      console.log("📌 Loading wishlist...");
      // Lấy danh sách ID yêu thích từ AsyncStorage
      const raw = await AsyncStorage.getItem("wishlist");
      const wishlist = raw ? JSON.parse(raw) : [];
      // Format: [{ id: "12", likedAt: "2025-12-04T21:00:00" }]
      if (wishlist.length === 0) {
        setItems([]);
        return;
      }
      // Gọi API sản phẩm (không lọc ID)
      const res = await fetch(
        `${API_URL}/api/SanPham/filter?page=1&pageSize=2000&sortBy=newest`
      );
      if (!res.ok) throw new Error("API error " + res.status);
      const data = await res.json();
      const products = Array.isArray(data) ? data : data.data || [];
      // ⭐ Chỉ giữ lại sản phẩm có ID nằm trong wishlist
      const filtered = products.filter((item: ApiProduct) =>
        wishlist.some((w: any) => Number(w.id) === item.maSanPham)
      );
      // ⭐ Map dữ liệu sang ProductCard format
      let mapped = filtered.map((item: ApiProduct) => {
        const id = String(item.maSanPham);
        const saved = wishlist.find((w: any) => w.id === id);
        return {
          id,
          name: item.tenSanPham,
          description: item.moTa || "",
          price: item.giaBan,
          discountPrice: item.giaSauSale ?? item.giaSale ?? null,
          salePercent: item.phanTramSale ?? undefined,
          images: (item.medias || []).map(m => {
            const path = m.duongDan || "";
            return path.startsWith("http") || path.startsWith("data:")
              ? path
              : `${API_URL}${path}`;
          }),
          category: item.tenLoai ?? "Khác",
          subcategory: item.tenThuongHieu ?? undefined,
          rating: item.danhGiaTrungBinh ?? 0,
          reviewCount: item.soLuongDanhGia ?? 0,
          stock: item.soLuong ?? 0,
          // ⭐ Quan trọng: giữ thời gian yêu thích để sort
          likedAt: saved?.likedAt || "2000-01-01",
        };
      });
      // ⭐ Đưa sản phẩm mới yêu thích lên đầu
      mapped.sort(
        (a: any, b: any) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()
      );
      setItems(mapped);
      console.log("✅ Wishlist loaded:", mapped.length);
    } catch (err) {
      console.error("❌ Wishlist load error:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách yêu thích!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleClearWishlist = () => {
    if (items.length === 0) return;

    Alert.alert(
      'Xóa danh sách yêu thích',
      'Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi danh sách yêu thích không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa hết', 
          style: 'destructive', 
          onPress: async () => {
            await AsyncStorage.removeItem('wishlist');
            setItems([]);
          } 
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyTitle, { marginTop: 12 }]}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Heart size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Danh sách yêu thích trống</Text>
          <Text style={styles.emptySubtitle}>
            Hãy lưu lại những sản phẩm bạn yêu thích để xem sau
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danh sách yêu thích</Text>
        <TouchableOpacity onPress={handleClearWishlist}>
          <Text style={styles.clearText}>Xóa hết</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  clearText: {
    fontSize: 14,
    color: colors.error,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});