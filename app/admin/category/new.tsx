// app/admin/category/new.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.5:5083';

const types = [
  { id: 1, label: 'Loại sản phẩm', color: '#3b82f6' },
  { id: 2, label: 'Thương hiệu',   color: '#10b981' },
  { id: 3, label: 'Hashtag',       color: '#8b5cf6' },
];

export default function NewCategoryScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  if (!user?.isAdmin) { router.replace('/'); return null; }

  const [name, setName] = useState('');
  const [type, setType] = useState<1 | 2 | 3>(1);
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
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
      setImage(result.assets[0]);
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

    // ĐÚNG 100% NHƯ CURL CỦA BẠN – KHÔNG THIẾU FIELD NÀO
    formData.append('TenDanhMuc', name.trim());
    formData.append('LoaiDanhMuc', type.toString());
    formData.append('HinhAnh', '');
    formData.append('TrangThai', '1');

    if (image) {
      const uri = image.uri;
      const filename = uri.split('/').pop()!;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const type = ext === 'png' ? 'image/png' : 'image/jpeg';

      formData.append('imageFile', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type,
      } as any);
    }

    try {
      const response = await fetch(`${API_URL}/api/DanhMuc`, {
        method: 'POST',
        body: formData,
        // KHÔNG ĐƯỢC ĐẶT Content-Type – trình duyệt tự thêm boundary
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
        const errorMsg = result.errors 
          ? Object.values(result.errors).flat().join(', ')
          : result.title || 'Lỗi không xác định';
        Toast.show({
          type: 'error',
          text1: 'Tạo thất bại',
          text2: errorMsg,
        });
      }
    } catch (err) {
      console.log('Network error:', err);
      Toast.show({
        type: 'error',
        text1: 'Lỗi mạng',
        text2: 'Không thể kết nối đến server',
      });
    } finally {
      setLoading(false);
    }
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
              {types.map(t => (
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
                <Text style={styles.uploadHint}>Tỷ lệ 1:1 • Tối đa 5MB</Text>
              </TouchableOpacity>
            )}
          </Card>

          <View style={styles.actions}>
            <Button title="Hủy" variant="outline" onPress={() => router.back()} disabled={loading} style={styles.btn} />
            <Button
              title={loading ? "Đang tạo..." : "Tạo danh mục"}
              onPress={handleSave}
              disabled={loading}
              style={styles.btn}
            />
          </View>
        </View>
      </ScrollView>
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
  typeItem: { paddingHorizontal: 22, paddingVertical: 15, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, position: 'relative', minWidth: 110, alignItems: 'center' },
  typeItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeLabel: { fontSize: 14, color: colors.textLight },
  typeLabelActive: { color: '#fff', fontWeight: '600' },
  checkIcon: { position: 'absolute', top: 10, right: 10 },
  uploadBox: { borderWidth: 2.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 20, paddingVertical: 60, alignItems: 'center', backgroundColor: colors.card },
  uploadText: { marginTop: 16, color: colors.primary, fontWeight: '600', fontSize: 17 },
  uploadHint: { marginTop: 8, color: colors.textLight, fontSize: 13 },
  imagePreview: { position: 'relative', borderRadius: 20, overflow: 'hidden', elevation: 6 },
  previewImg: { width: '100%', height: 280 },
  removeBtn: { position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(0,0,0,0.75)', padding: 12, borderRadius: 30 },
  actions: { flexDirection: 'row', marginTop: 24, marginBottom: 60, gap: 16 },
  btn: { flex: 1, paddingVertical: 16 },
});