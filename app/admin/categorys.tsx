// app/admin/categorys.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { Plus, Search, Edit, Trash2, Tag, Package } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.5:5083';

interface Category {
  maDanhMuc: number;
  tenDanhMuc: string;
  loaiDanhMuc: 1 | 2 | 3;
  hinhAnh?: string;
  trangThai: number;
  ngayTao: string;
}

const getTypeLabel = (loai: number): string => {
  return loai === 1 ? 'Loại sản phẩm' : loai === 2 ? 'Thương hiệu' : 'Hashtag';
};

const getTypeColor = (loai: number): string => {
  return loai === 1 ? '#3b82f6' : loai === 2 ? '#10b981' : '#8b5cf6';
};

export default function AdminCategoriesScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/DanhMuc`);
      setCategories(res.data || []);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải danh sách danh mục',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user?.isAdmin) {
      router.replace('/');
      return;
    }
    fetchCategories();
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCategories();
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/DanhMuc/search?keyword=${encodeURIComponent(searchQuery)}`);
      setCategories(res.data || []);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Tìm kiếm thất bại',
        text2: 'Không tìm thấy kết quả',
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Xóa danh mục',
      `Bạn có chắc chắn muốn xóa "${name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/DanhMuc/${id}`);
              setCategories(prev => prev.filter(c => c.maDanhMuc !== id));
              Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã xóa danh mục!',
              });
            } catch {
              Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể xóa. Vui lòng thử lại.',
              });
            }
          },
        },
      ]
    );
  };

  if (!user?.isAdmin) return null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh mục...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Tìm kiếm danh mục..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          leftIcon={<Search size={20} color={colors.textLight} />}
          containerStyle={styles.searchInput}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.countText}>{categories.length} danh mục</Text>
        <Button
          title="Thêm mới"
          onPress={() => router.push('/admin/category/new')}
          size="small"
          leftIcon={<Plus size={16} color="#fff" />}
        />
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item.maDanhMuc.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCategories(); }} />
        }
        renderItem={({ item }) => (
          <Card style={styles.categoryCard}>
            <View style={styles.categoryRow}>
              {/* Ảnh + Tên + Loại */}
              <View style={styles.leftSection}>
                {/* Ảnh danh mục */}
                <View style={styles.imageWrapper}>
                  {item.hinhAnh ? (
                    <Image
                      source={{ uri: API_URL + item.hinhAnh }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Package size={28} color={colors.textLight} />
                    </View>
                  )}
                </View>

                {/* Thông tin */}
                <View style={styles.info}>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {item.tenDanhMuc}
                  </Text>
                  <View style={styles.typeBadge}>
                    <Tag size={14} color={getTypeColor(item.loaiDanhMuc)} />
                    <Text style={[styles.typeText, { color: getTypeColor(item.loaiDanhMuc) }]}>
                      {getTypeLabel(item.loaiDanhMuc)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Nút hành động */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push(`/admin/category/${item.maDanhMuc}`)}
                >
                  <Edit size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item.maDanhMuc, item.tenDanhMuc)}
                >
                  <Trash2 size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textLight, fontSize: 16 },
  header: {
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: { marginBottom: 0 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countText: { fontSize: 15, color: colors.textLight, fontWeight: '500' },
  listContent: { padding: 16 },

  categoryCard: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageWrapper: {
    marginRight: 14,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  placeholderImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  info: {
    flex: 1,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    elevation: 2,
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
  },
  empty: {
    padding: 60,
    alignItems: 'center',
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 17,
    color: colors.textLight,
    fontWeight: '500',
  },
});