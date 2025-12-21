// app/admin/categorys.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { Plus, Search, Edit, Trash2, Tag, Package, ArrowLeft } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import axios from 'axios';
import Constants from 'expo-constants';
import { showDestructiveConfirm } from '@/src/utils/alert';
import { AuthService } from '@/src/services/authService';

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
  const { user, isLoading: isAuthLoading } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<0 | 1>(1); // 1 = Hoạt động, 0 = Vô hiệu hóa
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

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
    if (!isAuthLoading && !user?.isAdmin) {
      router.replace('/');
      return;
    }
    if (user?.isAdmin) {
      fetchCategories();
    }
  }, [user, isAuthLoading]);

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
    showDestructiveConfirm(
      'Xóa danh mục',
      `Bạn có chắc chắn muốn xóa "${name}"?`,
      'Xóa',
      async () => {
        try {
          const headers = await AuthService.getAuthHeaders();
          await axios.delete(`${API_URL}/api/DanhMuc/${id}`, { headers });
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
      }
    );
  };

  // Lọc danh mục theo tab đang chọn
  const filteredCategories = categories.filter(c => c.trangThai === activeTab);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  // Reset về trang 1 khi đổi tab
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (isAuthLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            leftIcon={<Search size={20} color={colors.textLight} />}
            containerStyle={styles.searchInput}
          />
        </View>
        <Button
          title="Thêm"
          onPress={() => router.push('/admin/category/new')}
          
          leftIcon={<Plus size={16} color="#fff" />}
        />
      </View>

      {/* Tab điều hướng */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
            Hoạt động
          </Text>
          <View style={[styles.badge, activeTab === 1 && styles.activeBadge]}>
            <Text style={[styles.badgeText, activeTab === 1 && styles.activeBadgeText]}>
              {categories.filter(c => c.trangThai === 1).length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
            Vô hiệu hóa
          </Text>
          <View style={[styles.badge, activeTab === 0 && styles.activeBadge]}>
            <Text style={[styles.badgeText, activeTab === 0 && styles.activeBadgeText]}>
              {categories.filter(c => c.trangThai === 0).length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.countText}>
          {filteredCategories.length} danh mục • Trang {currentPage}/{totalPages || 1}
        </Text>
      </View>

      <FlatList
        data={paginatedCategories}
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
                {/* Chỉ hiện nút xóa khi đang ở tab Hoạt động */}
                {activeTab === 1 && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(item.maDanhMuc, item.tenDanhMuc)}
                  >
                    <Trash2 size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>
              {activeTab === 1 ? 'Chưa có danh mục hoạt động' : 'Chưa có danh mục vô hiệu hóa'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Phân trang */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationBtn, currentPage === 1 && styles.paginationBtnDisabled]}
            onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Text style={[styles.paginationBtnText, currentPage === 1 && styles.paginationBtnTextDisabled]}>
              ← Trước
            </Text>
          </TouchableOpacity>

          <View style={styles.pageNumbers}>
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              // Hiển thị trang đầu, cuối và các trang xung quanh trang hiện tại
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <TouchableOpacity
                    key={pageNum}
                    style={[styles.pageBtn, currentPage === pageNum && styles.pageBtnActive]}
                    onPress={() => setCurrentPage(pageNum)}
                  >
                    <Text style={[styles.pageBtnText, currentPage === pageNum && styles.pageBtnTextActive]}>
                      {pageNum}
                    </Text>
                  </TouchableOpacity>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <Text key={pageNum} style={styles.pageDots}>
                    ...
                  </Text>
                );
              }
              return null;
            })}
          </View>

          <TouchableOpacity
            style={[styles.paginationBtn, currentPage === totalPages && styles.paginationBtnDisabled]}
            onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <Text style={[styles.paginationBtnText, currentPage === totalPages && styles.paginationBtnTextDisabled]}>
              Sau →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textLight, fontSize: 16 },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: { marginBottom: 0 },

  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  activeTab: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
  },
  badge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  activeBadgeText: {
    color: '#fff',
  },

  listHeader: {
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

  // Pagination styles
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paginationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  paginationBtnDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  paginationBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  paginationBtnTextDisabled: {
    color: colors.textLight,
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActive: {
    backgroundColor: colors.primary,
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pageBtnTextActive: {
    color: '#fff',
  },
  pageDots: {
    fontSize: 14,
    color: colors.textLight,
    paddingHorizontal: 4,
  },
});