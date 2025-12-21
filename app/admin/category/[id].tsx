// app/admin/category/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { AuthService } from '@/src/services/authService';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.5:5083';

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isLoading: isAuthLoading } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthLoading && !user?.isAdmin) {
      router.replace('/');
    }
  }, [user, isAuthLoading]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<number>(1); // Thêm state cho trạng thái
  const [currentImage, setCurrentImage] = useState<string>('');
  const [newImage, setNewImage] = useState<any>(null);

  // Lấy dữ liệu danh mục
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/DanhMuc/${id}`);
        const data = await res.json();

        if (res.ok) {
          setName(data.tenDanhMuc || '');
          setCurrentImage(data.hinhAnh || '');
          setStatus(data.trangThai ?? 1); // Lấy trạng thái từ API
        } else {
          Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tìm thấy danh mục' });
          router.back();
        }
      } catch {
        Toast.show({ type: 'error', text1: 'Lỗi mạng', text2: 'Không thể kết nối server' });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const uri = URL.createObjectURL(file);
          setNewImage({
            uri,
            name: file.name.replace(/\s+/g, '_'),
            type: file.type || 'image/jpeg',
            file,
          });
        }
      };
      input.click();
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Cần quyền',
          text2: 'Vui lòng cho phép truy cập thư viện ảnh',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        setNewImage(result.assets[0]);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập tên danh mục' });
      return;
    }

    setSaving(true);
    const formData = new FormData();

    formData.append('MaDanhMuc', id as string);
    formData.append('TenDanhMuc', name.trim());
    formData.append('HinhAnh', '');
    formData.append('TrangThai', status.toString()); // Gửi trạng thái đã chọn

    if (newImage) {
      if (Platform.OS === 'web') {
        formData.append('imageFile', newImage.file, newImage.name);
      } else {
        let uri = newImage.uri;
        let filename = newImage.uri.split('/').pop() || `image_${Date.now()}.jpg`;
        filename = filename.replace(/\s+/g, '_');
        const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
        const type = ext === 'png' ? 'image/png' : 'image/jpeg';

        formData.append('imageFile', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: filename,
          type,
        } as any);
      }
    }

    try {
      const authHeaders = await AuthService.getAuthHeaders();
      const headers: Record<string, string> = {};
      if (authHeaders['Authorization']) {
        headers['Authorization'] = authHeaders['Authorization'];
      }

      const response = await fetch(`${API_URL}/api/DanhMuc/${id}`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Toast.show({ type: 'success', text1: 'Thành công!', text2: 'Cập nhật thành công!' });
        router.back();
      } else {
        const errorMsg =
          result.message ||
          result.title ||
          (result.errors ? Object.values(result.errors).flat().join(', ') : 'Cập nhật thất bại');
        Toast.show({ type: 'error', text1: 'Lỗi', text2: errorMsg });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Lỗi mạng', text2: 'Không thể kết nối server' });
    } finally {
      setSaving(false);
    }
  };

  if (isAuthLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.section}>
            <View style={styles.header}>
              <Text style={styles.sectionTitle}>Chỉnh sửa danh mục</Text>
            </View>

            <Input
              label="Tên danh mục"
              placeholder="Ví dụ: Áo thun, Nike, #summer2025..."
              value={name}
              onChangeText={setName}
            />

            {/* Phần chọn trạng thái */}
            <Text style={styles.label}>Trạng thái</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[styles.statusOption, status === 1 && styles.statusOptionActive]}
                onPress={() => setStatus(1)}
              >
                <View style={[styles.radio, status === 1 && styles.radioActive]}>
                  {status === 1 && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.statusText, status === 1 && styles.statusTextActive]}>
                  Hoạt động
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statusOption, status === 0 && styles.statusOptionActive]}
                onPress={() => setStatus(0)}
              >
                <View style={[styles.radio, status === 0 && styles.radioActive]}>
                  {status === 0 && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.statusText, status === 0 && styles.statusTextActive]}>
                  Vô hiệu hóa
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Hình ảnh hiện tại</Text>
            {currentImage ? (
              <Image
                source={{ uri: `${API_URL}${currentImage}` }}
                style={styles.currentImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.noImage}>Chưa có ảnh</Text>
            )}

            <Text style={styles.label}>Thay đổi ảnh (tùy chọn)</Text>
            {newImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: newImage.uri }} style={styles.previewImg} resizeMode="cover" />
                <TouchableOpacity onPress={() => setNewImage(null)} style={styles.removeBtn}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
                <ImageIcon size={40} color={colors.primary} />
                <Text style={styles.uploadText}>Chọn ảnh mới</Text>
                <Text style={styles.uploadHint}>Tỷ lệ 1:1 • JPG, PNG, WebP</Text>
              </TouchableOpacity>
            )}
          </Card>

          <View style={styles.actions}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={() => router.back()}
              disabled={saving}
              style={styles.btn}
            />
            <Button
              title={saving ? 'Đang lưu...' : 'Cập nhật'}
              onPress={handleSave}
              disabled={saving}
              style={styles.btn}
            />
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textLight, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8, marginRight: 12 },
  section: { padding: 20, marginBottom: 16, borderRadius: 18 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  label: { fontSize: 15, fontWeight: '600', color: colors.textLight, marginTop: 24, marginBottom: 12 },
  
  // Styles cho phần chọn trạng thái
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  statusOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textLight,
  },
  statusTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  currentImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 12 },
  noImage: { color: colors.textLight, fontStyle: 'italic', textAlign: 'center', padding: 20 },
  uploadBox: {
    borderWidth: 2.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 60,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  uploadText: { marginTop: 16, color: colors.primary, fontWeight: '600', fontSize: 17 },
  uploadHint: { marginTop: 8, color: colors.textLight, fontSize: 13 },
  imagePreview: { position: 'relative', borderRadius: 20, overflow: 'hidden', elevation: 6 },
  previewImg: { width: '100%', height: 280 },
  removeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 12,
    borderRadius: 30,
  },
  actions: { flexDirection: 'row', marginTop: 24, marginBottom: 60, gap: 16 },
  btn: { flex: 1, paddingVertical: 16 },
});