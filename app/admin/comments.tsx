// app/admin/comments.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { Search, Star, Eye, EyeOff, Package, ChevronLeft } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import Constants from 'expo-constants';
import { showConfirm } from '@/src/utils/alert';
import { AuthService } from '@/src/services/authService';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.5:5083';
const DEFAULT_AVATAR = require('@/assets/images/icon.png');

interface Comment {
  maBinhLuan: number;
  tieuDe?: string;
  noiDung?: string;
  danhGia?: number;
  ngayTao: string;
  trangThai: number;
  hoTen?: string;
  avt?: string;
  tenSanPham?: string;
  maSanPham?: number;        // <-- Thêm trường ID sản phẩm
  medias: { duongDan: string }[];
}

export default function AdminCommentsScreen() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useUserStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
      if (!isAuthLoading && !user?.isAdmin) {
          router.replace('/');
          return;
      }
      if (user?.isAdmin) {
          fetchComments();
      }
  }, [user, isAuthLoading]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/BinhLuan`);
      const data = await res.json();
      setComments(data || []);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không tải được danh sách bình luận',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
        fetchComments();
    }
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: number) => {
    showConfirm(
      currentStatus === 1 ? 'Ẩn bình luận' : 'Hiện bình luận',
      'Bạn có chắc chắn muốn thay đổi trạng thái?',
      async () => {
        try {
          const authHeaders = await AuthService.getAuthHeaders();
          await fetch(`${API_URL}/api/BinhLuan/${id}/trang-thai`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders
            },
            body: JSON.stringify({ trangThai: currentStatus === 1 ? 0 : 1 }),
          });
          fetchComments();
          Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: 'Cập nhật trạng thái thành công!',
          });
        } catch {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Không thể cập nhật trạng thái',
          });
        }
      }
    );
  };

  const filteredComments = comments.filter(c =>
    c.hoTen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tenSanPham?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.noiDung?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Text style={styles.loadingText}>Đang tải bình luận...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderCommentItem = ({ item }: { item: Comment }) => {
    // Nếu có maSanPham thì cho phép click toàn bộ card để sang chi tiết sản phẩm
    const hasProduct = item.maSanPham != null;

    return (
      <Card style={styles.commentCard}>
        <TouchableOpacity
          activeOpacity={hasProduct ? 0.7 : 1}
          disabled={!hasProduct}
          onPress={() => hasProduct && router.push(`/product/${item.maSanPham}`)}
          style={hasProduct ? styles.touchableCard : undefined}
        >
          <View style={styles.commentHeader}>
            <Image
              source={item.avt ? { uri: API_URL + item.avt } : DEFAULT_AVATAR}
              style={styles.avatar}
              defaultSource={DEFAULT_AVATAR}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.hoTen || 'Khách'}</Text>
              <Text style={styles.productName}>{item.tenSanPham || 'Sản phẩm đã xóa'}</Text>
            </View>
            <View style={styles.rating}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={14} fill={s <= (item.danhGia || 0) ? '#facc15' : 'none'} color="#facc15" />
              ))}
            </View>
          </View>

          {item.tieuDe && <Text style={styles.title}>{item.tieuDe}</Text>}
          <Text style={styles.content}>{item.noiDung || 'Không có nội dung'}</Text>

          {item.medias.length > 0 && (
            <View style={styles.images}>
              {item.medias.slice(0, 3).map((m, i) => (
                <Image key={i} source={{ uri: API_URL + m.duongDan }} style={styles.thumb} />
              ))}
              {item.medias.length > 3 && <Text style={styles.moreImages}>+{item.medias.length - 3}</Text>}
            </View>
          )}
        </TouchableOpacity>

        {/* Footer không nằm trong vùng touchable của sản phẩm để tránh xung đột */}
        <View style={styles.footer}>
          <Text style={styles.date}>{new Date(item.ngayTao).toLocaleDateString('vi-VN')}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.statusBtn, item.trangThai === 1 ? styles.activeBtn : styles.inactiveBtn]}
              onPress={() => handleToggleStatus(item.maBinhLuan, item.trangThai)}
            >
              {item.trangThai === 1 ? <Eye size={18} color="#10b981" /> : <EyeOff size={18} color="#ef4444" />}
              <Text style={[styles.statusText, item.trangThai === 1 ? styles.activeText : styles.inactiveText]}>
                {item.trangThai === 1 ? 'Đang hiển thị' : 'Đã ẩn'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push(`/admin/comment/${item.maBinhLuan}`)}>
              <Text style={styles.detailText}>Chi tiết →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  const handleBack = () => {
    router.push('/admin/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'row', gap: 12, alignItems: 'center' }]}>
        <TouchableOpacity onPress={handleBack}>
           <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
            <Input
              placeholder="Tìm kiếm bình luận..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Search size={20} color={colors.textLight} />}
            />
        </View>
      </View>

      <FlatList
        data={filteredComments}
        keyExtractor={item => item.maBinhLuan.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchComments(); }} />}
        renderItem={renderCommentItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.textLight },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  commentCard: { margin: 16, marginBottom: 8, padding: 16, borderRadius: 16 },
  touchableCard: { flex: 1 }, // Để TouchableOpacity bao bọc phần nội dung chính
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600' },
  productName: { fontSize: 14, color: colors.textLight },
  rating: { flexDirection: 'row' },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  content: { fontSize: 14, lineHeight: 20, color: colors.text, marginBottom: 12 },
  images: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  moreImages: { alignSelf: 'center', color: colors.primary, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  date: { fontSize: 13, color: colors.textLight },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  activeBtn: { backgroundColor: '#ecfdf5' },
  inactiveBtn: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 12 },
  activeText: { color: '#10b981', fontWeight: '600' },
  inactiveText: { color: '#ef4444', fontWeight: '600' },
  detailText: { color: colors.primary, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: colors.textLight },
});