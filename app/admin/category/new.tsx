// app/admin/category/new.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { X, Check, Image as ImageIcon } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { AuthService } from '@/src/services/authService';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.5:5083';

const types = [
  { id: 1, label: 'Loại sản phẩm', color: '#3b82f6' },
  { id: 2, label: 'Thương hiệu',   color: '#10b981' },
  { id: 3, label: 'Hashtag',       color: '#8b5cf6' },
];

export default function NewCategoryScreen() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useUserStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<1 | 2 | 3>(1);
  const [image, setImage] = useState<any>(null); // uri + file (web) hoặc asset (mobile)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user?.isAdmin) {
      router.replace('/');
    }
  }, [user, isAuthLoading]);

  // Hàm chọn ảnh - hỗ trợ cả mobile và web
  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // Web: dùng input file ẩn
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const uri = URL.createObjectURL(file);
          setImage({
            uri,
            name: file.name.replace(/\s+/g, '_'), // thay khoảng trắng bằng _
            type: file.type || 'image/jpeg',
            file, // giữ nguyên để gửi FormData
          });
        }
      };
      input.click();
    } else {
      // Mobile: dùng expo-image-picker
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Cần quyền truy cập',
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
        setImage(result.assets[0]);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập tên danh mục',
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();

    formData.append('TenDanhMuc', name.trim());
    formData.append('LoaiDanhMuc', type.toString());
    formData.append('HinhAnh', ''); // luôn gửi rỗng như curl
    formData.append('TrangThai', '1');

    if (image) {
      if (Platform.OS === 'web') {
        // Web: dùng file gốc
        formData.append('imageFile', image.file, image.name);
      } else {
        // Mobile
        let uri = image.uri;
        let filename = image.uri.split('/').pop() || `image_${Date.now()}.jpg`;
        filename = filename.replace(/\s+/g, '_');

        const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

        formData.append('imageFile', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: filename,
          type: mimeType,
        } as any);
      }
    }

    try {
      const authHeaders = await AuthService.getAuthHeaders();
      const headers: Record<string, string> = {};
      if (authHeaders['Authorization']) {
        headers['Authorization'] = authHeaders['Authorization'];
      }

      const response = await fetch(`${API_URL}/api/DanhMuc`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Thành công!',
          text2: 'Tạo danh mục thành công!',
        });
        router.back();
      } else {
        console.log('Server error:', result);
        let errorMsg = 'Lỗi không xác định';
        if (result.errors && typeof result.errors === 'object') {
          errorMsg = Object.values(result.errors).flat().join(', ');
        } else if (result.title) {
          errorMsg = result.title;
        }
        Toast.show({
          type: 'error',
          text1: 'Tạo thất bại',
          text2: errorMsg,
        });
      }
    } catch (err) {
      console.error('Network error:', err);
      Toast.show({
        type: 'error',
        text1: 'Lỗi mạng',
        text2: 'Không thể kết nối đến server',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
        <SafeAreaView style={styles.container}>
             <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                 <ActivityIndicator size="large" color={colors.primary} />
             </View>
        </SafeAreaView>
    );
  }

  if (!user?.isAdmin) return null;

  const handleBack = () => {
      router.push('/admin/categorys');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Tạo danh mục mới</Text>

            <Input
              label="Tên danh mục"
              placeholder="Ví dụ: Áo thun, Nike, #summer2025..."
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Loại danh mục</Text>
            <View style={styles.typeGrid}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeItem, type === t.id && styles.typeItemActive]}
                  onPress={() => setType(t.id as 1 | 2 | 3)}
                >
                  <Text style={[styles.typeLabel, type === t.id && styles.typeLabelActive]}>
                    {t.label}
                  </Text>
                  {type === t.id && <Check size={20} color="#fff" style={styles.checkIcon} />}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Hình ảnh (tùy chọn)</Text>
            {image ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: image.uri }} style={styles.previewImg} resizeMode="cover" />
                <TouchableOpacity onPress={() => setImage(null)} style={styles.removeBtn}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
                <ImageIcon size={40} color={colors.primary} />
                <Text style={styles.uploadText}>Chọn ảnh từ thư viện</Text>
                <Text style={styles.uploadHint}>Tỷ lệ 1:1 • JPG, PNG, WebP</Text>
              </TouchableOpacity>
            )}
          </Card>

          <View style={styles.actions}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={handleBack}
              disabled={loading}
              style={styles.btn}
            />
            <Button
              title={loading ? 'Đang tạo...' : 'Tạo danh mục'}
              onPress={handleSave}
              disabled={loading}
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
  section: { padding: 20, marginBottom: 16, borderRadius: 18 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: colors.textLight, marginTop: 24, marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  typeItem: {
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
    minWidth: 110,
    alignItems: 'center',
  },
  typeItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeLabel: { fontSize: 14, color: colors.textLight },
  typeLabelActive: { color: '#fff', fontWeight: '600' },
  checkIcon: { position: 'absolute', top: 10, right: 10 },
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