// app/admin/category/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Upload, X, Check, Image as ImageIcon, ArrowLeft } from 'lucide-react-native';
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

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<1 | 2 | 3>(1);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [newImage, setNewImage] = useState<any>(null);

  // Lấy dữ liệu danh mục
  useEffect(() => {
    if (!user?.isAdmin) {
      router.replace('/');
      return;
    }

    const fetchCategory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/DanhMuc/${id}`);
        const data = await res.json();

        if (res.ok) {
          setName(data.tenDanhMuc);
          setType(data.loaiDanhMuc);
          setCurrentImage(data.hinhAnh || '');
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy danh mục');
          router.back();
        }
      } catch {
        Alert.alert('Lỗi mạng', 'Không thể kết nối server');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền', 'Vui lòng cho phép truy cập thư viện ảnh');
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
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    setSaving(true);
    const formData = new FormData();

    formData.append('TenDanhMuc', name.trim());
    formData.append('LoaiDanhMuc', type.toString());
    formData.append('HinhAnh', '');
    formData.append('TrangThai', '1');

    if (newImage) {
      const uri = newImage.uri;
      const filename = uri.split('/').pop()!;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      formData.append('imageFile', {
        uri: uri,
        name: filename,
        type: mimeType,
      } as any);
    }

    try {
      const response = await fetch(`${API_URL}/api/DanhMuc/${id}`, {
        method: 'PUT',
        body: formData,
        // Không set Content-Type → trình duyệt tự thêm boundary
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Thành công!', 'Cập nhật danh mục thành công!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        const errorMsg = result.errors
          ? Object.values(result.errors).flat().join(', ')
          : result.title || 'Lỗi không xác định';
        Alert.alert('Cập nhật thất bại', errorMsg);
      }
    } catch (err) {
      console.log('Error:', err);
      Alert.alert('Lỗi mạng', 'Không thể kết nối server');
    } finally {
      setSaving(false);
    }
  };

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
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Chỉnh sửa danh mục</Text>
            </View>

            <Input
              label="Tên danh mục"
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

            <Text style={styles.label}>Hình ảnh hiện tại</Text>
            {currentImage ? (
              <Image
                source={{ uri: API_URL + currentImage }}
                style={styles.currentImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.noImage}>Chưa có ảnh</Text>
            )}

            {newImage && (
              <>
                <Text style={styles.label}>Ảnh mới</Text>
                <View style={styles.imagePreview}>
                  <Image source={{ uri: newImage.uri }} style={styles.previewImg} resizeMode="cover" />
                  <TouchableOpacity onPress={() => setNewImage(null)} style={styles.removeBtn}>
                    <X size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Button
              title="Thay đổi ảnh"
              variant="outline"
              onPress={pickImage}
              leftIcon={<Upload size={20} />}
              style={{ marginTop: 20 }}
            />
          </Card>

          <View style={styles.actions}>
            <Button title="Hủy" variant="outline" onPress={() => router.back()} disabled={saving} style={styles.btn} />
            <Button
              title={saving ? "Đang lưu..." : "Cập nhật"}
              onPress={handleSave}
              disabled={saving}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textLight, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8, marginRight: 12 },
  section: { padding: 20, marginBottom: 16, borderRadius: 18 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  label: { fontSize: 15, fontWeight: '600', color: colors.textLight, marginTop: 24, marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  typeItem: { paddingHorizontal: 22, paddingVertical: 15, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, position: 'relative', minWidth: 110, alignItems: 'center' },
  typeItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeLabel: { fontSize: 14, color: colors.textLight },
  typeLabelActive: { color: '#fff', fontWeight: '600' },
  checkIcon: { position: 'absolute', top: 10, right: 10 },
  currentImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 12 },
  noImage: { color: colors.textLight, fontStyle: 'italic', textAlign: 'center', padding: 20 },
  imagePreview: { position: 'relative', borderRadius: 20, overflow: 'hidden', elevation: 6 },
  previewImg: { width: '100%', height: 280 },
  removeBtn: { position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(0,0,0,0.75)', padding: 12, borderRadius: 30 },
  actions: { flexDirection: 'row', marginTop: 24, marginBottom: 60, gap: 16 },
  btn: { flex: 1, paddingVertical: 16 },
});