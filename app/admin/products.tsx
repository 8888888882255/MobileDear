// app/(admin)/products/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import Constants from 'expo-constants';

const API_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://192.168.1.2:5083';

type SanPham = {
  maSanPham: number;
  tenSanPham: string;
  slug: string;
  giaBan: number;
  giaSale?: number;
  giaSauSale: number;
  phanTramSale?: number;
  soLuong: number;
  medias: { duongDan: string }[];
  tenLoai?: string;
  tenThuongHieu?: string;
  trangThai: number;
  ngayTao: string;
};

export default function AdminProductsScreen() {
  const router = useRouter();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<SanPham[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SanPham[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'tenSanPham' | 'giaBan' | 'soLuong' | 'ngayTao'>('ngayTao');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bảo vệ admin
  if (!user?.isAdmin) {
    router.replace('/');
    return null;
  }

  // Load sản phẩm từ API
  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/SanPham`);
      if (!res.ok) throw new Error('Không tải được sản phẩm');
      const data: SanPham[] = await res.json();

      // Chỉ hiển thị sản phẩm đang hoạt động (nếu cần)
      const activeProducts = data.filter(p => p.trangThai === 1);
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, []);

  // Tìm kiếm
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(p =>
      p.tenSanPham.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tenLoai?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tenThuongHieu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Sắp xếp
  useEffect(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      let valA: any, valB: any;

      switch (sortBy) {
        case 'tenSanPham':
          valA = a.tenSanPham; valB = b.tenSanPham;
          break;
        case 'giaBan':
          valA = a.giaBan; valB = b.giaBan;
          break;
        case 'soLuong':
          valA = a.soLuong; valB = b.soLuong;
          break;
        case 'ngayTao':
          valA = new Date(a.ngayTao).getTime();
          valB = new Date(b.ngayTao).getTime();
          break;
        default:
          valA = valB = 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(sorted);
  }, [sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/SanPham/${id}`, {
                method: 'DELETE',
              });
              if (!res.ok) throw new Error('Xóa thất bại');
              Alert.alert('Thành công', 'Đã xóa sản phẩm');
              loadProducts(); // Refresh danh sách
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa');
            }
          },
        },
      ]
    );
  };

  const getFirstImage = (medias: any[]) => {
    if (!medias || medias.length === 0) return 'https://via.placeholder.com/60';
    return `${API_URL}${medias[0].duongDan.startsWith('/') ? '' : '/'}${medias[0].duongDan}`;
  };

  const renderProduct = ({ item }: { item: SanPham }) => (
    <Card style={styles.productCard}>
      <View style={styles.productRow}>
        <Image
          source={{ uri: getFirstImage(item.medias) }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.tenSanPham}
          </Text>

          <View style={styles.priceRow}>
            {item.giaSale ? (
              <>
                <Text style={styles.salePrice}>₫{item.giaSauSale.toLocaleString()}</Text>
                <Text style={styles.originalPrice}>₫{item.giaBan.toLocaleString()}</Text>
                {item.phanTramSale && (
                  <View style={styles.saleBadge}>
                    <Text style={styles.saleBadgeText}>-{Math.round(item.phanTramSale)}%</Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.normalPrice}>₫{item.giaBan.toLocaleString()}</Text>
            )}
          </View>

          <Text style={styles.stockText}>Tồn kho: {item.soLuong.toLocaleString()}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/admin/product/${item.maSanPham}`)}
          >
            <Edit size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.maSanPham)}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={colors.textLight} />}
          containerStyle={{
            flex: 1,
            height: 50
          }}

        />

        <Button
          title="Thêm"
          size="small"
          icon={<Plus size={18} color="#fff" />}
          onPress={() => router.push('/admin/product/new')}
          style={{
            height: 48,
            paddingVertical: 0,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -15,     // 🔥 đẩy nút lên trên 10px
          }}
        />


      </View>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultText}>{filteredProducts.length} sản phẩm</Text>
        <View style={styles.sortButtons}>
          {(['tenSanPham', 'giaBan', 'soLuong', 'ngayTao'] as const).map(field => (
            <TouchableOpacity
              key={field}
              style={[
                styles.sortBtn,
                sortBy === field && styles.activeSortBtn
              ]}
              onPress={() => handleSort(field)}
            >
              <Text style={[
                styles.sortBtnText,
                sortBy === field && styles.activeSortBtnText
              ]}>
                {field === 'tenSanPham' && 'Tên'}
                {field === 'giaBan' && 'Giá'}
                {field === 'soLuong' && 'Tồn kho'}
                {field === 'ngayTao' && 'Mới nhất'}
              </Text>
              {sortBy === field && (
                sortOrder === 'asc' ?
                  <ChevronUp size={14} color={colors.primary} /> :
                  <ChevronDown size={14} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Danh sách */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.maSanPham.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textLight, fontSize: 16 },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    gap: 12,
  },
  searchInput: { flex: 1 },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultText: { fontSize: 14, color: colors.textLight },
  sortButtons: { flexDirection: 'row', gap: 8 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeSortBtn: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  sortBtnText: { fontSize: 13, color: colors.text, marginRight: 4 },
  activeSortBtnText: { color: colors.primary, fontWeight: '600' },
  list: { padding: 16 },
  productCard: { marginBottom: 12, padding: 12 },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productImage: { width: 70, height: 70, borderRadius: 10 },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  productCategory: { fontSize: 13, color: colors.textLight, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  salePrice: { fontSize: 15, fontWeight: 'bold', color: colors.primary },
  originalPrice: { fontSize: 13, textDecorationLine: 'line-through', color: colors.textLight },
  normalPrice: { fontSize: 15, fontWeight: 'bold', color: colors.text },
  saleBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  stockText: { fontSize: 13, color: colors.success },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.error + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: colors.textLight },
});