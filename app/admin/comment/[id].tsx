// app/admin/comment/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Star } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.5:5083';
const DEFAULT_AVATAR = require('@/assets/images/icon.png');

export default function CommentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUserStore();

  const [comment, setComment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) {
      router.replace('/');
      return;
    }

    const fetchComment = async () => {
      try {
        const res = await fetch(`${API_URL}/api/BinhLuan/${id}`);
        const data = await res.json();
        setComment(data);
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tải được bình luận',
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchComment();
  }, [id]);

  const handleToggleStatus = async () => {
    Alert.alert(
      comment.trangThai === 1 ? 'Ẩn bình luận' : 'Hiển thị bình luận',
      'Bạn có chắc chắn?',
      [
        { text: 'Hủy' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/api/BinhLuan/${id}/trang-thai`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trangThai: comment.trangThai === 1 ? 0 : 1 }),
              });
              setComment({ ...comment, trangThai: comment.trangThai === 1 ? 0 : 1 });
              Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Đã cập nhật trạng thái',
              });
            } catch {
              Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể cập nhật',
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!comment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Không tìm thấy bình luận</Text>
        <Button title="Quay lại" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết bình luận</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userSection}>
          <Image source={comment.avt ? { uri: API_URL + comment.avt } : DEFAULT_AVATAR} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{comment.hoTen || 'Khách'}</Text>
            <Text style={styles.productName}>Sản phẩm: {comment.tenSanPham}</Text>
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Đánh giá</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={24} fill={s <= comment.danhGia ? '#facc15' : 'none'} color="#facc15" />
            ))}
          </View>
        </View>

        {comment.tieuDe && (
          <View style={styles.section}>
            <Text style={styles.label}>Tiêu đề</Text>
            <Text style={styles.text}>{comment.tieuDe}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Nội dung</Text>
          <Text style={styles.text}>{comment.noiDung || 'Không có nội dung'}</Text>
        </View>

        {comment.medias?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Hình ảnh ({comment.medias.length})</Text>
            <View style={styles.imagesGrid}>
              {comment.medias.map((m: any, i: number) => (
                <Image key={i} source={{ uri: API_URL + m.duongDan }} style={styles.fullImage} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Ngày tạo</Text>
          <Text style={styles.text}>{new Date(comment.ngayTao).toLocaleString('vi-VN')}</Text>
        </View>

        <Button
          title={comment.trangThai === 1 ? "Ẩn bình luận" : "Hiển thị bình luận"}
          variant={comment.trangThai === 1 ? "outline" : "secondary"}
          onPress={handleToggleStatus}
          icon={comment.trangThai === 1 ? <EyeOff size={20} /> : <Eye size={20} />}
          style={{ marginTop: 30 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  content: { padding: 20 },
  userSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  userName: { fontSize: 18, fontWeight: '600' },
  productName: { fontSize: 15, color: colors.textLight, marginTop: 4 },
  ratingSection: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors.textLight },
  stars: { flexDirection: 'row', gap: 4 },
  section: { marginBottom: 24 },
  text: { fontSize: 16, lineHeight: 24 },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  fullImage: { width: 120, height: 120, borderRadius: 12 },
});
